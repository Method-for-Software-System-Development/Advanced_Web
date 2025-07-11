/**
 * Appointment service layer.
 * Business logic for creating, cancelling and fetching appointments,
 * plus helper for allocating a veterinarian for emergency cases.
 *
 * All comments/documentation are in English, as requested.
 */

import { Types } from "mongoose";
import Appointment, {
  IAppointment,
  AppointmentStatus,AppointmentType
} from "../models/appointmentSchema";
import Staff, { IStaff, StaffRole } from "../models/staffSchema";
/**
 * Appointment types that must not be cancelled under any circumstance.
 * Currently, only surgeries are considered uncancellable.
 */
const UNCANCELLABLE_TYPES = [
  AppointmentType.SURGERY,
  AppointmentType.EMERGENCY_CARE
];
/**
 * List of staff roles who are eligible to receive appointments.
 * Add or remove roles here as the clinic's structure changes.
 */
const APPOINTMENT_ROLES = [
  "Veterinarian",
  "Chief Veterinarian & Clinic Director"
  
];
/* -------------------------------------------------------------------------- */
/* CRUD helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a new appointment.
 */
async function createAppointment(
  userId: string,
  petId: string,
  staffId: string | null,
  date: Date,
  time: string,
  type: string,
  description: string
): Promise<IAppointment> {
  const appt = new Appointment({
    userId,
    petId,
    staffId,
    date,
    time,
    type,
    description,
    status: AppointmentStatus.SCHEDULED,
  });

  await appt.save();
  return appt;
}

/** Soft-cancels an appointment (status → CANCELLED). */
async function cancelAppointment(
  userId: string,
  appointmentId: string
): Promise<boolean> {
  const { modifiedCount } = await Appointment.updateOne(
    { _id: appointmentId, userId },
    { $set: { status: AppointmentStatus.CANCELLED } }
  );
  return modifiedCount > 0;
}
/**
 * Checks if two time intervals overlap.
 * Returns true if [startA, endA) overlaps with [startB, endB).
 */
function isOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Returns all active veterinarians.
 *
 * This function fetches all staff members who are currently active
 * and have the role of "veterinarian". It returns their names.
 */
async function getActiveVets() {
  // Fetch all active staff members with the role of veterinarian
  return Staff.find({ isActive: true, role: /veterinarian/i }).select("firstName lastName").lean();
}

/**
 * Returns the appointment history for a specific pet.
 */
async function getAppointmentHistoryByPet(petId: string): Promise<IAppointment[]> {
  return Appointment.find({ petId }).sort({ date: -1, time: -1 }).lean();
}
/** Returns all future appointments for a specific user. */
async function getFutureAppointments(
  userId: string
): Promise<IAppointment[]> {
  const now = new Date();
  return Appointment.find({
    userId,
    date: { $gte: now },
    status: { $ne: AppointmentStatus.CANCELLED },
  }).sort({ date: 1, time: 1 });
}
async function getTakenTimesForDay(date: Date): Promise<string[]> {
  const start = new Date(date); start.setHours(0,0,0,0);
  const end   = new Date(start); end.setDate(end.getDate() + 1);

  const appts = await Appointment.find({
    date: { $gte: start, $lt: end },
    status: { $ne: AppointmentStatus.CANCELLED },
  });

  return appts.map(a => a.time);   // e.g. ["09:30", "14:00"]
}

/** Returns the full appointment history for a specific pet. */
async function getAppointmentsByPet(petId: string): Promise<IAppointment[]> {
  return Appointment.find({ petId }).sort({ date: -1, time: -1 });
}

/* -------------------------------------------------------------------------- */
/* Emergency helper                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Finds the best veterinarian for an emergency appointment of 2 hours.
 * - Will never cancel or overlap a SURGERY appointment.
 * - If no vet can be found, throws an error.
 * 
 * @param now The starting time for the emergency appointment (defaults to current time)
 * @returns { vet, toCancel } The selected vet and list of appointments to cancel
 */
