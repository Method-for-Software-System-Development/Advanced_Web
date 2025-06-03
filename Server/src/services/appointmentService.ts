// services/appointmentService.ts

import Appointment, { IAppointment, AppointmentStatus } from "../models/appointmentSchema";

/**
 * Creates a new appointment for the given user and pet.
 * @param userId      - User's ObjectId
 * @param petId       - Pet's ObjectId
 * @param staffId     - Staff member (vet) ObjectId
 * @param date        - Appointment date (as Date)
 * @param time        - Appointment time (string, e.g. "10:30 AM")
 * @param type        - Appointment type
 * @param description - Reason for the visit
 * @returns The created Appointment document
 */
export async function createAppointment(
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
    status: AppointmentStatus.SCHEDULED
  });
  await appt.save();
  return appt;
}

/**
 * Cancels an appointment by setting its status to "cancelled".
 * @param userId        - User's ObjectId (for security: can only cancel own appointments)
 * @param appointmentId - Appointment's ObjectId
 * @returns True if the appointment was updated, false otherwise
 */
export async function cancelAppointment(userId: string, appointmentId: string): Promise<boolean> {
  const result = await Appointment.updateOne(
    { _id: appointmentId, userId },
    { $set: { status: AppointmentStatus.CANCELLED } }
  );
  return result.modifiedCount > 0;
}

/**
 * Returns all future appointments for the given user.
 * @param userId - User's ObjectId
 * @returns List of Appointment documents
 */
export async function getFutureAppointments(userId: string): Promise<IAppointment[]> {
  const now = new Date();
  return Appointment.find({ userId, date: { $gte: now }, status: { $ne: AppointmentStatus.CANCELLED } }).sort({ date: 1, time: 1 });
}

/**
 * Returns all appointments for a given pet (by petId)
 * @param petId - Pet's ObjectId
 * @returns List of Appointment documents
 */
export async function getAppointmentsByPet(petId: string): Promise<IAppointment[]> {
  return Appointment.find({ petId }).sort({ date: -1, time: -1 });
}
