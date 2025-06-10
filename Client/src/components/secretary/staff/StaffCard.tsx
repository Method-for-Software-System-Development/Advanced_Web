import React from 'react';
import { Staff, StaffRole } from '../../../types';
import { API_BASE_URL } from '../../../config/api';

interface StaffCardProps {
  staff: Staff;
  onEdit: (staff: Staff) => void;
  onToggleStatus: (staffId: string, isActive: boolean) => void;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff, onEdit, onToggleStatus }) => {
  const formatRole = (role: StaffRole) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  return (
    <div className={`p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${staff.isActive ? 'bg-white dark:bg-[#664147]' : 'bg-gray-100 opacity-80 dark:bg-gray-800'}`}>
      <div className="flex items-center space-x-4 mb-4">
        {staff.imageUrl ? (
          <img className="h-16 w-16 rounded-full object-cover border-2 border-indigo-300 dark:border-gray-500" src={`${API_BASE_URL}${staff.imageUrl}`} alt={`${staff.firstName} ${staff.lastName}`} />
        ) : (
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-2xl font-semibold dark:bg-gray-600 dark:text-gray-300">
            {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-[#FDF6F0]">{staff.firstName} {staff.lastName}</h2>
          <p className="text-sm text-indigo-600 font-medium dark:text-indigo-400">{formatRole(staff.role)}</p>
          {!staff.isActive && <p className="text-xs text-red-500 font-semibold mt-0.5 dark:text-red-400">(Inactive)</p>}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p><strong className="text-gray-700 dark:text-gray-200">Email:</strong> {staff.email}</p>
        <p><strong className="text-gray-700 dark:text-gray-200">Phone:</strong> {staff.phone}</p>
        {staff.specialization && <p><strong className="text-gray-700 dark:text-gray-200">Specialization:</strong> {staff.specialization}</p>}
        {staff.licenseNumber && <p><strong className="text-gray-700 dark:text-gray-200">License:</strong> {staff.licenseNumber}</p>}
        <p><strong className="text-gray-700 dark:text-gray-200">Experience:</strong> {staff.yearsOfExperience} years</p>
      </div>

      {staff.description && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 italic leading-relaxed dark:text-gray-400">{staff.description}</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1.5 dark:text-gray-300">Availability</h4>
        {staff.availableSlots && staff.availableSlots.length > 0 ? (
          <ul className="space-y-1 text-xs text-green-700 dark:text-green-400">
            {staff.availableSlots.slice(0, 3).map(slot => <li key={slot}>{slot}</li>)}
            {staff.availableSlots.length > 3 && <li className="text-gray-500 dark:text-gray-400">...and more</li>}
          </ul>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">No availability set.</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 items-center">
        <button 
          onClick={() => onEdit(staff)}
          className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          Edit Details
        </button>
        {staff.isActive ? (
          <button 
            onClick={() => onToggleStatus(staff._id, false)}
            className="px-4 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
          >
            Deactivate
          </button>
        ) : (
          <button 
            onClick={() => onToggleStatus(staff._id, true)}
            className="px-4 py-1.5 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-colors dark:bg-green-600 dark:hover:bg-green-700"
          >
            Activate
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffCard;
