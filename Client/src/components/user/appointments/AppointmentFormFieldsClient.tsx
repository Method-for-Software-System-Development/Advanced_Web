import React from 'react';
import { Staff, AppointmentType } from '../../../types';
import TimeSlotSelector from './TimeSlotSelectorClient';

interface AppointmentFormFieldsClientProps {
  formData: {
    date: string;
    staffId: string;
    time: string;
    type: AppointmentType;
    duration: number;
    description: string;
    notes: string;
    cost: number;
  };
  staff: Staff[];
  selectedStaff: Staff | null;
  onInputChange: (field: string, value: any) => void;
  onStaffChange: (staffId: string) => void;
  loadingStaff: boolean;
  staffAppointments: any[];
  loadingAppointments: boolean;
}

const AppointmentFormFieldsClient: React.FC<AppointmentFormFieldsClientProps> = ({
  formData,
  staff,
  selectedStaff,
  onInputChange,
  onStaffChange,
  loadingStaff,
  staffAppointments,
  loadingAppointments
}) => {
  const getAvailableDurations = (appointmentType: AppointmentType) => {
    switch (appointmentType) {
      case AppointmentType.WELLNESS_EXAM:
        return [30, 60];
      default:
        return [30, 60, 90, 120];
    }
  };

  const getTypeCosts = (appointmentType: AppointmentType) => {
    return 55;
  };

  const handleTypeChange = (newType: AppointmentType) => {
    onInputChange('type', newType);
    const newCost = getTypeCosts(newType);
    onInputChange('cost', newCost);
    const availableDurations = getAvailableDurations(newType);
    if (availableDurations.length > 0 && !availableDurations.includes(formData.duration)) {
      onInputChange('duration', availableDurations[0]);
    }
    onInputChange('time', '');
  };

  return (
    <div className="border-b pb-4 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 dark:text-[#FDF6F0]">Appointment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
          <input
            type="date"
            id="appointmentDate"
            name="date"
            value={formData.date}
            onChange={(e) => onInputChange('date', e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Staff Member *</label>
          <select
            value={formData.staffId}
            onChange={(e) => onStaffChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            required
          >
            <option value="" disabled>{loadingStaff ? 'Loading staff...' : 'Select Staff Member'}</option>
            {staff
              .filter(member => member.role?.toLowerCase() === 'veterinarian' || member.role?.toLowerCase() === 'chief veterinarian & clinic director')
              .map(member => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName} ({member.role})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Appointment Type *</label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as AppointmentType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            required
          >
            <option value={AppointmentType.WELLNESS_EXAM}>Wellness Exam</option>
          </select>
        </div>

        <div>
          <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes) *</label>
          <select
            id="durationMinutes"
            name="duration"
            value={formData.duration}
            onChange={(e) => onInputChange('duration', parseInt(e.target.value))}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            {getAvailableDurations(formData.type).map(duration => (
              <option key={duration} value={duration}>
                {duration >= 60 ? `${duration / 60} hour${duration > 60 ? 's' : ''}` : `${duration} minutes`}
              </option>
            ))}
          </select>
        </div>

        <TimeSlotSelector
          selectedStaff={selectedStaff}
          selectedDate={formData.date}
          duration={formData.duration}
          selectedTime={formData.time}
          onTimeSelect={(time) => onInputChange('time', time)}
          staffAppointments={staffAppointments}
          isLoading={loadingAppointments}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Cost ($) *</label>
          <input
            type="number"
            value={formData.cost}
            onChange={(e) => onInputChange('cost', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            min="0"
            step="0.01"
            required
            disabled
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Visit *</label>
        <textarea
          id="reason"
          name="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={3}
          maxLength={300}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder="e.g., Annual check-up, vaccination, injury assessment..."
        />
      </div>

      <div className="mt-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={(e) => onInputChange('notes', e.target.value)}
          rows={2}
          maxLength={200}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder="Any other relevant information..."
        />
      </div>
    </div>
  );
};

export default AppointmentFormFieldsClient;
