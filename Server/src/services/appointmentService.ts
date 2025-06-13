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
  AppointmentStatus,
} from "../models/appointmentSchema";
import Staff, { IStaff, StaffRole } from "../models/staffSchema";

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
 * Finds the best veterinarian for an emergency case.
 *
 * 1. Returns a vet who is completely free right now, if one exists.
 * 2. Otherwise returns the vet with the fewest appointments that **start**
 *    in the next 4 hours, together with the list of those appointments
 *    (so they can be cancelled).
 *
 * @param now Current timestamp (mainly for tests; defaults to `new Date()`).
 */
async function findAvailableVetForEmergency(
  now: Date = new Date()
): Promise<{ vet: IStaff; toCancel: IAppointment[] }> {
  /* 1. all active vets */
  const activeVets = await Staff.find({
  role: { $regex: /^veterinarian$/i },   // i   =  ignore case
  isActive: true
});
  if (activeVets.length === 0) {
    throw new Error("No active veterinarians found.");
  }

  /* 2. four-hour window */
  const windowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  /* 3. build map { vetId -> appointmentsStartingWithin4h } */
  const vetIds: string[] = activeVets.map((v) =>
    (v._id as Types.ObjectId).toString()
  );
  const appointmentsByVet: Record<string, IAppointment[]> = {};
  vetIds.forEach((id) => (appointmentsByVet[id] = []));

  const upcomingAppointments = await Appointment.find({
    staffId: { $in: vetIds },
    date: { $gte: now, $lte: windowEnd },
    status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
  });

  upcomingAppointments.forEach((appt) => {
    const key = (appt.staffId as Types.ObjectId).toString();
    appointmentsByVet[key].push(appt);
  });

  /* 4. vet who is completely free right now */
  for (const vet of activeVets) {
    const key = (vet._id as Types.ObjectId).toString();
    const vetAppointments = appointmentsByVet[key];

    const isFree = vetAppointments.every((appt) => {
      const start = new Date(appt.date);
      const end = new Date(start.getTime() + (appt.duration || 30) * 60000);
      return now < start || now >= end;
    });

    if (isFree) {
      return { vet, toCancel: [] };
    }
  }

  /* 5. vet with fewest upcoming appointments */
  let selectedVet: IStaff | null = null;
  let minCount = Infinity;

  for (const vet of activeVets) {
    const key = (vet._id as Types.ObjectId).toString();
    const count = appointmentsByVet[key].length;
    if (count < minCount) {
      minCount = count;
      selectedVet = vet;
    }
  }

  if (!selectedVet) {
    throw new Error("No available vet found.");
  }

  const vetKey = (selectedVet._id as Types.ObjectId).toString();
  const toCancel = appointmentsByVet[vetKey];

  return { vet: selectedVet, toCancel };
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