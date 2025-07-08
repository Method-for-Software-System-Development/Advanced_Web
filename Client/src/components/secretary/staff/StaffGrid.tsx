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
          className={`border rounded-lg p-4 shadow-md transition-all duration-200 flex flex-col h-full ${
            staffMember.isActive 
              ? 'bg-gray-50 border-gray-200 dark:bg-darkMode dark:border-gray-600' 
              : 'bg-gray-50 border-red-200 opacity-70 dark:bg-gray-800 dark:border-red-500'
          }`}
        >
          <div className="flex-grow">
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
            
            <div className="text-lg font-bold text-wine mb-2 text-center dark:text-white">
              {staffMember.firstName} {staffMember.lastName}
            </div>
            
            <div className="text-sm text-grayText mb-3 space-y-1 dark:text-lightGrayText">
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
              <div className="text-xs text-gray-500 mb-2 italic bg-gray-100 p-2 rounded dark:text-gray-400 dark:bg-darkModeDark">
                {staffMember.description}
              </div>
            )}
            
            <div className="text-xs text-green-600 mt-2 mb-3 dark:text-green-400">
              <strong>Availability:</strong> {formatAvailability(staffMember.availableSlots || [])}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center mt-auto pt-3">
            <button
              className="cursor-pointer w-30 py-1 bg-wine hover:bg-wineDark text-white text-sm font-semibold rounded-md transition-colors duration-200"
              onClick={() => onEditStaff(staffMember)}
            >
              Edit
            </button>
            {staffMember.isActive ? (
              <button
                className="cursor-pointer w-30 py-1 bg-redButton hover:bg-redButtonDark text-white text-sm font-semibold rounded-md transition-colors duration-200"
                onClick={() => onDeactivateStaff(staffMember._id)}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="cursor-pointer w-30 py-1 bg-greenButton hover:bg-greenButtonDark text-white text-sm font-semibold rounded-md transition-colors duration-200"
                onClick={() => onActivateStaff(staffMember._id)}
              >
                Activate
              </button>
            )}
          </div>
        </div>
      ))}
      {staffList.length === 0 && (
        <div className="col-span-full text-center py-10 text-grayText dark:lightGrayText">
          No {showInactive ? 'inactive' : 'active'} staff members found.
        </div>
      )}
    </div>
  );
};

export default StaffGrid;
