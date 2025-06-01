import React from 'react';
import { Staff, StaffRole } from '../../../types';

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
    <div className={`bg-white p-6 rounded-lg shadow-md ${!staff.isActive ? 'opacity-60 border-2 border-red-200' : ''}`}>
      {!staff.isActive && (
        <div className="mb-2 text-sm text-red-600 font-semibold">INACTIVE</div>
      )}
      
      <h2 className="text-xl font-semibold text-[#664147] mb-2">
        {staff.role === StaffRole.VETERINARIAN ? 'Dr. ' : ''}{staff.firstName} {staff.lastName}
      </h2>
      
      {/* Staff Member Profile Image */}
      {staff.imageUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={`http://localhost:3000${staff.imageUrl}`}
            alt={`${staff.firstName} ${staff.lastName}`}
            className="w-24 h-24 object-cover rounded-full border-2 border-gray-300 shadow-sm"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Staff Details */}
      <div className="space-y-1 text-sm">
        <p className="text-gray-700 mb-1">
          <strong>Role:</strong> {formatRole(staff.role)}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Email:</strong> {staff.email}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Phone:</strong> {staff.phone}
        </p>
        
        {staff.specialization && (
          <p className="text-gray-700 mb-1">
            <strong>Specialization:</strong> {staff.specialization}
          </p>
        )}
        
        {staff.licenseNumber && (
          <p className="text-gray-700 mb-1">
            <strong>License:</strong> {staff.licenseNumber}
          </p>
        )}
        
        <p className="text-gray-700 mb-1">
          <strong>Experience:</strong> {staff.yearsOfExperience} years
        </p>
        
        {staff.description && (
          <div className="mt-2">
            <p className="text-gray-700 mb-1"><strong>Description:</strong></p>
            <p className="text-gray-600 text-sm italic bg-gray-50 p-2 rounded">
              {staff.description}
            </p>
          </div>
        )}
        
        {staff.availableSlots.length > 0 && (
          <div className="mt-2">
            <h3 className="text-md font-semibold text-gray-600">Available Slots:</h3>
            <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
              {staff.availableSlots.map((slot, index) => (
                <li key={index}>{slot}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-4 flex justify-end space-x-2">
        <button 
          onClick={() => onEdit(staff)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
        >
          Edit
        </button>
        
        {staff.isActive ? (
          <button 
            onClick={() => onToggleStatus(staff._id, false)}
            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm transition-colors"
          >
            Deactivate
          </button>
        ) : (
          <button 
            onClick={() => onToggleStatus(staff._id, true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
          >
            Activate
          </button>
        )}
      </div>
    </div>
  );
};

export default StaffCard;
