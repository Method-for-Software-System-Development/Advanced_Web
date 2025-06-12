import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, AppointmentType, Staff, Patient, Pet } from '../../types';
import appointmentService from '../../services/appointmentService';
console.log("DEBUG-IMPORT", appointmentService);
import staffService from '../../services/staffService';
import PetSelectionClient from './appointments/PetSelectionClient';
import AppointmentFormFieldsClient from './appointments/AppointmentFormFieldsClient';
import { API_URL } from '../../config/api';
import UserNavButton from './UserNavButton';
import { useNavigate } from 'react-router-dom';

interface AddAppointmentFormToClientProps {
  onClose: () => void;
  onAppointmentAdded: (newAppointment: Appointment) => void;
  selectedDate: Date;
}

const AddAppointmentFormToClient: React.FC<AddAppointmentFormToClientProps> = ({ 
  onClose, 
  onAppointmentAdded, 
  selectedDate 
}) => {
  const navigate = useNavigate();

  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<Partial<Appointment>>({
    date: formatDateToYYYYMMDD(selectedDate),
    time: '',
    staffId: '',
    type: AppointmentType.WELLNESS_EXAM,
    duration: 30,
    status: AppointmentStatus.SCHEDULED,
    notes: '',
    cost: 55,
    description: '',
  });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffAppointments, setStaffAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Function to show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Client and pet state
  const [clientPets, setClientPets] = useState<Pet[]>([]);
  const [client, setClient] = useState<Patient | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    () => {
      const clientRaw = localStorage.getItem("client");
      if (clientRaw) {
        try {
          const parsedClient = JSON.parse(clientRaw);
          if (parsedClient.pets && parsedClient.pets.length > 0) {
            return parsedClient.pets[0]._id;
          }
        } catch {}
      }
      return null;
    }  );

