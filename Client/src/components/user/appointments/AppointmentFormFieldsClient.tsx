import React, { useState, useEffect } from 'react';
// Types and time slot selector
import { Staff, AppointmentType } from '../../../types';
import TimeSlotSelector from './TimeSlotSelectorClient';

// Props for the appointment form fields component
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

// AppointmentFormFieldsClient renders the fields for scheduling an appointment
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
  // State to track if we're on mobile view
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Effect to update isMobile state when window size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get available durations for the selected appointment type
  const getAvailableDurations = (appointmentType: AppointmentType) => {
    switch (appointmentType) {
      case AppointmentType.WELLNESS_EXAM:
        return [30, 60];
      default:
        return [30, 60, 90, 120];
    }
  };

  // Get the cost for the selected appointment type
  const getTypeCosts = (appointmentType: AppointmentType) => {
    return 55;
  };

  // Handle appointment type change
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
          <label htmlFor="appointmentDate" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
          <input
            type="date"
            id="appointmentDate"
            name="date"
            value={formData.date}
            onChange={(e) => onInputChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Block past dates
            required
            className="mt-1 block w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
        </div>

        <div>          
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Staff Member *</label>
          <select
            value={formData.staffId}
            onChange={(e) => onStaffChange(e.target.value)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 [&>option]:text-xs sm:[&>option]:text-sm"
            required
          >
            <option value="" disabled>{loadingStaff ? 'Loading staff...' : 'Select Staff Member'}</option>            {staff
              .filter(member => member.role?.toLowerCase() === 'veterinarian' || member.role?.toLowerCase() === 'chief veterinarian & clinic director')
              .map(member => (
                <option key={member._id} value={member._id}>                  
                {member.firstName} {member.lastName} ({
                    // For mobile view, display just 'clinic director' instead of the full title
                    isMobile && member.role?.toLowerCase() === 'chief veterinarian & clinic director' 
                      ? 'clinic director'
                      : member.role
                  })
                </option>
              ))}
          </select>
        </div>

        <div>          
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Appointment Type *</label>
          {/* Hidden input to ensure type is submitted */}
          <input type="hidden" name="type" value={AppointmentType.WELLNESS_EXAM} />
          <input
            type="text"
            value="Wellness Exam"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            disabled
          />
        </div>

        <div>          
          <label htmlFor="durationMinutes" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes) *</label>
          {/* Hidden input to ensure duration is submitted */}
          <input type="hidden" name="duration" value={30} />
          <input
            type="text"
            value="30 minutes"
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            disabled
          />
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
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Cost ($) *</label>
          <div className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
            {formData.cost}
          </div>
        </div>

      </div>      
      <div className="mt-4">
        <label htmlFor="reason" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Visit *</label>
        <textarea
          id="reason"
          name="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}            rows={3}
          maxLength={300}
          className="mt-1 block w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder="e.g., Annual check-up, vaccination, injury assessment..."
        />
      </div>      
      <div className="mt-4">
        <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={(e) => onInputChange('notes', e.target.value)}          rows={2}
          maxLength={200}
          className="mt-1 block w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder="Any other relevant information..."
        />
      </div>
    </div>
  );
};

export default AppointmentFormFieldsClient;
