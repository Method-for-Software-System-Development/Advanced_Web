import React, { useState, useEffect } from 'react';
import DashboardButton from './DashboardButton';
import { Staff, StaffRole } from '../../types';
import { staffService } from '../../services/staffService';
import StaffForm from './staff/StaffForm';
import AvailabilityScheduler from './staff/AvailabilityScheduler';
import ImageUpload from './staff/ImageUpload';
import StaffGrid from './staff/StaffGrid';

interface EditStaffViewProps {
  onBack: () => void;
}

const EditStaffView: React.FC<EditStaffViewProps> = ({ onBack }) => {  // CSS to force 24-hour format in time inputs
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide AM/PM selector in WebKit browsers */
      input[type="time"]::-webkit-datetime-edit-ampm-field {
        display: none !important;
        width: 0 !important;
        visibility: hidden !important;
      }
      
      /* Ensure consistent styling */
      input[type="time"]::-webkit-datetime-edit-hour-field,
      input[type="time"]::-webkit-datetime-edit-minute-field {
        padding: 0 !important;
        font-family: monospace;
      }
      
      /* Force 24-hour display */
      input[type="time"] {
        -webkit-appearance: none;
        -moz-appearance: textfield;
        font-family: monospace !important;
        letter-spacing: 0.1em;
      }
      
      /* Remove spinners */
      input[type="time"]::-webkit-inner-spin-button,
      input[type="time"]::-webkit-outer-spin-button {
        -webkit-appearance: none !important;
        display: none !important;
      }
      
      /* Firefox specific fixes */
      @-moz-document url-prefix() {
        input[type="time"] {
          font-family: monospace !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Set locale attributes on all time inputs
    const setTimeInputAttributes = () => {
      const timeInputs = document.querySelectorAll('input[type="time"]');
      timeInputs.forEach((input: any) => {
        input.setAttribute('data-format', '24');
        input.setAttribute('lang', 'en-GB');
        input.setAttribute('step', '900'); // 15-minute intervals
      });
    };
    
    // Set attributes immediately and after a short delay
    setTimeInputAttributes();
    const timer = setTimeout(setTimeInputAttributes, 100);
      return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      clearTimeout(timer);
    };
  }, []); // Re-run when component mounts
  // Days of the week for availability selection
  const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showInactive, setShowInactive] = useState(false); // Hide inactive staff by default
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: StaffRole.VETERINARIAN,
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: 0,
    description: '',
    availableSlots: [] as string[]
  });
  // Availability state for days and times
  const [availability, setAvailability] = useState<{
    [key: string]: {
      selected: boolean;
      startTime: string;
      endTime: string;
    }
  }>({
    Sunday: { selected: false, startTime: '10:00', endTime: '14:00' },
    Monday: { selected: false, startTime: '09:00', endTime: '17:00' },
    Tuesday: { selected: false, startTime: '09:00', endTime: '17:00' },
    Wednesday: { selected: false, startTime: '09:00', endTime: '17:00' },
    Thursday: { selected: false, startTime: '09:00', endTime: '17:00' },
    Friday: { selected: false, startTime: '09:00', endTime: '17:00' },
    Saturday: { selected: false, startTime: '09:00', endTime: '13:00' }
  });
  // Load staff on component mount
  useEffect(() => {
    loadStaff();
  }, []);
  
  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const staffMembers = await staffService.getAllStaffIncludingInactive();
      setStaff(staffMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value
    }));
  };
  
  const handleDaySelectionChange = (day: string, isSelected: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        selected: isSelected
      }
    }));
  };
  const handleTimeChange = (day: string, timeType: 'startTime' | 'endTime', value: string) => {
    // Ensure the value is in proper 24-hour format
    if (!value) {
      setAvailability(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [timeType]: value
        }
      }));
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(value)) {
      return; // Invalid format, ignore
    }

    setAvailability(prev => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [timeType]: value
        }
      };

      // Validate that end time is after start time
      if (timeType === 'startTime' && value >= updated[day].endTime) {
        // Auto-adjust end time to be 1 hour after start time
        const [hours, minutes] = value.split(':').map(Number);
        const endHour = (hours + 1) % 24;
        updated[day].endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else if (timeType === 'endTime' && value <= updated[day].startTime) {
        // Auto-adjust start time to be 1 hour before end time
        const [hours, minutes] = value.split(':').map(Number);
        const startHour = hours > 0 ? hours - 1 : 23;
        updated[day].startTime = `${startHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      return updated;
    });
  };
  // Custom input event handler to ensure 24-hour format input
  const handleTimeInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Force 24-hour format attributes when focused
    const input = e.target;
    input.setAttribute('lang', 'en-GB');
    input.setAttribute('data-format', '24');
    input.step = '900'; // 15-minute intervals
    
    // For WebKit browsers, force 24-hour by setting locale
    if ('webkitRequestFullscreen' in input) {
      input.style.fontFamily = 'monospace';
    }
  };

  // Custom blur handler to validate and format time
  const handleTimeInputBlur = (e: React.FocusEvent<HTMLInputElement>, day: string, timeType: 'startTime' | 'endTime') => {
    const input = e.target;
    let value = input.value;
    
    // If value is in 12-hour format, convert to 24-hour
    if (value.includes('AM') || value.includes('PM') || value.includes('am') || value.includes('pm')) {
      const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/);
      if (match) {
        let [, hours, minutes, period] = match;
        let hour24 = parseInt(hours);
        
        if (period.toLowerCase() === 'pm' && hour24 !== 12) {
          hour24 += 12;
        } else if (period.toLowerCase() === 'am' && hour24 === 12) {
          hour24 = 0;
        }
        
        value = `${hour24.toString().padStart(2, '0')}:${minutes}`;
        input.value = value;
      }
    }
    
    // Trigger the change handler
    handleTimeChange(day, timeType, value);
  };

  // Convert availability object to availableSlots array
  const convertAvailabilityToSlots = () => {
    const slots: string[] = [];
    Object.entries(availability).forEach(([day, config]) => {
      if (config.selected) {
        slots.push(`${day} ${config.startTime}-${config.endTime}`);
      }
    });
    return slots;
  };

  // Convert availableSlots array to availability object
  const convertSlotsToAvailability = (slots: string[]) => {
    const newAvailability = { ...availability };
    
    // Reset all days
    Object.keys(newAvailability).forEach(day => {
      newAvailability[day].selected = false;
    });

    // Parse existing slots
    slots.forEach(slot => {
      const match = slot.match(/^(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      if (match) {
        const [, day, startTime, endTime] = match;
        if (newAvailability[day]) {
          newAvailability[day] = {
            selected: true,
            startTime,
            endTime
          };
        }
      }
    });

    return newAvailability;  };

  // Image handling functions
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: StaffRole.VETERINARIAN,
      specialization: '',
      licenseNumber: '',
      yearsOfExperience: 0,
      description: '',
      availableSlots: []
    });
    setAvailability({
      Sunday: { selected: false, startTime: '10:00', endTime: '14:00' },
      Monday: { selected: false, startTime: '09:00', endTime: '17:00' },
      Tuesday: { selected: false, startTime: '09:00', endTime: '17:00' },
      Wednesday: { selected: false, startTime: '09:00', endTime: '17:00' },
      Thursday: { selected: false, startTime: '09:00', endTime: '17:00' },
      Friday: { selected: false, startTime: '09:00', endTime: '17:00' },
      Saturday: { selected: false, startTime: '09:00', endTime: '13:00' }
    });setEditingStaff(null);
    setShowAddForm(false);
    // Clear image state
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {      // Convert availability to slots before submitting
      const availableSlots = convertAvailabilityToSlots();
      const submitData = {
        ...formData,
        availableSlots,
        isActive: true
      };

      if (editingStaff) {
        // Update existing staff member
        await staffService.updateStaff(editingStaff._id, submitData, selectedImage || undefined);
      } else {
        // Create new staff member
        await staffService.createStaff(submitData, selectedImage || undefined);
      }
      
      resetForm();
      await loadStaff(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save staff member');
      console.error('Error saving staff member:', err);
    }
  };  const handleEdit = (staffMember: Staff) => {
    setFormData({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      specialization: staffMember.specialization || '',
      licenseNumber: staffMember.licenseNumber || '',
      yearsOfExperience: staffMember.yearsOfExperience,
      description: staffMember.description || '',
      availableSlots: staffMember.availableSlots
    });
    
    // Convert availableSlots to availability format
    const newAvailability = convertSlotsToAvailability(staffMember.availableSlots);
    setAvailability(newAvailability);
    
    // Handle existing image
    if (staffMember.imageUrl) {
      setImagePreview(`http://localhost:3000${staffMember.imageUrl}`);
    } else {
      setImagePreview(null);
    }
    setSelectedImage(null); // Clear selected image when editing
    
    setEditingStaff(staffMember);
    setShowAddForm(true);
  };  const handleDeactivate = async (staffId: string) => {
    if (window.confirm('Are you sure you want to deactivate this staff member? They will no longer appear in active listings but can be reactivated later.')) {
      try {
        await staffService.deactivateStaff(staffId);
        await loadStaff(); // Reload the list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deactivate staff member');
        console.error('Error deactivating staff member:', err);
      }
    }
  };

  const handleActivate = async (staffId: string) => {
    try {
      await staffService.activateStaff(staffId);
      await loadStaff(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate staff member');
      console.error('Error activating staff member:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8 text-center">
          <DashboardButton onClick={onBack} label="&larr; Back to Dashboard" />
        </div>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-[#664147]"></div>          <p className="mt-4 text-lg text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <DashboardButton onClick={onBack} label="&larr; Back to Dashboard" />
      </div>
      
      <h1 className="text-3xl font-bold text-[#664147] mb-6 text-center">Manage Staff</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Add Staff Button and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Add New Staff Member
        </button>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show inactive staff members
          </label>
        </div>
      </div>      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-[#664147] mb-4">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name:
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name:
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone:
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role:
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={StaffRole.VETERINARIAN}>Veterinarian</option>
                <option value={StaffRole.VETERINARY_ASSISTANT}>Veterinary Assistant</option>
                <option value={StaffRole.RECEPTIONIST}>Receptionist</option>
                <option value={StaffRole.CLINIC_DIRECTOR}>Clinic Director</option>
              </select>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization:
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                License Number:
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                Years of Experience:
              </label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description:
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                placeholder="Brief description of the staff member's expertise and background..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Image Upload Field */}
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
                Profile Image:
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                
                {imagePreview && (
                  <div className="mt-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="mt-1 text-sm text-gray-500">
                  Optional. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Days & Times:
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto p-3 border border-gray-300 rounded-md">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
                    <label className="flex items-center space-x-2 min-w-[100px]">
                      <input
                        type="checkbox"
                        checked={availability[day].selected}
                        onChange={(e) => handleDaySelectionChange(day, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{day}</span>
                    </label>
                    {availability[day].selected && (
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-600">From:</label>
                        <input
                          type="time"
                          value={availability[day].startTime}
                          onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                          onFocus={handleTimeInputFocus}
                          onBlur={(e) => handleTimeInputBlur(e, day, 'startTime')}
                          min="06:00"
                          max="23:59"
                          step="900"
                          pattern="[0-2][0-9]:[0-5][0-9]"
                          title="Please enter time in 24-hour format (HH:MM)"
                          placeholder="09:00"
                          data-format="24"
                          lang="en-GB"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        />
                        <label className="text-xs text-gray-600">To:</label>
                        <input
                          type="time"
                          value={availability[day].endTime}
                          onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                          onFocus={handleTimeInputFocus}
                          onBlur={(e) => handleTimeInputBlur(e, day, 'endTime')}
                          min="06:00"
                          max="23:59"
                          step="900"
                          pattern="[0-2][0-9]:[0-5][0-9]"
                          title="Please enter time in 24-hour format (HH:MM)"
                          placeholder="17:00"
                          data-format="24"
                          lang="en-GB"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Select the days and set the working hours for this staff member. Times are in 24-hour format (HH:MM).
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                {editingStaff ? 'Update' : 'Add'} Staff Member
              </button>
            </div>
          </form>
        </div>
      )}{/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {(() => {
          const filteredStaff = staff.filter(staffMember => showInactive || staffMember.isActive);
          
          if (staff.length === 0) {
            return (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">No staff members found. Add one to get started!</p>
              </div>
            );
          }
          
          if (filteredStaff.length === 0) {
            return (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">No active staff members found.</p>
                <p className="text-gray-400 text-sm mt-2">Check "Show inactive staff members" to see all staff members.</p>
              </div>
            );
          }
          
          return filteredStaff.map((staffMember) => (
            <div 
              key={staffMember._id} 
              className={`bg-white p-6 rounded-lg shadow-md ${!staffMember.isActive ? 'opacity-60 border-2 border-red-200' : ''}`}
            >
              {!staffMember.isActive && (
                <div className="mb-2 text-sm text-red-600 font-semibold">INACTIVE</div>
              )}
              <h2 className="text-xl font-semibold text-[#664147] mb-2">
                {staffMember.role === StaffRole.VETERINARIAN ? 'Dr. ' : ''}{staffMember.firstName} {staffMember.lastName}
              </h2>
              
              {/* Staff Member Profile Image */}
              {staffMember.imageUrl && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={`http://localhost:3000${staffMember.imageUrl}`}
                    alt={`${staffMember.firstName} ${staffMember.lastName}`}
                    className="w-24 h-24 object-cover rounded-full border-2 border-gray-300 shadow-sm"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <p className="text-gray-700 mb-1"><strong>Role:</strong> {staffMember.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p className="text-gray-700 mb-1"><strong>Email:</strong> {staffMember.email}</p>
              <p className="text-gray-700 mb-1"><strong>Phone:</strong> {staffMember.phone}</p>
              {staffMember.specialization && (
                <p className="text-gray-700 mb-1"><strong>Specialization:</strong> {staffMember.specialization}</p>
              )}
              {staffMember.licenseNumber && (
                <p className="text-gray-700 mb-1"><strong>License:</strong> {staffMember.licenseNumber}</p>
              )}
              <p className="text-gray-700 mb-1"><strong>Experience:</strong> {staffMember.yearsOfExperience} years</p>
              
              {staffMember.description && (
                <div className="mt-2">
                  <p className="text-gray-700 mb-1"><strong>Description:</strong></p>
                  <p className="text-gray-600 text-sm italic bg-gray-50 p-2 rounded">{staffMember.description}</p>
                </div>
              )}
              
              {staffMember.availableSlots.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-md font-semibold text-gray-600">Available Slots:</h3>
                  <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                    {staffMember.availableSlots.map((slot, index) => (
                      <li key={index}>{slot}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  onClick={() => handleEdit(staffMember)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                >
                  Edit
                </button>
                {staffMember.isActive ? (
                  <button 
                    onClick={() => handleDeactivate(staffMember._id)}
                    className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm transition-colors"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button 
                    onClick={() => handleActivate(staffMember._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ));
        })()}
      </div>    </div>
  );
};

export default EditStaffView;