useEffect(() => {
  try {
    const clientRaw = localStorage.getItem("client");
    if (!clientRaw) {
      setError('No client info found.');
      return;
    }
    const parsedClient = JSON.parse(clientRaw);
    setClient(parsedClient);
    if (parsedClient.pets && parsedClient.pets.length > 0) {
      let petsArr = parsedClient.pets;
      // If pets are strings (IDs), fetch full pet objects
      if (typeof petsArr[0] === 'string') {
        // Only send valid 24-char ObjectID strings
        const validPetIds = petsArr.filter((id: string) => typeof id === 'string' && id.length === 24);
        if (validPetIds.length === 0) {
          setClientPets([]); setSelectedPetId(null);
          return;
        }
        fetch(`${API_URL}/pets/byIds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: validPetIds }),
        })
          .then((res) => res.json())
          .then((data) => {
            // Filter only active pets
            const activePets = Array.isArray(data) ? data.filter((pet: any) => pet.isActive !== false) : [];
            setClientPets(activePets);
            if (activePets.length > 0) {
              setSelectedPetId(activePets[0]._id);
            } else {
              setSelectedPetId(null);
            }
          })
          .catch(() => {
            setClientPets([]);
            setSelectedPetId(null);
            setError('Failed to fetch pets.');
          });
      } else {
        // Already full pet objects
        // Filter only active pets
        const activePets = petsArr.filter((pet: any) => pet.isActive !== false);
        setClientPets(activePets);
        if (activePets.length > 0) {
          setSelectedPetId(activePets[0]._id);
        } else {
          setSelectedPetId(null);
        }
      }
    } else {
      setClientPets([]);
      setSelectedPetId(null);
    }
  } catch (err) {
    setError('Failed to load client info.');
  }
}, []);

  // Load staff appointments when staff member or date changes
  useEffect(() => {
    if (selectedStaff && formData.date) {
      loadStaffAppointments();
    } else {
      setStaffAppointments([]);
    }
  }, [selectedStaff, formData.date]);

  // Clear selected time when duration changes
  useEffect(() => {
    if (formData.time) {
      handleInputChange('time', '');
    }
  }, [formData.duration]);

  const loadStaffAppointments = async () => {
    if (!selectedStaff || !formData.date) return;

    setLoadingAppointments(true);
    try {
      const appointments = await appointmentService.getAllAppointments({
        staffId: selectedStaff._id,
        date: formData.date
      });
      setStaffAppointments(appointments);
    } catch (err) {
      console.error('Error loading staff appointments:', err);
      setStaffAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadStaff = async () => {
    try {
      setLoadingStaff(true);
      const activeStaff = await staffService.getAllStaff();
      setStaff(activeStaff);
    } catch (err) {
      console.error('Error loading staff:', err);
      setError('Failed to load staff members.');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleStaffChange = (staffId: string) => {
    const selectedStaffMember = staff.find(s => s._id === staffId) || null;
    setSelectedStaff(selectedStaffMember);
    handleInputChange('staffId', staffId);
    handleInputChange('time', '');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
  };
  /**
 * Sends an emergency-appointment request to the backend.
 * Uses minimal fields: userId (client), petId, description.
 * Shows a success banner and closes the form on success.
 */
  const handleEmergencyAppointmentClient = async () => {
    if (!client || !selectedPetId || !formData.description?.trim()) {
      setError("Please select a pet and provide a short description for the emergency.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await appointmentService.createEmergencyAppointment({
        userId: client._id,
        petId: selectedPetId,
        description: formData.description.trim(),
        emergencyReason: "CLIENT_BUTTON"
      });

      showSuccessMessage("Emergency request sent! Please come to the clinic ASAP—our staff will contact you shortly.");
      // close form after 2 s so user can see the banner
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to create emergency appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!selectedPetId || !selectedStaff) {
      setError('Please select a pet and staff member.');
      setIsSubmitting(false);
      return;
    }
    if (!client) {
      setError('Client info is missing.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.time) {
      setError('Please select an appointment time.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      setError('Please provide a description for the appointment.');
      setIsSubmitting(false);
      return;
    }

    // Validate that the selected date is not in the past
    const selectedDate = new Date(formData.date as string);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Cannot schedule appointments in the past. Please select a future date.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create appointment data with proper typing
      const appointmentData = {
        userId: client._id,
        petId: selectedPetId,
        staffId: selectedStaff._id,
        date: formData.date as string,
        time: formData.time as string,
        duration: formData.duration || 30,
        type: formData.type as AppointmentType,
        description: formData.description?.trim() || 'No description provided',
        notes: formData.notes || '',
        cost: formData.cost || 0
      };
      
      const response = await appointmentService.createAppointment(appointmentData);
      
      // Show success message
      showSuccessMessage('Appointment created successfully!');
      
      // Pass just the appointment part to the handler
      onAppointmentAdded(response.appointment);
      
      // Close form after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Detailed error creating appointment:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err instanceof Error ? err.message : String(err));
      
      // Show the actual error message from the server
      let errorMessage = 'Failed to create appointment.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    loadStaff();
  }, []);
  return (
    <div className="w-full">
      {/* Success Message Banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg border-l-4 border-green-700 transition-all duration-300 ease-in-out">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-2">Add New Appointment</h2>
          <div className="h-1 w-16 bg-[#EF92A6] rounded-full mb-2"></div>
        </div>
        <UserNavButton
          label={
            <span className="flex items-center">
              {/* Back arrow SVG */}
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Return to My Upcoming Appointments
            </span>
          }
          onClick={onClose}
          className="!bg-[var(--color-wine)] !text-white !border !border-[var(--color-wine)] !hover:bg-[var(--color-cream)] !hover:text-[var(--color-wine)] !focus:ring-2 !focus:ring-offset-2 !focus:ring-[var(--color-wine)]"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm dark:bg-red-900 dark:border-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#FDF6F0] dark:bg-[#4A3F35] p-6 rounded-xl shadow-md border border-[#EF92A6] dark:border-[#D17C8F]">
        {/* Pet Selection */}
        {client && (
          <div className="mb-4">
            <PetSelectionClient
              pets={clientPets}
              selectedPetId={selectedPetId}
              onPetSelect={handlePetSelect}
              clientName={`${client.firstName} ${client.lastName}`}
              showPetType={false}
            />
          </div>
        )}
        {/* Appointment Form Fields */}
        <div className="mb-4">
          <AppointmentFormFieldsClient
            formData={{
              date: formData.date || formatDateToYYYYMMDD(selectedDate),
              staffId: typeof formData.staffId === 'object' ? (formData.staffId as Staff)._id : (formData.staffId || ''),
              time: formData.time || '',
              type: formData.type || AppointmentType.WELLNESS_EXAM,
              duration: formData.duration || 30,
              // Only one description property
              description: formData.description || '',
              notes: formData.notes || '',
              cost: formData.cost || 0
            }}
            staff={staff}
            selectedStaff={selectedStaff}
            onInputChange={handleInputChange}
            onStaffChange={handleStaffChange}
            loadingStaff={loadingStaff}
            staffAppointments={staffAppointments}
            loadingAppointments={loadingAppointments}
          />
        </div>
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[var(--color-redButton)] rounded-md text-sm font-medium text-[var(--color-redButton)] hover:bg-[var(--color-redButton)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-redButton)] transition-colors duration-150"
          >
            Cancel
          </button>          <button
            type="submit"
            disabled={
              !formData.time ||
              !client ||
              !selectedPetId ||
              !selectedStaff ||
              !formData.description?.trim() ||
              loadingStaff ||
              isSubmitting
            }
            className="flex items-center px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] transition-colors duration-150 shadow-md"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Appointment'
            )}
          </button>
          <button
    type="button"
    onClick={handleEmergencyAppointmentClient}
    disabled={
      !client ||
      !selectedPetId ||
      !formData.description?.trim() ||
      isSubmitting
    }
    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 shadow-md disabled:opacity-50"
    title="For emergencies only! Our staff will contact you immediately."
  >
    🚨 Emergency Appointment
  </button>

        </div>
      </form>
    </div>  );
};

export default AddAppointmentFormToClient;