async function findAvailableVetForEmergency(
  now: Date = new Date()
): Promise<{ vet: IStaff; toCancel: IAppointment[] }> {
  // 1. Get all active staff eligible for appointments (e.g., veterinarians)
  const activeVets = await Staff.find({
    role: { $in: APPOINTMENT_ROLES },
    isActive: true
  });
  if (activeVets.length === 0) {
    throw new Error("No active veterinarians found.");
  }

  // 2. Define emergency appointment window (2 hours)
  const EMERGENCY_DURATION_MINUTES = 120;
  const emergencyEnd = new Date(now.getTime() + EMERGENCY_DURATION_MINUTES * 60000);

  // 3. For each vet, collect all appointments in the emergency window
  const vetIds: string[] = activeVets.map((v) => (v._id as Types.ObjectId).toString());
  const appointmentsByVet: Record<string, IAppointment[]> = {};
  vetIds.forEach((id) => (appointmentsByVet[id] = []));

  const overlappingAppointments = await Appointment.find({
    staffId: { $in: vetIds },
    // Match any appointment that overlaps the [now, emergencyEnd) window
    $expr: {
      $and: [
        { $lt: ["$date", emergencyEnd] },
        {
          $gt: [
            { $add: ["$date", { $multiply: ["$duration", 60000] }] },
            now
          ]
        }
      ]
    },
    status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] }
  });

  overlappingAppointments.forEach((appt) => {
    const key = (appt.staffId as Types.ObjectId).toString();
    appointmentsByVet[key].push(appt);
  });

  // 4. Look for a vet who is completely free during the emergency window (no overlapping appointments)
  for (const vet of activeVets) {
    const vetKey = (vet._id as Types.ObjectId).toString();
    const vetAppointments = appointmentsByVet[vetKey];
    const hasUncancellableOverlap = vetAppointments.some((appt) => {
      const apptStart = new Date(appt.date);
      const apptEnd = new Date(apptStart.getTime() + (appt.duration || 30) * 60000);
      // Only check for overlap with uncancellable types
      return isOverlapping(now, emergencyEnd, apptStart, apptEnd) &&
        UNCANCELLABLE_TYPES.includes(appt.type);
    });
    if (vetAppointments.length === 0 || !hasUncancellableOverlap) {
      // Vet is either fully available or only has cancellable appointments in the window
      const toCancel = vetAppointments.filter(
        (appt) =>
          isOverlapping(now, emergencyEnd, new Date(appt.date), new Date(new Date(appt.date).getTime() + (appt.duration || 30) * 60000)) &&
          !UNCANCELLABLE_TYPES.includes(appt.type)
      );
      // If there are any overlapping uncancellable appointments, skip this vet
      if (
        vetAppointments.some(
          (appt) =>
            isOverlapping(now, emergencyEnd, new Date(appt.date), new Date(new Date(appt.date).getTime() + (appt.duration || 30) * 60000)) &&
            UNCANCELLABLE_TYPES.includes(appt.type)
        )
      ) {
        continue;
      }
      return { vet, toCancel };
    }
  }

  // 5. If no vet is fully available, select vet with the least amount of cancellable overlapping appointments
  let selectedVet: IStaff | null = null;
  let minCancelable = Infinity;
  let selectedToCancel: IAppointment[] = [];

  for (const vet of activeVets) {
    const vetKey = (vet._id as Types.ObjectId).toString();
    const vetAppointments = appointmentsByVet[vetKey];

    // If any uncancellable (e.g., SURGERY) appointment overlaps the window, skip this vet
    if (
      vetAppointments.some(
        (appt) =>
          isOverlapping(now, emergencyEnd, new Date(appt.date), new Date(new Date(appt.date).getTime() + (appt.duration || 30) * 60000)) &&
          UNCANCELLABLE_TYPES.includes(appt.type)
      )
    ) {
      continue;
    }
    // Count the number of cancellable appointments to be removed
    const toCancel = vetAppointments.filter(
      (appt) =>
        isOverlapping(now, emergencyEnd, new Date(appt.date), new Date(new Date(appt.date).getTime() + (appt.duration || 30) * 60000)) &&
        !UNCANCELLABLE_TYPES.includes(appt.type)
    );
    if (toCancel.length < minCancelable) {
      minCancelable = toCancel.length;
      selectedVet = vet;
      selectedToCancel = toCancel;
    }
  }

  if (!selectedVet) {
    // No suitable vet found — all have uncancellable appointments during the window
    throw new Error("No available vet found for the emergency window.");
  }

  return { vet: selectedVet, toCancel: selectedToCancel };
}


/* -------------------------------------------------------------------------- */
export {
  createAppointment,
  cancelAppointment,
  getFutureAppointments,
  getAppointmentsByPet,
  findAvailableVetForEmergency,
  getTakenTimesForDay,
  getActiveVets,
  getAppointmentHistoryByPet
};