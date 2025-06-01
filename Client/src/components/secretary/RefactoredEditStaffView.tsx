import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Staff, StaffRole } from '../../types'; // Corrected import path
import StaffForm, { StaffFormData } from './staff/StaffForm';
import AvailabilityScheduler from './staff/AvailabilityScheduler';
import ImageUpload from './staff/ImageUpload';
import StaffGrid from './staff/StaffGrid';

// Local definitions for Availability and DayAvailability
export interface DayAvailability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Availability { 
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

const initialFormData: StaffFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: StaffRole.VETERINARIAN,
  specialization: '',
  licenseNumber: '',
  yearsOfExperience: 0,
  description: '',
  imageUrl: '',
  availableSlots: [],
};

const initialAvailability: Availability = {
  monday: { day: 'Monday', startTime: '', endTime: '', isAvailable: false },
  tuesday: { day: 'Tuesday', startTime: '', endTime: '', isAvailable: false },
  wednesday: { day: 'Wednesday', startTime: '', endTime: '', isAvailable: false },
  thursday: { day: 'Thursday', startTime: '', endTime: '', isAvailable: false },
  friday: { day: 'Friday', startTime: '', endTime: '', isAvailable: false },
  saturday: { day: 'Saturday', startTime: '', endTime: '', isAvailable: false },
  sunday: { day: 'Sunday', startTime: '', endTime: '', isAvailable: false },
};

interface RefactoredEditStaffViewProps {
  onBack?: () => void;
}

