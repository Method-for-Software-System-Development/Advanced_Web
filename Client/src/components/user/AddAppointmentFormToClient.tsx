
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, AppointmentType, Staff, Patient, Pet } from '../../types';
import appointmentService from '../../services/appointmentService';
import staffService from '../../services/staffService';
import PetSelectionClient from './appointments/PetSelectionClient';
import AppointmentFormFieldsClient from './appointments/AppointmentFormFieldsClient';
import { API_URL } from '../../config/api';
import UserNavButton from './UserNavButton';
import { useNavigate } from 'react-router-dom';
import EmergencyAppointmentModal from './appointments/EmergencyAppointmentModal';

/**
 * AddAppointmentFormToClient
 *
 * This component renders a form for clients to schedule a new appointment (regular or emergency).
 * It handles staff/pet selection, time slot selection, validation, and submission.
 *
 * Props:
 * - onClose: Function to close the form/modal
 * - onAppointmentAdded: Callback when a new appointment is successfully created
 * - selectedDate: The date to pre-fill in the form
 */

interface AddAppointmentFormToClientProps {
  /** Close the form/modal */
  onClose: () => void;
  /** Callback when a new appointment is created */
  onAppointmentAdded: (newAppointment: Appointment) => void;
  /** The selected date for the appointment */
  selectedDate: Date;
}


