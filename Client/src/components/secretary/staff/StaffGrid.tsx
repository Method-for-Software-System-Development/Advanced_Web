import React from 'react';
import { Staff } from '../../../types';
import { API_BASE_URL } from '../../../config/api';

interface StaffGridProps {
  staffList: Staff[];
  onEditStaff: (staffMember: Staff) => void;
  onDeactivateStaff: (id: string) => void;
  onActivateStaff: (id: string) => void;
  showInactive: boolean;
}

const StaffGrid: React.FC<StaffGridProps> = ({
  staffList,
  onEditStaff,
  onDeactivateStaff,
  onActivateStaff,
  showInactive,
}) => {
  const formatAvailability = (slots: string[]) => {
    if (!slots || slots.length === 0) return 'No availability set';
    return slots.slice(0, 2).join(', ') + (slots.length > 2 ? '...' : '');
  };

  return (    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {staffList.map((staffMember) => (
        <div
          key={staffMember._id}
          className={`border rounded-lg p-4 shadow-md transition-all duration-200 ${
            staffMember.isActive 
              ? 'bg-white border-gray-200 dark:bg-[#664147] dark:border-gray-600' 
              : 'bg-gray-50 border-red-200 opacity-70 dark:bg-gray-800 dark:border-red-500'
          }`}
        >
          {!staffMember.isActive && (
            <div className="mb-2 text-sm text-red-600 font-semibold dark:text-red-400">INACTIVE</div>
          )}
          
          {staffMember.imageUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={`${API_BASE_URL}${staffMember.imageUrl}`}
                alt={`${staffMember.firstName} ${staffMember.lastName}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 shadow-sm dark:border-gray-500"
              />
            </div>
          )}
          
          <div className="text-lg font-bold text-[#664147] mb-2 text-center dark:text-[#FDF6F0]">
            {staffMember.firstName} {staffMember.lastName}
          </div>
          
          <div className="text-sm text-gray-600 mb-3 space-y-1 dark:text-gray-300">
            <div><strong>Role:</strong> {staffMember.role}</div>
            <div><strong>Email:</strong> {staffMember.email}</div>
            <div><strong>Phone:</strong> {staffMember.phone}</div>
            {staffMember.specialization && (
              <div><strong>Specialization:</strong> {staffMember.specialization}</div>
            )}
            {staffMember.yearsOfExperience > 0 && (
              <div><strong>Experience:</strong> {staffMember.yearsOfExperience} years</div>
            )}
            {staffMember.licenseNumber && (
              <div><strong>License:</strong> {staffMember.licenseNumber}</div>
            )}
          </div>
          
          {staffMember.description && (
            <div className="text-xs text-gray-500 mb-2 italic bg-gray-50 p-2 rounded dark:text-gray-400 dark:bg-gray-700">
              {staffMember.description}
            </div>
          )}
          
          <div className="text-xs text-green-600 mt-2 mb-3 dark:text-green-400">
            <strong>Availability:</strong> {formatAvailability(staffMember.availableSlots || [])}
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              className="px-3 py-1 bg-[#664147] hover:bg-[#58383E] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 dark:bg-[#58383E] dark:hover:bg-[#4A2F35]"
              onClick={() => onEditStaff(staffMember)}
            >
              Edit
            </button>
            {staffMember.isActive ? (
              <button
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 dark:bg-orange-600 dark:hover:bg-orange-700"
                onClick={() => onDeactivateStaff(staffMember._id)}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 dark:bg-green-600 dark:hover:bg-green-700"
                onClick={() => onActivateStaff(staffMember._id)}
              >
                Activate
              </button>
            )}
          </div>
        </div>
      ))}
      {staffList.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
          No {showInactive ? 'inactive' : 'active'} staff members found.
        </div>
      )}
    </div>
  );
};

export default StaffGrid;
