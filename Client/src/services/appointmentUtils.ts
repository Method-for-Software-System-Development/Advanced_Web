import { appointmentService } from './appointmentService';

/**
 * Checks if a pet has an emergency appointment in the last X hours (default 4)
 * @param petId Pet ID
 * @param hours Number of hours to look back
 * @returns true if found, false otherwise
 */
export async function hasRecentEmergencyAppointment(petId: string, hours: number = 4): Promise<boolean> {
  const allPetAppointments = await appointmentService.getAppointmentsByPet(petId);
  const now = new Date();
  const since = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return allPetAppointments.some((app: any) => {
    // Only emergency type
    if (app.type !== 'emergency_care') return false;
    // Only not cancelled
    if (app.status === 'cancelled') return false;
    // Parse date and time
    const appDate = new Date(app.date);
    // Combine date and time (assume app.time is like "10:30 AM")
    const [time, modifier] = app.time.split(' ');
    let [hoursStr, minutesStr] = time.split(':');
    let hoursNum = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (modifier === 'PM' && hoursNum !== 12) hoursNum += 12;
    if (modifier === 'AM' && hoursNum === 12) hoursNum = 0;
    appDate.setHours(hoursNum, minutes, 0, 0);
    return appDate > since && appDate <= now;
  });
}