const AddAppointmentFormToClient: React.FC<AddAppointmentFormToClientProps> = ({
  onClose,
  onAppointmentAdded,
  selectedDate
}) => {
  const navigate = useNavigate();

  /**
   * Formats a Date object to 'YYYY-MM-DD' for input fields
   */
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Shows a success message for a few seconds
   */
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // --- State ---
  /** Form data for the appointment */
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
  /** List of all staff members */
  const [staff, setStaff] = useState<Staff[]>([]);
  /** Loading state for staff list */
  const [loadingStaff, setLoadingStaff] = useState(true);
  /** Error message for the form */
  const [error, setError] = useState<string | null>(null);
  /** Submitting state for the form */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Success message for the form */
  const [successMessage, setSuccessMessage] = useState<string>('');
  /** Currently selected staff member */
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  /** Appointments for the selected staff and date */
  const [staffAppointments, setStaffAppointments] = useState<Appointment[]>([]);
  /** Loading state for staff appointments */
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  /** Whether the emergency modal is open */
  const [openEmergencyModal, setOpenEmergencyModal] = useState(false);
  /** Error message for emergency modal */
  const [emergencyError, setEmergencyError] = useState<string | null>(null);
  /**
   * Handles the emergency appointment confirmation.
   * If failed, closes the modal and displays an error in the main form.
   */
  const handleConfirmEmergency = async (reason: string, petId: string) => {
    setIsSubmitting(true);
    setEmergencyError(null);
    try {
      const result = await appointmentService.createEmergencyAppointment({
        userId: client ? client._id : '',
        petId,
        description: reason || "EMERGENCY",
        emergencyReason: reason || "EMERGENCY"
      });
      // If no appointment/staff returned, treat as failure
      if (!result.newAppointment || !result.newAppointment.staffId) {
        const msg = "No emergency appointments are available at the moment. Please visit the clinic and our team will assist you as soon as possible.";
        setEmergencyError(msg);           // Show error in main form
        setOpenEmergencyModal(false);     // Close modal
        setIsSubmitting(false);
        return;
      }
      // Success – show success message and close modal
      showSuccessMessage('Emergency appointment created successfully!');
      onAppointmentAdded(result.newAppointment);
      setTimeout(() => {
        setOpenEmergencyModal(false); // Close modal on success
      }, 1500);
    } catch (err: any) {
      // Catch network/server/API errors and show them
      let errorMessage = "No emergency appointments are available at the moment. Please visit the clinic and our team will assist you as soon as possible.";
      if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setEmergencyError(errorMessage);   // Show error in main form
      setOpenEmergencyModal(false);      // Close modal
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- Client and pet state ---
  /** List of pets for the client */
  const [clientPets, setClientPets] = useState<Pet[]>([]);
  /** Client object (from session) */
  const [client, setClient] = useState<Patient | null>(null);
  /** Selected pet ID */
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    () => {
      const clientRaw = sessionStorage.getItem("client");
      if (clientRaw) {
        try {
          const parsedClient = JSON.parse(clientRaw);
          if (parsedClient.pets && parsedClient.pets.length > 0) {
            return parsedClient.pets[0]._id;
          }
        } catch { }
      }
      return null;
    });

  /**
   * Loads client and pets from session storage and fetches full pet objects if needed.
   * Filters out inactive pets.
   */
  useEffect(() => {
    try {
      const clientRaw = sessionStorage.getItem("client");
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

  /**
   * Loads all appointments for the selected staff and date.
   */
  useEffect(() => {
    if (selectedStaff && formData.date) {
      loadStaffAppointments();
    } else {
      setStaffAppointments([]);
    }
  }, [selectedStaff, formData.date]);

  /**
   * Clears selected time when duration changes.
   */
  useEffect(() => {
    if (formData.time) {
      handleInputChange('time', '');
    }
  }, [formData.duration]);

  /**
   * Loads all staff members from the server.
   */
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

  /**
   * Loads all appointments for a staff member on a specific date.
   */
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

  /**
   * Handles staff selection change.
   */
  const handleStaffChange = (staffId: string) => {
    const selectedStaffMember = staff.find(s => s._id === staffId) || null;
    setSelectedStaff(selectedStaffMember);
    handleInputChange('staffId', staffId);
    handleInputChange('time', '');
  };

  /**
   * Handles input change for form fields.
   */
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handles pet selection change.
   */
  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
  };

  /**
   * Handles form submission for creating a new appointment.
   * Validates all fields and handles both regular and emergency appointments.
   */
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

      // If this is an emergency appointment, check for staff assignment
      if (appointmentData.type === AppointmentType.EMERGENCY_CARE) {
        const result = await appointmentService.createEmergencyAppointment({
          userId: appointmentData.userId,
          petId: appointmentData.petId,
          description: appointmentData.description,
          emergencyReason: appointmentData.description || "EMERGENCY"
        });
        console.log("EMERGENCY RESULT:", result);
        if (!result.newAppointment || !result.newAppointment.staffId) {
          const msg = "No emergency appointments are available at the moment. Please visit the clinic and our team will assist you as soon as possible.";

          setError(msg);
          setIsSubmitting(false);
          return;
        }
        showSuccessMessage('Emergency appointment created successfully!');
        onAppointmentAdded(result.newAppointment);
        setTimeout(() => {
          onClose();
        }, 1500);
        return;
      }
      // Regular appointment
      const response = await appointmentService.createAppointment(appointmentData);
      showSuccessMessage('Appointment created successfully!');
      onAppointmentAdded(response.appointment);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      // Log detailed information about the error for debugging purposes
      console.error('Detailed error creating appointment:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err instanceof Error ? err.message : String(err));

      // Default error message if no specific server message is available
      let errorMessage = 'No emergency appointments are available at the moment. Please visit the clinic and our team will assist you as soon as possible.';

      // If the error is an Error object with a message property, use that message
      if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        errorMessage = err.message;
      }
      // If the error is a string, use it directly
      else if (typeof err === "string") {
        errorMessage = err;
      }

      // Display the error message to the user
      setError(errorMessage);
    } finally {
      // Ensure the submitting state is reset even if an error occurs
      setIsSubmitting(false);
    }
  };
  // Load staff on mount
  useEffect(() => {
    loadStaff();
  }, []);
  console.log("emergencyError UI:", emergencyError);
  return (
    <div className="w-full">
      {/* Emergency Appointment Modal – Always mounted, only visible if openEmergencyModal === true */}
      <EmergencyAppointmentModal
        open={openEmergencyModal}
        onClose={() => setOpenEmergencyModal(false)}
        onConfirm={handleConfirmEmergency}
        isSubmitting={isSubmitting}
        error={emergencyError}
      />

      {/* Show emergency error message (main form, outside the modal) */}
      {emergencyError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm dark:bg-red-900 dark:border-red-600 dark:text-red-300">
          {emergencyError}
        </div>
      )}
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
      )}      {/* Desktop view for header and button */}
      <div className="mb-6 hidden md:flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-grayText dark:text-white mb-2">New Appointment Scheduler</h2>
          <div className="h-1 w-full bg-pinkDark rounded-full mb-2"></div>
        </div>        <UserNavButton
          label="< Return to Upcoming Appointments"
          onClick={onClose}
          className="px-4 py-2 bg-pinkDark text-white border rounded-md text-sm font-bold hover:bg-pinkDarkHover cursor-pointer shadow-md disabled:opacity-50"
        />
      </div>
      {/* Mobile view for header and button */}      <div className="mb-6 md:hidden">
        <h2 className="text-[19px] font-semibold text-[#533139] dark:text-[#FDF6F0] mb-2">New Appointment Scheduler</h2>
        <div className="h-1 w-16 bg-[#EF92A6] rounded-full mb-4"></div>        <UserNavButton
          label="Return to Appointments"
          onClick={onClose}
          className="px-1.5 py-2 bg-[#4A3F35] text-white border border-[#4A3F35] rounded-md text-[10px] font-bold hover:bg-[#EF92A6] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] shadow-md disabled:opacity-50 dark:bg-[#FDF6F0] dark:text-[#4A3F35] dark:border-[#FDF6F0] w-full"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm dark:bg-red-900 dark:border-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-cream dark:bg-darkMode p-6 rounded-xl shadow-md border border-pinkDark">        {/* Pet Selection */}
        {client && (
          <div className="mb-4 text-[13px] md:text-base">
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
        <div className="mb-4 text-[13px] md:text-base">
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
          />        </div>        {/* Emergency Button Section */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          {/* Mobile Layout - Stacked */}
          <div className="md:hidden">
            <div className="flex items-center mb-4">
              <span className="text-xl mr-2">🚨</span>
              <div>
                <h3 className="text-base font-semibold text-red-700 dark:text-red-400 mb-1">Emergency Appointment</h3>
                <p className="text-xs text-red-600 dark:text-red-300">
                  If this is an emergency, click here for immediate assistance
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmergencyError(null);
                setOpenEmergencyModal(true);
              }}
              disabled={!client || clientPets.length === 0 || isSubmitting}
              className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Emergency
            </button>
          </div>
          
          {/* Desktop Layout - Side by Side */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🚨</span>
              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Emergency Appointment</h3>
                <p className="text-sm text-red-600 dark:text-red-300">
                  If this is an emergency, click here for immediate assistance
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmergencyError(null);
                setOpenEmergencyModal(true);
              }}
              disabled={!client || clientPets.length === 0 || isSubmitting}
              className="px-4 py-2 bg-redButton hover:bg-redButtonDark cursor-pointer text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              Emergency
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between md:justify-between pt-4 space-x-2 md:space-x-3">
          <button
            type="button"
            onClick={onClose} className="px-3 md:px-4 py-1.5 md:py-2 w-[35%] md:w-auto bg-redButton cursor-pointer text-white rounded-md text-xs md:text-sm font-medium hover:bg-redButtonDark transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed min-w-[70px]"          >
            Cancel
          </button>
          <button
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
            className="flex items-center justify-center px-2 md:px-4 py-1.5 md:py-2 w-[65%] md:w-auto bg-pinkDark text-white rounded-md text-xs md:text-sm font-medium hover:bg-pinkDarkHover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-md"
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
        </div>      </form>
    </div>
  );
};

export default AddAppointmentFormToClient;
