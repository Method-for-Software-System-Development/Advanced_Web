import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, AppointmentType, Staff, User, Pet } from '../../types';
import appointmentService from '../../services/appointmentService';
import staffService from '../../services/staffService';
import userService from '../../services/userService';

interface AddAppointmentFormProps {
  onClose: () => void;
  onAppointmentAdded: (newAppointment: Appointment) => void;
  selectedDate: Date;
}

const AddAppointmentForm: React.FC<AddAppointmentFormProps> = ({ onClose, onAppointmentAdded, selectedDate }) => {
  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<Partial<Appointment>>({
    date: formatDateToYYYYMMDD(selectedDate), // Use helper to format date
    time: '',
    staffId: '', // Will store staff._id as string
    type: AppointmentType.CONSULTATION,
    duration: 30,
    status: AppointmentStatus.SCHEDULED,
    notes: '',
    cost: 0,
    description: '',
  });

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [searchedClients, setSearchedClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientPets, setClientPets] = useState<Pet[]>([]);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedClient && selectedClient.pets) {
      setClientPets(selectedClient.pets);
      setSelectedPetId(null); 
    } else {
      setClientPets([]);
    }
  }, [selectedClient]);

  const loadStaff = async () => {
    try {
      setLoadingStaff(true);
      const activeStaff = await staffService.getAllStaff();
      setStaff(activeStaff);
    } catch (err) {
      console.error('Error loading staff:', err);
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoadingStaff(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const time = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push(time);
      }
    }
    // Ensure 12:00 PM and 12:30 PM are correctly formatted if loop ends at 12
    if (!slots.includes("12:00 PM") && staff.length > 0) { // Added a check to prevent adding if no staff
        // This logic might need adjustment based on how 12 PM is handled if 18 is exclusive
    }
    return slots;
  };

  const handleInputChange = (field: keyof Appointment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSearch = async (query: string) => {
    setClientSearchQuery(query);
    if (query.length > 1) { 
      setIsLoadingClients(true);
      try {
        const results = await userService.searchUsers(query);
        setSearchedClients(results);
      } catch (err) {
        console.error('Error searching clients:', err);
        setError('Failed to search clients.');
        setSearchedClients([]);
      } finally {
        setIsLoadingClients(false);
      }
    } else {
      setSearchedClients([]);
    }
  };

  const handleSelectClient = (client: User) => {
    setSelectedClient(client);
    setClientSearchQuery(''); 
    setSearchedClients([]); 
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedClient || !selectedPetId) {
      setError("Please select a client and a pet.");
      return;
    }
    
    const staffIdString = typeof formData.staffId === 'object' ? (formData.staffId as Staff)._id : formData.staffId;

    if (!staffIdString) {
      setError("Please select a staff member.");
      return;
    }
    if (!formData.time) {
        setError("Please select an appointment time.");
        return;
    }
    if (!formData.type) {
        setError("Please select a service type.");
        return;
    }
     if (!formData.description || formData.description.trim() === '') {
      setError("Please provide a reason for the visit.");
      return;
    }

    // Ensure all required fields for the service call are present
    const appointmentPayload = {
      userId: selectedClient._id,
      petId: selectedPetId,
      staffId: staffIdString as string,
      date: formData.date as string, // formData.date is already correctly formatted
      time: formData.time as string,
      duration: formData.duration || 30,
      type: formData.type as AppointmentType,
      description: formData.description as string,
      notes: formData.notes || '',
      cost: formData.cost || 0,
      status: formData.status || AppointmentStatus.SCHEDULED, // Added status
      // clientName and petName are not part of the creation payload for the service
      // but are part of the Appointment interface, they will be populated by the backend.
    };

    try {
      // The service returns { message: string, appointment: Appointment }
      const response = await appointmentService.createAppointment(appointmentPayload);
      onAppointmentAdded(response.appointment); // Pass the appointment object from the response
      onClose();
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create appointment. Please check all fields and try again.');
    }
  };

  return (
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#664147]">Add New Appointment</h2>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Client Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Client (Name, Email, Phone)
                </label>
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  placeholder="Start typing to search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                />
                {isLoadingClients && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
                {searchedClients.length > 0 && (
                  <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto bg-white shadow-lg z-10">
                    {searchedClients.map(client => (
                      <li
                        key={client._id}
                        onClick={() => handleSelectClient(client)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {client.firstName} {client.lastName} ({client.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedClient && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="text-md font-semibold text-gray-700">Selected Client:</h4>
                  <p className="text-sm text-gray-600"><strong>Name:</strong> {selectedClient.firstName} {selectedClient.lastName}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {selectedClient.email}</p>
                  <p className="text-sm text-gray-600"><strong>Phone:</strong> {selectedClient.phone}</p>
                </div>
              )}
            </div>

            {selectedClient && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Pet Information</h3>
                {clientPets.length > 0 ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Pet *
                    </label>
                    <select
                      value={selectedPetId || ''}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                      required
                    >
                      <option value="" disabled>Select Pet</option>
                      {clientPets.map(pet => (
                        <option key={pet._id} value={pet._id}>
                          {pet.name} ({pet.type})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">This client has no pets registered. You may need to add a pet to this client via the patient management section first.</p>
                )}
              </div>
            )}

            {/* Appointment Details Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                    required
                  >
                    <option value="">Select Time</option>
                    {generateTimeSlots().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Member *
                  </label>
                  <select
                    value={typeof formData.staffId === 'object' ? (formData.staffId as Staff)._id : formData.staffId}
                    onChange={(e) => handleInputChange('staffId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                    required
                    disabled={loadingStaff}
                  >
                    <option value="">{loadingStaff ? 'Loading...' : 'Select Staff Member'}</option>
                    {staff
                      .filter(member => member.role && member.role.toLowerCase() === 'veterinarian') // Corrected role to 'veterinarian'
                      .map(member => (
                      <option key={member._id} value={member._id}>
                        {member.firstName} {member.lastName} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as AppointmentType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                    required
                  >
                    <option value={AppointmentType.CONSULTATION}>Consultation</option>
                    <option value={AppointmentType.CHECKUP}>Check-up</option>
                    <option value={AppointmentType.VACCINATION}>Vaccination</option>
                    <option value={AppointmentType.SURGERY}>Surgery</option>
                    <option value={AppointmentType.EMERGENCY}>Emergency</option>
                    <option value={AppointmentType.FOLLOW_UP}>Follow-up</option>
                    <option value={AppointmentType.DENTAL}>Dental</option>
                    <option value={AppointmentType.GROOMING}>Grooming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                  rows={3}
                  placeholder="Describe the reason for the appointment..."
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                  rows={2}
                  placeholder="Add any internal notes for the staff..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF92A6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedClient || !selectedPetId || loadingStaff}
                className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50"
              >
                Create Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AddAppointmentForm;
