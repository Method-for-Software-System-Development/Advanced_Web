import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, AppointmentType, Staff, Patient, Pet } from '../../types';
import appointmentService from '../../services/appointmentService';
import staffService from '../../services/staffService';
import PetSelectionClient from './appointments/PetSelectionClient';
import AppointmentFormFieldsClient from './appointments/AppointmentFormFieldsClient';

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
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [clientPets, setClientPets] = useState<Pet[]>([]);
  const [client, setClient] = useState<Patient | null>(null);

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
      setClientPets(parsedClient.pets);
      setSelectedPetId(parsedClient.pets[0]._id); // Select first pet by default
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
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      if ( !selectedPetId || !selectedStaff) {
      setError('Please select a pet, and staff member.');
      return;
    }
    if (!client) {
      setError('Client info is missing.');
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

    // Debug validation
    console.log('Form validation check:');
    console.log('selectedClient:', client);
    console.log('selectedPetId:', selectedPetId);
    console.log('selectedStaff:', selectedStaff);
    console.log('formData:', formData);

    try {      // Create appointment data with proper typing
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
      };      // Service returns { message: string, appointment: Appointment }
      console.log('Sending appointment data:', appointmentData);
      console.log('Validation check - all required fields:');
      console.log('- userId:', appointmentData.userId);
      console.log('- petId:', appointmentData.petId);
      console.log('- staffId:', appointmentData.staffId);
      console.log('- date:', appointmentData.date);
      console.log('- time:', appointmentData.time);
      console.log('- type:', appointmentData.type);
      console.log('- description:', appointmentData.description);
      
      const response = await appointmentService.createAppointment(appointmentData);
      console.log('Received response:', response);
      console.log('Received response:', response);
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
      }
      setError(errorMessage);
    }
  };
  return (
    <div className="w-full">      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0]">Add New Appointment</h2>
      </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            

            {/* Pet Selection */}
            {client && (
              <PetSelectionClient
                pets={clientPets}
                selectedPetId={selectedPetId}
                onPetSelect={handlePetSelect}
                clientName={`${client.firstName} ${client.lastName}`}
              />
            )}            {/* Appointment Form Fields */}
            <AppointmentFormFieldsClient              formData={{
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
              loadingAppointments={loadingAppointments}
            />{/* Form Actions */}            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF92A6] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>              <button
                type="submit"
                disabled={
                  !formData.time || 
                  !client || 
                  !selectedPetId || 
                  !selectedStaff || 
                  !formData.description?.trim() ||
                  loadingStaff
                }
                className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C]"
                title={`Client: ${client ? 'Yes' : 'No'}, Pet: ${selectedPetId ? 'Yes' : 'No'}, Staff: ${selectedStaff ? 'Yes' : 'No'}, Description: ${formData.description?.trim() ? 'Yes' : 'No'}, Loading: ${loadingStaff ? 'Yes' : 'No'}, Time selected: ${formData.time ? 'Yes' : 'No'}`}
              >
                Create Appointment
              </button>
            </div>
          </form>
    </div>  );
};

export default AddAppointmentFormToClient;
