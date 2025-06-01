import React from 'react';
import { Staff, StaffRole } from '../../../types';

export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  description: string;
  availableSlots: string[];
  imageUrl?: string; // Added imageUrl
}

interface StaffFormProps {
  formData: StaffFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  editingStaff: Staff | null;
  isSubmitting?: boolean;
}

const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  editingStaff,
  isSubmitting = false
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name:
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name:
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value={StaffRole.VETERINARIAN}>Veterinarian</option>
            <option value={StaffRole.VETERINARY_ASSISTANT}>Veterinary Assistant</option>
            <option value={StaffRole.RECEPTIONIST}>Receptionist</option>
            <option value={StaffRole.CLINIC_DIRECTOR}>Clinic Director</option>
          </select>
        </div>

        {/* Years of Experience */}
        <div>
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Years of Experience:
          </label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={onInputChange}
            min="0"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Specialization */}
      <div>
        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Specialization:
        </label>
        <input
          type="text"
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={onInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>      {/* License Number */}
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          License Number:
        </label>
        <input
          type="text"
          id="licenseNumber"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={onInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description:
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          rows={3}
          maxLength={500}
          placeholder="Brief description of the staff member's expertise and background..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#664147] hover:bg-[#58383E] text-white rounded-md shadow-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#F7C9D3] dark:hover:bg-[#EF92A6] dark:text-[#3B3B3B]"
        >
          {isSubmitting ? 'Saving...' : editingStaff ? 'Update' : 'Add'} Staff Member
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
