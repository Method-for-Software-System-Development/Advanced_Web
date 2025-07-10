
import React from 'react';
import { Staff, Appointment } from '../../../types';

/**
 * TimeSlotSelectorClient
 *
 * Displays a dropdown of available time slots for a selected staff member and date.
 * Filters out unavailable slots based on staff schedule, appointment duration, and existing appointments.
 *
 * Props:
 * - selectedStaff: The staff member to show slots for
 * - selectedDate: The date to show slots for (YYYY-MM-DD)
 * - duration: Appointment duration in minutes
 * - selectedTime: The currently selected time slot
 * - onTimeSelect: Callback when a time is selected
 * - staffAppointments: Array of existing appointments for the staff
 * - isLoading: Whether to show loading state
 */

interface TimeSlotSelectorClientProps {
  /** Staff member to show slots for */
  selectedStaff: Staff | null;
  /** Date to show slots for (YYYY-MM-DD) */
  selectedDate: string;
  /** Appointment duration in minutes */
  duration: number;
  /** Currently selected time slot */
  selectedTime: string;
  /** Callback when a time is selected */
  onTimeSelect: (time: string) => void;
  /** Existing appointments for the staff */
  staffAppointments: Appointment[];
  /** Show loading state */
  isLoading: boolean;
}


const TimeSlotSelectorClient: React.FC<TimeSlotSelectorClientProps> = ({
  selectedStaff,
  selectedDate,
  duration,
  selectedTime,
  onTimeSelect,
  staffAppointments,
  isLoading
}) => {
  /**
   * Parses a time string ("HH:MM" or "H:MM AM/PM") to minutes since midnight.
   */
  const parseTime = (timeStr: string): number => {
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      // 12-hour format
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hours24 = hours;
      if (period === 'PM' && hours !== 12) hours24 += 12;
      if (period === 'AM' && hours === 12) hours24 = 0;
      return hours24 * 60 + minutes;
    } else {
      // 24-hour format
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    }
  };

  /**
   * Formats minutes since midnight to a 12-hour time string (e.g., "2:30 PM").
   */
  const formatTime = (minutes: number): string => {
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    return `${hours12}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  /**
   * Generates all available time slots for the selected staff and date.
   * Excludes slots that are in the past (if today) or that conflict with existing appointments.
   */
  const generateTimeSlots = (): string[] => {
    if (!selectedStaff || !selectedDate) return [];

    // Find the staff's available slot for the selected day
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const staffSlot = selectedStaff.availableSlots.find(slot => slot.startsWith(dayOfWeek));
    if (!staffSlot) return [];

    // Extract start and end time from the slot string
    const timeMatch = staffSlot.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
    if (!timeMatch) return [];
    const [, startTime, endTime] = timeMatch;

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    // Check if selected date is today
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === today.toDateString();
    let currentTimeMinutes = 0;
    if (isToday) {
      currentTimeMinutes = today.getHours() * 60 + today.getMinutes();
    }

    const slots: string[] = [];
    // Generate slots every 30 minutes
    for (let time = startMinutes; time + duration <= endMinutes; time += 30) {
      // Skip past time slots if appointment is for today
      if (isToday && time <= currentTimeMinutes) continue;

      // Check for conflicts with existing appointments
      const hasConflict = staffAppointments.some(apt => {
        const aptTime = parseTime(apt.time);
        const aptEndTime = aptTime + (apt.duration || 30);
        const slotEndTime = time + duration;
        return (time < aptEndTime && slotEndTime > aptTime);
      });
      if (!hasConflict) {
        slots.push(formatTime(time));
      }
    }
    return slots;
  };

  const availableSlots = generateTimeSlots();

  // UI: No staff selected
  if (!selectedStaff) {
    return (
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Time *
        </label>
        <select
          disabled
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:disabled:bg-gray-800 [&>option]:text-xs sm:[&>option]:text-sm [&>option]:py-1.5 sm:[&>option]:py-2"
        >
          <option>Select staff member first</option>
        </select>
      </div>
    );
  }

  // UI: Loading state
  if (isLoading) {
    return (
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Time *
        </label>
        <select
          disabled
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:disabled:bg-gray-800 [&>option]:text-xs sm:[&>option]:text-sm [&>option]:py-1.5 sm:[&>option]:py-2"
        >
          <option>Loading available times...</option>
        </select>
      </div>
    );
  }

  // UI: Main time slot selector
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
        Time *
      </label>
      <select
        value={selectedTime}
        onChange={(e) => onTimeSelect(e.target.value)}
        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 [&>option]:text-xs sm:[&>option]:text-sm [&>option]:py-1.5 sm:[&>option]:py-2"
        required
      >
        <option value="">
          {availableSlots.length > 0 ? 'Select Time' : 'No available times'}
        </option>
        {availableSlots.map(time => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      {availableSlots.length === 0 && selectedStaff && (
        <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
          No available time slots for the selected staff member on this date.
        </p>
      )}
    </div>
  );
};

export default TimeSlotSelectorClient;
