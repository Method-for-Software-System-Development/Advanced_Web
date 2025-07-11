import React, { useState, useEffect } from 'react';
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

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  yearsOfExperience?: string;
  licenseNumber?: string;
  specialization?: string;
  description?: string;
}

interface StaffFormProps {
  formData: StaffFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  editingStaff: Staff | null;
  isSubmitting?: boolean;
  imageUploadSection?: React.ReactNode;
  availabilitySection?: React.ReactNode;
}

const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  editingStaff,
  isSubmitting = false,
  imageUploadSection,
  availabilitySection
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation functions
  const validateField = (name: string, value: string | number): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          return 'First name must be at least 2 characters long';
        }
        if (typeof value === 'string' && value.trim().length > 50) {
          return 'First name cannot exceed 50 characters';
        }
        if (typeof value === 'string' && !/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      case 'lastName':
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          return 'Last name must be at least 2 characters long';
        }
        if (typeof value === 'string' && value.trim().length > 50) {
          return 'Last name cannot exceed 50 characters';
        }
        if (typeof value === 'string' && !/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      case 'email':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Email is required';
        }
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address';
          }
          if (value.length > 100) {
            return 'Email cannot exceed 100 characters';
          }
        }
        break;      case 'phone':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Phone number is required';
        }
        if (typeof value === 'string') {
          // Remove all non-digit characters for validation
          const digitsOnly = value.replace(/\D/g, '');
          
          // Check if exactly 10 digits
          if (digitsOnly.length !== 10) {
            return 'Phone number must be exactly 10 digits long';
          }
          
          // Check if starts with 05
          if (!digitsOnly.startsWith('05')) {
            return 'Phone number must start with 05';
          }
          
          // Check for valid phone format (allow digits, spaces, hyphens, and dots)
          if (!/^[\d\s\-\.]+$/.test(value.trim())) {
            return 'Phone number can only contain digits, spaces, hyphens, and dots';
          }
        }
        break;

      case 'yearsOfExperience':
        if (typeof value === 'number') {
          if (value < 0) {
            return 'Years of experience cannot be negative';
          }
          if (value > 50) {
            return 'Years of experience cannot exceed 50 years';
          }
        } else if (typeof value === 'string') {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue < 0) {
            return 'Please enter a valid number of years';
          }
          if (numValue > 50) {
            return 'Years of experience cannot exceed 50 years';
          }
        }
        break;

      case 'licenseNumber':
        if (typeof value === 'string' && value.trim() && value.trim().length < 3) {
          return 'License number must be at least 3 characters long';
        }
        if (typeof value === 'string' && value.length > 50) {
          return 'License number cannot exceed 50 characters';
        }
        break;

      case 'specialization':
        if (typeof value === 'string' && value.trim() && value.trim().length < 3) {
          return 'Specialization must be at least 3 characters long';
        }
        if (typeof value === 'string' && value.length > 100) {
          return 'Specialization cannot exceed 100 characters';
        }
        break;

      case 'description':
        if (typeof value === 'string' && value.length > 500) {
          return 'Description cannot exceed 500 characters';
        }
        break;
    }
    return undefined;
  };

  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Call the original handler
    onInputChange(e);
    
    // Validate the field
    const error = validateField(name, name === 'yearsOfExperience' ? parseInt(value) || 0 : value);
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name as keyof ValidationErrors] = error;
      } else {
        delete newErrors[name as keyof ValidationErrors];
      }
      return newErrors;
    });
  };

  // Validate all fields when form data changes (e.g., when editing)
  useEffect(() => {
    const errors: ValidationErrors = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'availableSlots' && key !== 'imageUrl' && key !== 'role') {
        const error = validateField(key, value);
        if (error) {
          errors[key as keyof ValidationErrors] = error;
        }
      }
    });
    
    setValidationErrors(errors);
  }, [formData]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  const getInputClassName = (fieldName: keyof ValidationErrors) => {
    const baseClasses = "mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    const validClasses = "border-gray-300 dark:border-gray-600 focus:ring-[#664147] focus:border-[#664147]";
    const invalidClasses = "border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500";
    
    return `${baseClasses} ${validationErrors[fieldName] ? invalidClasses : validClasses}`;
  };  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChangeWithValidation}
            required
            className={getInputClassName('firstName')}
          />
          {validationErrors.firstName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {validationErrors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChangeWithValidation}
            required
            className={getInputClassName('lastName')}
          />
          {validationErrors.lastName && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {validationErrors.lastName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email: <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChangeWithValidation}
            required
            className={getInputClassName('email')}
          />
          {validationErrors.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone: <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChangeWithValidation}
            placeholder="e.g., 052-123-4567 or 0521234567"
            required
            className={getInputClassName('phone')}
          />
          {validationErrors.phone && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {validationErrors.phone}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role: <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={onInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#664147] focus:border-[#664147] sm:text-sm bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value={StaffRole.CHIEF_VETERINARIAN_AND_CLINIC_DIRECTOR}>Chief Veterinarian & Clinic Director</option>
            <option value={StaffRole.VETERINARIAN}>Veterinarian</option>
            <option value={StaffRole.VETERINARY_ASSISTANT}>Veterinary Assistant</option>
            <option value={StaffRole.RECEPTIONIST}>Receptionist</option>
          </select>
        </div>

        {/* Years of Experience */}
        <div>
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Years of Experience: <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleInputChangeWithValidation}
            min="0"
            max="50"
            required
            className={getInputClassName('yearsOfExperience')}
          />
          {validationErrors.yearsOfExperience && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {validationErrors.yearsOfExperience}
            </p>
          )}
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
          onChange={handleInputChangeWithValidation}
          placeholder="e.g., Small Animal Surgery, Emergency Medicine"
          className={getInputClassName('specialization')}
        />
        {validationErrors.specialization && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {validationErrors.specialization}
          </p>
        )}
      </div>

      {/* License Number */}
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          License Number:
        </label>
        <input
          type="text"
          id="licenseNumber"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChangeWithValidation}
          placeholder="e.g., VET123456"
          className={getInputClassName('licenseNumber')}
        />
        {validationErrors.licenseNumber && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {validationErrors.licenseNumber}
          </p>
        )}
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
          onChange={handleInputChangeWithValidation}
          rows={3}
          maxLength={500}
          placeholder="Brief description of the staff member's expertise and background..."
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm bg-white text-gray-700 placeholder-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500 ${
            validationErrors.description 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-[#664147] focus:border-[#664147]'
          }`}
        />        <div className="mt-1 flex justify-between items-center">
          <p className={`text-sm ${formData.description.length > 450 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {formData.description.length}/500 characters
          </p>
          {validationErrors.description && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="text-red-500">⚠</span>
              {validationErrors.description}
            </p>
          )}
        </div>
      </div>

      {/* Image Upload Section */}
      {imageUploadSection && (
        <div className="mt-6">
          {imageUploadSection}
        </div>
      )}

      {/* Availability Section */}
      {availabilitySection && (
        <div className="mt-6">
          {availabilitySection}
        </div>
      )}      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || hasErrors}
          className={`px-4 py-2 rounded-md shadow-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            hasErrors 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300'
              : 'bg-[#664147] hover:bg-[#58383E] text-white dark:bg-[#58383E] dark:hover:bg-[#4A2F35]'
          }`}
          title={hasErrors ? 'Please fix validation errors before submitting' : ''}
        >
          {isSubmitting ? 'Saving...' : editingStaff ? 'Update' : 'Add'} Staff Member
        </button>
      </div>
      
      {/* Validation Summary */}
      {hasErrors && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-start">
            <span className="text-red-500 text-lg mr-2">⚠</span>
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Please fix the following errors:
              </h4>
              <ul className="mt-1 text-xs text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>
                    <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default StaffForm;
