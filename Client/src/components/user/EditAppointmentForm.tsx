import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, Staff } from '../../types';
import staffService from '../../services/staffService';
import appointmentService from '../../services/appointmentService';
import TimeSlotSelector from './appointments/TimeSlotSelectorClient';

interface EditAppointmentFormProps {
  appointment: Appointment;
  onSave: (updated: { staffId: string; date: string; time: string }) => void;
  onCancel: () => void;
}

const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({ appointment, onSave, onCancel }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffId, setStaffId] = useState<string>(typeof appointment.staffId === 'object' ? appointment.staffId._id : appointment.staffId);
  const [date, setDate] = useState<string>(appointment.date.slice(0, 10));
  const [time, setTime] = useState<string>(appointment.time);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffAppointments, setStaffAppointments] = useState<Appointment[]>([]);

  const selectedStaff = useMemo(() => staffList.find(s => s._id === staffId) || null, [staffList, staffId]);

  useEffect(() => {
    setLoadingStaff(true);
    staffService.getAllStaff().then(staff => {
      setStaffList(staff);
      setLoadingStaff(false);
    }).catch(() => {
      setStaffList([]);
      setLoadingStaff(false);
    });
  }, []);

  useEffect(() => {
    if (staffId && date) {
      appointmentService.getAppointmentsByStaff(staffId, date).then(setStaffAppointments).catch(() => setStaffAppointments([]));
    } else {
      setStaffAppointments([]);
    }
  }, [staffId, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate that the selected date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Cannot schedule appointments in the past. Please select a future date.');
      setLoading(false);
      return;
    }
    
    try {
      await onSave({ staffId, date, time });
    } catch (err: any) {
      setError('Failed to update appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">      {/* Error Display */}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>          <label htmlFor="appointmentDate" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
          <input
            type="date"
            id="appointmentDate"
            name="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Block past dates
            required
            className="mt-1 block w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Staff Member *</label>          <select
            value={staffId}
            onChange={e => setStaffId(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 [&>option]:text-xs sm:[&>option]:text-sm [&>option]:py-1.5 sm:[&>option]:py-2"
            required
          >
            <option value="" disabled>{loadingStaff ? 'Loading staff...' : 'Select Staff Member'}</option>
            {staffList
              .filter(member => member.role?.toLowerCase() === 'veterinarian' || member.role?.toLowerCase() === 'chief veterinarian & clinic director')              .map(member => (                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName} {member.role?.toLowerCase().includes('chief') ? '(Clinic Director)' : `(${member.role})`}
                </option>
              ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <TimeSlotSelector
            selectedStaff={selectedStaff}
            selectedDate={date}
            duration={appointment.duration}
            selectedTime={time}
            onTimeSelect={setTime}
            staffAppointments={staffAppointments}
            isLoading={loadingStaff}
          />
        </div>
      </div>      <div className="flex gap-2 mt-4 justify-center sm:justify-start">
        <button
          type="submit"
          className="px-3 py-1 bg-[#664147] hover:bg-[#58383E] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#664147] focus:ring-offset-2 w-[50%] sm:w-auto"
          disabled={loading}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-[#664147] hover:bg-[#58383E] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#664147] focus:ring-offset-2 w-[50%] sm:w-auto"
          disabled={loading}
        >
          Return
        </button>
      </div>
    </form>
  );
};

export default EditAppointmentForm;

