import React, { useState } from 'react';
import { Availability, DayAvailability } from '../StaffManagement'; // Import from parent

interface AvailabilitySchedulerProps {
  availability: Availability;
  onAvailabilityChange: (availability: Availability) => void;
}

interface ValidationErrors {
  [key: string]: {
    startTime?: string;
    endTime?: string;
    general?: string;
  } | undefined;
}

const weekDays: (keyof Availability)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AvailabilityScheduler: React.FC<AvailabilitySchedulerProps> = ({ availability, onAvailabilityChange }) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateTimeSlot = (day: keyof Availability, startTime: string, endTime: string) => {
    const errors: { startTime?: string; endTime?: string; general?: string } = {};
    
    // Check if start time is provided when day is available
    if (availability[day].isAvailable && !startTime) {
      errors.startTime = 'Start time is required';
    }
    
    // Check if end time is provided when day is available
    if (availability[day].isAvailable && !endTime) {
      errors.endTime = 'End time is required';
    }
    
    // Check if end time is after start time
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      
      if (end <= start) {
        errors.endTime = 'End time must be after start time';
      }
      
      // Check for reasonable working hours (not too long)
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours > 12) {
        errors.general = 'Working hours cannot exceed 12 hours per day';
      }
      
      // Check for minimum working time (at least 30 minutes)
      if (diffHours < 0.5) {
        errors.general = 'Working hours must be at least 30 minutes';
      }
    }
    
    return errors;
  };
  const updateValidationErrors = (day: keyof Availability, errors: { startTime?: string; endTime?: string; general?: string }) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (Object.keys(errors).length > 0) {
        newErrors[day] = errors;
      } else {
        delete newErrors[day];
      }
      return newErrors;
    });
  };

  const handleDayChange = (day: keyof Availability, field: keyof DayAvailability, value: string | boolean) => {
    const newAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value,
      },
    };
    
    // If isAvailable is toggled to false, clear times and validation errors
    if (field === 'isAvailable' && value === false) {
      newAvailability[day].startTime = '';
      newAvailability[day].endTime = '';
      updateValidationErrors(day, {});
    } else if (field === 'isAvailable' && value === true) {
      // When enabling a day, validate if there are existing times
      const errors = validateTimeSlot(day, newAvailability[day].startTime, newAvailability[day].endTime);
      updateValidationErrors(day, errors);
    } else if (field === 'startTime' || field === 'endTime') {
      // Validate time inputs in real-time
      const startTime = field === 'startTime' ? value as string : newAvailability[day].startTime;
      const endTime = field === 'endTime' ? value as string : newAvailability[day].endTime;
      const errors = validateTimeSlot(day, startTime, endTime);
      updateValidationErrors(day, errors);
    }
    
    onAvailabilityChange(newAvailability);
  };return (
    <div className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg mb-5 bg-gray-50 dark:bg-gray-800">
      <h4 className="text-lg font-semibold text-[#664147] dark:text-[#FDF6F0] mb-4">Set Availability</h4>
      {weekDays.map(dayKey => {
        const dayConfig = availability[dayKey];
        return (
          <div key={dayKey} className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
            {/* Day header with checkbox */}
            <div className="flex items-center mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dayConfig.isAvailable}
                  onChange={e => handleDayChange(dayKey, 'isAvailable', e.target.checked)}
                  className="mr-3 scale-110 rounded border-gray-300 dark:border-gray-600 text-[#664147] focus:ring-[#664147] dark:focus:ring-[#664147] dark:bg-gray-700"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {dayConfig.day}
                </span>
              </label>
            </div>
              {/* Time inputs - responsive layout */}
            {dayConfig.isAvailable && (
              <div className="ml-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400 min-w-[35px]">From:</label>
                    <input
                      type="time"
                      value={dayConfig.startTime}
                      onChange={e => handleDayChange(dayKey, 'startTime', e.target.value)}
                      className={`px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 w-full sm:w-auto ${
                        validationErrors[dayKey]?.startTime 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-[#664147] focus:border-[#664147] dark:focus:ring-[#664147] dark:focus:border-[#664147]'
                      }`}
                      disabled={!dayConfig.isAvailable}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400 min-w-[20px]">To:</label>
                    <input
                      type="time"
                      value={dayConfig.endTime}
                      onChange={e => handleDayChange(dayKey, 'endTime', e.target.value)}
                      className={`px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 w-full sm:w-auto ${
                        validationErrors[dayKey]?.endTime 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-[#664147] focus:border-[#664147] dark:focus:ring-[#664147] dark:focus:border-[#664147]'
                      }`}
                      disabled={!dayConfig.isAvailable}
                    />
                  </div>
                </div>
                
                {/* Validation Error Messages */}
                {validationErrors[dayKey] && (
                  <div className="mt-2 space-y-1">
                    {validationErrors[dayKey]?.startTime && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {validationErrors[dayKey]?.startTime}
                      </p>
                    )}
                    {validationErrors[dayKey]?.endTime && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {validationErrors[dayKey]?.endTime}
                      </p>
                    )}
                    {validationErrors[dayKey]?.general && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {validationErrors[dayKey]?.general}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityScheduler;
