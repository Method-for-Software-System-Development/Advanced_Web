import React from 'react';
import { Staff, Appointment } from '../../../types';

interface TimeSlotSelectorProps {
  selectedStaff: Staff | null;
  selectedDate: string;
  duration: number;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  staffAppointments: Appointment[];
  isLoading: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedStaff,
  selectedDate,
  duration,
  selectedTime,
  onTimeSelect,
  staffAppointments,
  isLoading
}) => {
  // Generate available time slots
  const generateTimeSlots = (): string[] => {
    if (!selectedStaff || !selectedDate) return [];

    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const staffSlot = selectedStaff.availableSlots.find(slot => slot.startsWith(dayOfWeek));
    
    if (!staffSlot) return [];

    const timeMatch = staffSlot.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
    if (!timeMatch) return [];

    const [, startTime, endTime] = timeMatch;
    const slots: string[] = [];
      const parseTime = (timeStr: string) => {
      // Handle both 24-hour format (HH:MM) and 12-hour format (H:MM AM/PM)
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        // Parse 12-hour format with AM/PM
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hours24 = hours;
        
        if (period === 'PM' && hours !== 12) {
          hours24 += 12;
        } else if (period === 'AM' && hours === 12) {
          hours24 = 0;
        }
        
        return hours24 * 60 + minutes;
      } else {
        // Parse 24-hour format
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      }
    };const formatTime = (minutes: number) => {
      const hours24 = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      // Convert to 12-hour format with AM/PM
      const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      
      return `${hours12}:${mins.toString().padStart(2, '0')} ${ampm}`;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    
    // Generate 30-minute slots
    for (let time = startMinutes; time + duration <= endMinutes; time += 30) {
      const timeSlot = formatTime(time);
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = staffAppointments.some(apt => {
        const aptTime = parseTime(apt.time);
        const aptEndTime = aptTime + (apt.duration || 30);
        const slotEndTime = time + duration;
        
        return (time < aptEndTime && slotEndTime > aptTime);
      });
      
      if (!hasConflict) {
        slots.push(timeSlot);
      }
    }

    return slots;
  };

  const availableSlots = generateTimeSlots();

  if (!selectedStaff) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time *
        </label>
        <select
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] disabled:bg-gray-100"
        >
          <option>Please select a staff member first</option>
        </select>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time *
        </label>
        <select
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] disabled:bg-gray-100"
        >
          <option>Loading available times...</option>
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Time *
      </label>
      <select
        value={selectedTime}
        onChange={(e) => onTimeSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
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
        <p className="mt-1 text-sm text-red-600">
          No available time slots for the selected staff member on this date.
        </p>
      )}
    </div>
  );
};

export default TimeSlotSelector;