const RefactoredEditStaffView: React.FC<RefactoredEditStaffViewProps> = ({ onBack }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [availability, setAvailability] = useState<Availability>(initialAvailability);

  const convertAvailabilityToSlots = useCallback((availabilityData: Availability): string[] => {
    const slots: string[] = [];
    (Object.keys(availabilityData) as Array<keyof Availability>).forEach(dayKey => {
      const config = availabilityData[dayKey];
      if (config.isAvailable && config.startTime && config.endTime) {
        slots.push(`${config.day} ${config.startTime}-${config.endTime}`);
      }
    });
    return slots;
  }, []);

  const convertSlotsToAvailability = useCallback((slots: string[]): Availability => {
    const newAvailabilityState: Availability = {
      monday: { day: 'Monday', startTime: '', endTime: '', isAvailable: false },
      tuesday: { day: 'Tuesday', startTime: '', endTime: '', isAvailable: false },
      wednesday: { day: 'Wednesday', startTime: '', endTime: '', isAvailable: false },
      thursday: { day: 'Thursday', startTime: '', endTime: '', isAvailable: false },
      friday: { day: 'Friday', startTime: '', endTime: '', isAvailable: false },
      saturday: { day: 'Saturday', startTime: '', endTime: '', isAvailable: false },
      sunday: { day: 'Sunday', startTime: '', endTime: '', isAvailable: false },
    };
    slots.forEach(slot => {
      const parts = slot.split(' ');
      const dayKey = parts[0].toLowerCase() as keyof Availability;
      if (parts.length > 1 && newAvailabilityState[dayKey]) {
        const times = parts[1].split('-');
        newAvailabilityState[dayKey].isAvailable = true;
        newAvailabilityState[dayKey].startTime = times[0];
        newAvailabilityState[dayKey].endTime = times[1];
      }
    });
    return newAvailabilityState;
  }, []);
  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/staff?includeInactive=true');
      setStaff(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load staff.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);  useEffect(() => {
    if (editingStaff) {
      const newFormData = {
        firstName: editingStaff.firstName,
        lastName: editingStaff.lastName,
        email: editingStaff.email,
        phone: editingStaff.phone,
        role: editingStaff.role,
        specialization: editingStaff.specialization || '',
        licenseNumber: editingStaff.licenseNumber || '',
        yearsOfExperience: editingStaff.yearsOfExperience,
        description: editingStaff.description || '',
        imageUrl: editingStaff.imageUrl || '',
        availableSlots: editingStaff.availableSlots || [],
      };
      setFormData(newFormData);
      setAvailability(convertSlotsToAvailability(editingStaff.availableSlots || []));
      setImagePreview(editingStaff.imageUrl ? `http://localhost:3000${editingStaff.imageUrl}` : null);
      setSelectedImage(null); // Clear any previously selected file when starting an edit
    } else {
      setFormData(initialFormData);
      setAvailability(initialAvailability);
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [editingStaff, convertSlotsToAvailability]);

  const resetForm = () => {
    setEditingStaff(null);
    setSelectedImage(null);
    setImagePreview(null);
    setShowAddForm(false);
    setFormData(initialFormData);
    setAvailability(initialAvailability);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const currentAvailableSlots = convertAvailabilityToSlots(availability);
    const staffDataToSend = new FormData();

    Object.keys(formData).forEach(key => {
      const formKey = key as keyof StaffFormData;
      const value = formData[formKey];

      if (formKey === 'availableSlots') return;
      if (formKey === 'imageUrl') {
        // imageUrl is handled by the 'image' field if a new image is selected,
        // or by directly appending the existing URL if not.
        // If selectedImage is null and editingStaff exists, keep existing image.
        // If selectedImage is null and not editingStaff, it means no image.
        if (!selectedImage && editingStaff?.imageUrl) {
          staffDataToSend.append(formKey, editingStaff.imageUrl);
        } else if (!selectedImage) {
           staffDataToSend.append(formKey, ''); // No new image, and no existing image or creating new
        }
        // If selectedImage is present, it will be appended as 'image' later.
        // The backend should handle 'imageUrl' vs 'image' logic.
        return;
      }

      if (value === null || value === undefined) {
        staffDataToSend.append(formKey, '');
      } else if (typeof value === 'number') {
        staffDataToSend.append(formKey, String(value));
      } else if (typeof value === 'string') {
        staffDataToSend.append(formKey, value);
      } else if (Array.isArray(value)) {
        // This case should ideally not be hit if 'availableSlots' is handled separately
        // and other array types are not expected in StaffFormData.
        // If they are, they need specific handling.
        console.warn(`Unhandled array type for ${formKey} in handleSubmit`);
      } else {
        // This handles enums like StaffRole, assuming they are string-based.
        staffDataToSend.append(formKey, String(value));
      }
    });

    currentAvailableSlots.forEach(slot => staffDataToSend.append('availableSlots[]', slot));

    if (selectedImage) {
      staffDataToSend.append('image', selectedImage);
    } else if (editingStaff && !selectedImage && formData.imageUrl === '') {
      // This case handles removing an existing image
      staffDataToSend.append('imageUrl', '');
    }


    try {
      if (editingStaff) {
        await axios.put(`http://localhost:3000/api/staff/${editingStaff._id}`, staffDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:3000/api/staff', staffDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      loadStaff();
      resetForm();
    } catch (err) {
      setError(`Failed to ${editingStaff ? 'update' : 'add'} staff.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  const handleEdit = (staffMember: Staff) => {
    // Set the editing staff - useEffect will handle populating the form data
    setEditingStaff(staffMember);
    setShowAddForm(true);
  };
  const handleDeactivate = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/staff/${id}`);
      loadStaff();
    } catch (err) {
      setError('Failed to deactivate staff.');
      console.error(err);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await axios.put(`http://localhost:3000/api/staff/${id}/activate`);
      loadStaff();
    } catch (err) {
      setError('Failed to activate staff.');
      console.error(err);
    }
  };  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: name === 'yearsOfExperience' ? parseInt(value) || 0 : value };
      return updated;
    });
  };

  const handleAvailabilityChange = (updatedAvailability: Availability) => {
    setAvailability(updatedAvailability);
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Temporarily set imageUrl to something to indicate a file is staged,
      // or rely on selectedImage state. Backend will use the 'image' field.
      setFormData(prev => ({...prev, imageUrl: file.name})); // Or some placeholder
    } else {
      // If no file is selected (e.g., user cancels file dialog),
      // revert to the existing image if editing, or null if not.
      setSelectedImage(null);
      setImagePreview(editingStaff?.imageUrl ? `http://localhost:3000${editingStaff.imageUrl}` : null);
      setFormData(prev => ({...prev, imageUrl: editingStaff?.imageUrl || ''}));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // When removing an image, we want to ensure the backend knows to remove it.
    // Setting imageUrl to an empty string can signify this.
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input[type="time"]::-webkit-calendar-picker-indicator {
        filter: invert(0.5) sepia(1) saturate(5) hue-rotate(175deg);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading && staff.length === 0) return <p>Loading staff...</p>;
  if (error) return <p>{error}</p>;
  const filteredStaff = showInactive ? staff.filter(s => !s.isActive) : staff.filter(s => s.isActive);
  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-[#FDF6F0] to-[#F5D2B3] dark:from-[#121212] dark:to-[#1a1a1a] min-h-screen text-[#3B3B3B] dark:text-[#FDF6F0]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-[#664147] dark:bg-[#58383E] text-white rounded-lg shadow-md hover:bg-[#58383E] dark:hover:bg-[#664147] transition-colors duration-200 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
          )}
          <h1 className="text-3xl font-bold text-[#664147] dark:text-[#F7C9D3]">Manage Staff</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={() => { 
            if (showAddForm || editingStaff) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className={`px-6 py-3 rounded-lg shadow-md font-semibold transition-colors duration-200 ${
            showAddForm || editingStaff 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {showAddForm && !editingStaff ? 'Cancel Add New Staff' : editingStaff ? 'Cancel Edit / View List' : 'Add New Staff Member'}
        </button>
        
        <button 
          onClick={() => setShowInactive(!showInactive)}
          className="px-6 py-3 bg-[#91C0EC] hover:bg-[#C7DFF5] text-[#664147] rounded-lg shadow-md font-semibold transition-colors duration-200"
        >
          {showInactive ? 'Show Active Staff' : 'Show Inactive Staff'}
        </button>
      </div>      {showAddForm || editingStaff ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-[#664147] dark:text-[#F7C9D3] mb-6">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
          <StaffForm
            formData={formData}
            onInputChange={handleFormInputChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            editingStaff={editingStaff}
            isSubmitting={loading}
          />
          <div className="mt-6">
            <ImageUpload
              imagePreview={imagePreview}
              selectedImage={selectedImage}
              onImageChange={handleImageFileChange}
              onRemoveImage={handleRemoveImage}
            />
          </div>
          <div className="mt-6">
            <AvailabilityScheduler
              availability={availability} 
              onAvailabilityChange={handleAvailabilityChange}
            />
          </div>
        </div>
      ) : (
        <StaffGrid
          staffList={filteredStaff}
          onEditStaff={handleEdit}
          onDeactivateStaff={handleDeactivate}
          onActivateStaff={handleActivate}
          showInactive={showInactive}
        />
      )}
    </div>
  );
};

export default RefactoredEditStaffView;
