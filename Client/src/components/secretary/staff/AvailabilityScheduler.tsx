import React from 'react';
import { Availability, DayAvailability } from '../StaffManagement'; // Import from parent

interface AvailabilitySchedulerProps {
  availability: Availability;
  onAvailabilityChange: (availability: Availability) => void;
}

const weekDays: (keyof Availability)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AvailabilityScheduler: React.FC<AvailabilitySchedulerProps> = ({ availability, onAvailabilityChange }) => {
  const handleDayChange = (day: keyof Availability, field: keyof DayAvailability, value: string | boolean) => {
    const newAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value,
      },
    };
    // If isAvailable is toggled to false, clear times
    if (field === 'isAvailable' && value === false) {
      newAvailability[day].startTime = '';
      newAvailability[day].endTime = '';
    }
    onAvailabilityChange(newAvailability);
  };
  return (    <div className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg mb-5 bg-gray-50 dark:bg-gray-800">
      <h4 className="text-lg font-semibold text-[#664147] dark:text-[#FDF6F0] mb-4">Set Availability</h4>
      {weekDays.map(dayKey => {
        const dayConfig = availability[dayKey];
        return (          <div key={dayKey} className="flex items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
            <label className="min-w-[100px] capitalize text-sm font-medium text-gray-700 dark:text-gray-300">
              {dayConfig.day}
            </label>
            <input
              type="checkbox"
              checked={dayConfig.isAvailable}
              onChange={e => handleDayChange(dayKey, 'isAvailable', e.target.checked)}
              className="ml-3 scale-110 rounded border-gray-300 dark:border-gray-600 text-[#664147] dark:text-[#664147] focus:ring-[#664147] dark:focus:ring-[#664147] dark:bg-gray-700"
            />
            {dayConfig.isAvailable && (
              <>                <input
                  type="time"
                  value={dayConfig.startTime}
                  onChange={e => handleDayChange(dayKey, 'startTime', e.target.value)}
                  className="ml-3 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#664147] focus:border-[#664147] dark:focus:ring-[#664147] dark:focus:border-[#664147] text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  disabled={!dayConfig.isAvailable}
                />
                <span className="mx-2 text-gray-500 dark:text-gray-300">to</span>
                <input
                  type="time"
                  value={dayConfig.endTime}
                  onChange={e => handleDayChange(dayKey, 'endTime', e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#664147] focus:border-[#664147] dark:focus:ring-[#664147] dark:focus:border-[#664147] text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  disabled={!dayConfig.isAvailable}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityScheduler;
