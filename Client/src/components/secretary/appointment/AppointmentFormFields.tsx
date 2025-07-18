import React from 'react';
import { Staff, AppointmentType } from '../../../types';
import TimeSlotSelector from './TimeSlotSelector';

interface AppointmentFormFieldsProps {
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

const AppointmentFormFields: React.FC<AppointmentFormFieldsProps> = ({
  formData,
  staff,
  selectedStaff,
  onInputChange,
  onStaffChange,
  loadingStaff,
  staffAppointments,
  loadingAppointments
}) => {  const getAvailableDurations = (appointmentType: AppointmentType) => {
    // Define durations based on appointment type
    switch (appointmentType) {
      case AppointmentType.WELLNESS_EXAM:
        return [30, 60];
      case AppointmentType.VACCINATION:
        return [30];
      case AppointmentType.SPAY_NEUTER:
        return [90, 120];
      case AppointmentType.DENTAL_CLEANING:
        return [60, 90];
      case AppointmentType.EMERGENCY_CARE:
        return [30, 60, 90];
      case AppointmentType.SURGERY:
        return [120];
      case AppointmentType.DIAGNOSTIC_IMAGING:
        return [60, 90];
      case AppointmentType.BLOOD_WORK:
        return [30];
      case AppointmentType.FOLLOW_UP:
        return [30, 60];
      case AppointmentType.GROOMING:
        return [60, 90, 120];
      case AppointmentType.BEHAVIORAL_CONSULTATION:
        return [60, 90];
      case AppointmentType.MICROCHIPPING:
        return [30];
      default:
        return [30, 60, 90, 120]; // Default for unknown types
    }
  };

  const getTypeCosts = (appointmentType: AppointmentType) => {
    const costMap = {
      [AppointmentType.WELLNESS_EXAM]: 55,
      [AppointmentType.VACCINATION]: 25,
      [AppointmentType.SPAY_NEUTER]: 200,
      [AppointmentType.DENTAL_CLEANING]: 150,
      [AppointmentType.EMERGENCY_CARE]: 100,
      [AppointmentType.SURGERY]: 300,
      [AppointmentType.DIAGNOSTIC_IMAGING]: 120,
      [AppointmentType.BLOOD_WORK]: 40,
      [AppointmentType.FOLLOW_UP]: 35,
      [AppointmentType.GROOMING]: 50,
      [AppointmentType.BEHAVIORAL_CONSULTATION]: 80,
      [AppointmentType.MICROCHIPPING]: 45
    };
    return costMap[appointmentType] || 55;
  };

  const handleTypeChange = (newType: AppointmentType) => {
    onInputChange('type', newType);
    
    // Update cost based on type
    const newCost = getTypeCosts(newType);
    onInputChange('cost', newCost);    // Update duration to first available option for this type
    const availableDurations = getAvailableDurations(newType);
    if (availableDurations.length > 0 && !availableDurations.includes(formData.duration)) {
      onInputChange('duration', availableDurations[0]);
    }
    
    // Clear selected time since duration may have changed
    onInputChange('time', '');
  };
  return (
    <div className="border-b pb-4 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 dark:text-[#FDF6F0]">Appointment Details</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
          <input
            type="date"
            id="appointmentDate"
            name="date" // Changed from appointmentDate
            value={formData.date} // Changed from formData.appointmentDate
            onChange={(e) => onInputChange('date', e.target.value)} // Changed from handleChange
            min={new Date().toISOString().split('T')[0]} // Block past dates
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          />
        </div>
        
        <div className="col-span-1 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Staff Member *
          </label>
          <select
            value={formData.staffId}
            onChange={(e) => onStaffChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-sm md:text-base"
            required
            disabled={loadingStaff}
          >
            <option value="">{loadingStaff ? 'Loading...' : 'Select Staff Member'}</option>
            {staff
              .filter(member => member.role && (member.role.toLowerCase() === 'veterinarian' || member.role.toLocaleLowerCase() === 'chief veterinarian & clinic director'))
              .map(member => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName} ({member.role})
                </option>
              ))}
          </select>
        </div>
        
        
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Appointment Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as AppointmentType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            required
          >
            {Object.values(AppointmentType).map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>        </div>
        
        <div>
          <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes) *</label>
          <select
            id="durationMinutes"
            name="duration" // Changed from durationMinutes
            value={formData.duration} // Changed from formData.durationMinutes
            onChange={(e) => onInputChange('duration', parseInt(e.target.value))} // Changed from handleChange, added parseInt
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
        />      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Cost ($) *
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  {formData.cost}
                </div>
              </div>

      </div>
        <div className="mt-4">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Visit *</label>
        <textarea
          id="reason"
          name="description" // Changed from reason
          value={formData.description} // Changed from formData.reason
          onChange={(e) => onInputChange('description', e.target.value)} // Changed from handleChange
          rows={3}
          maxLength={300}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder="e.g., Annual check-up, vaccination, injury assessment..."
        />
      </div>

      <div className="mt-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={(e) => onInputChange('notes', e.target.value)} // Changed from handleChange
          rows={2}
          maxLength={200}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
          placeholder="Any other relevant information..."
        />
      </div>
    </div>
  );
};

export default AppointmentFormFields;
