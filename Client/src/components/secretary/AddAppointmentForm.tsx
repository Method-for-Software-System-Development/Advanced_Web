import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, AppointmentType, Staff, Patient, Pet } from '../../types';
import appointmentService from '../../services/appointmentService';
import staffService from '../../services/staffService';
import ClientSearch from './appointment/ClientSearch';
import PetSelection from './appointment/PetSelection';
import AppointmentFormFields from './appointment/AppointmentFormFields';

interface AddAppointmentFormProps {
  onClose: () => void;
  onAppointmentAdded: (newAppointment: Appointment) => void;
  selectedDate: Date;
}
console.log("DEBUG >> AddAppointmentForm (client) loaded");

const AddAppointmentForm: React.FC<AddAppointmentFormProps> = ({
  onClose,
  onAppointmentAdded,
  selectedDate
}) => {
  // Helper function to format date to YYYY-MM-DD in local timezone
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
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffAppointments, setStaffAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Client and pet state
  const [selectedClient, setSelectedClient] = useState<Patient | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [clientPets, setClientPets] = useState<Pet[]>([]);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedClient && selectedClient.pets) {
      // Filter to show only active pets
      const activePets = selectedClient.pets.filter(pet => pet.isActive === true);
      setClientPets(activePets);
      setSelectedPetId(null);
    } else {
      setClientPets([]);
    }
  }, [selectedClient]);

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

  const handleClientSelect = (client: Patient) => {
    setSelectedClient(client);
    setSelectedPetId(null);
  };

  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
  };
  /**
* Handles the Emergency Appointment button click.
* Sends a POST request to the emergency appointment API endpoint
* with minimal required details (user, pet, description).
* On success, shows an alert and optionally closes the form.
* On error, shows the returned error message.
*/
  const handleEmergencyAppointment = async () => {
    // Validation: must select client & pet
    if (!selectedClient || !selectedPetId || !formData.description?.trim()) {
      setError("Please select a client, pet, and provide a description for the emergency.");
      return;
    }
    try {
      // Optionally: set loading spinner here

      const response = await appointmentService.createEmergencyAppointment({
        userId: selectedClient._id,
        petId: selectedPetId,
        description: formData.description,
        emergencyReason: "EMERGENCY" // You may allow to input or pick reason
      });

      // Show confirmation (replace with nicer modal if you want)
      alert("Emergency appointment request sent!");
      // Optionally, close the form/modal:
      onClose();

    } catch (err: any) {
      setError(err?.message || "Failed to schedule emergency appointment.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !selectedPetId || !selectedStaff) {
      setError('Please select a client, pet, and staff member.');
      return;
    }

    if (!formData.time) {
      setError('Please select an appointment time.');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      setError('Please provide a description for the appointment.');
      return;
    }

    // Validate that the selected date is not in the past
    const selectedDate = new Date(formData.date as string);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Cannot schedule appointments in the past. Please select a future date.');
      return;
    }

    try {// Create appointment data with proper typing
      const appointmentData = {
        userId: selectedClient._id,
        petId: selectedPetId,
        staffId: selectedStaff._id,
        date: formData.date as string,
        time: formData.time as string,
        duration: formData.duration || 30,
        type: formData.type as AppointmentType,
        description: formData.description?.trim() || 'No description provided',
        notes: formData.notes || '',
        cost: formData.cost || 0
      };      // Service returns { message: string, appointment: Appointment }

      const response = await appointmentService.createAppointment(appointmentData);
      // Pass just the appointment part to the handler
      onAppointmentAdded(response.appointment);
      onClose();
    } catch (err) {
      console.error('Detailed error creating appointment:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err instanceof Error ? err.message : String(err));

      // Show the actual error message from the server
      let errorMessage = 'Failed to create appointment.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } setError(errorMessage);
    }

  };

  const handleClear = () => {
    // Reset form data to initial state
    setFormData({
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

    // Reset client and pet selections
    setSelectedClient(null);
    setSelectedPetId(null);
    setSelectedStaff(null);
    setStaffAppointments([]);
    setError(null);
  };

  return (
    <div className="w-full">      <div className="mb-6 flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-grayText dark:text-white">Add New Appointment</h2>        <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
      >
        Cancel
      </button>
    </div>{error && (
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-grayText rounded dark:bg-red-900 dark:border-red-600 dark:text-white">
        {error}
      </div>
    )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Search */}
        <ClientSearch
          onClientSelect={handleClientSelect}
          selectedClient={selectedClient}
        />

        {/* Pet Selection */}
        {selectedClient && (
          <PetSelection
            pets={clientPets}
            selectedPetId={selectedPetId}
            onPetSelect={handlePetSelect}
            clientName={`${selectedClient.firstName} ${selectedClient.lastName}`}
          />
        )}            {/* Appointment Form Fields */}
        <AppointmentFormFields formData={{
          date: formData.date || formatDateToYYYYMMDD(selectedDate),
          staffId: typeof formData.staffId === 'object' ? (formData.staffId as Staff)._id : (formData.staffId || ''),
          time: formData.time || '',
          type: formData.type || AppointmentType.WELLNESS_EXAM,
          duration: formData.duration || 30,
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
          loadingAppointments={loadingAppointments} />{/* Form Actions */}            <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-grayText hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={
              !formData.time ||
              !selectedClient ||
              !selectedPetId ||
              !selectedStaff ||
              !formData.description?.trim() ||
              loadingStaff
            }
            className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] cursor-pointer"
            title={`Client: ${selectedClient ? 'Yes' : 'No'}, Pet: ${selectedPetId ? 'Yes' : 'No'}, Staff: ${selectedStaff ? 'Yes' : 'No'}, Description: ${formData.description?.trim() ? 'Yes' : 'No'}, Loading: ${loadingStaff ? 'Yes' : 'No'}, Time selected: ${formData.time ? 'Yes' : 'No'}`}
          >
            Create Appointment
          </button>

        </div>
      </form>
    </div>);
};

export default AddAppointmentForm;
