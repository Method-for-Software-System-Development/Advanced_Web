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
  };  const [formData, setFormData] = useState<Partial<Appointment>>({
    date: formatDateToYYYYMMDD(selectedDate), // Use helper to format date
    time: '',
    staffId: '', // Will store staff._id as string
    type: AppointmentType.WELLNESS_EXAM,
    duration: 30,
    status: AppointmentStatus.SCHEDULED,
    notes: '',
    cost: 55, // Default cost for WELLNESS_EXAM
    description: '',
  });
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffAppointments, setStaffAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [searchedClients, setSearchedClients] = useState<User[]>([]);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(false);  const [clientPets, setClientPets] = useState<Pet[]>([]);  // Get available durations (with labels)
  const getAvailableDurations = (appointmentType: AppointmentType) => {
    const durations = getTypeSpecificDurations(appointmentType);
    return durations.map(duration => ({
      value: duration,
      label: duration >= 60 ? `${duration / 60} hour${duration > 60 ? 's' : ''}` : `${duration} minutes`
    }));
  };


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
  // Load staff appointments when staff member or date changes
  useEffect(() => {
    if (selectedStaff && formData.date) {
      loadStaffAppointments();
    } else {
      setStaffAppointments([]);
    }
  }, [selectedStaff, formData.date]);

  // Clear selected time when duration changes (since available slots may change)
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
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoadingStaff(false);
    }
  };  // Get standardized duration options
  const getTypeSpecificDurations = (appointmentType: AppointmentType): number[] => {
    switch (appointmentType) {
      case AppointmentType.WELLNESS_EXAM:
        return [30, 60];
      case AppointmentType.VACCINATION:
        return [30];
      case AppointmentType.SPAY_NEUTER:
        return [90, 120];
      case AppointmentType.DENTAL_CLEANING:
        return [60, 90];
      case AppointmentType.EMERGENCY_CARE:
        return [30, 60, 90];
      case AppointmentType.SURGERY:
        return [120];
      case AppointmentType.DIAGNOSTIC_IMAGING:
        return [60, 90];
      case AppointmentType.BLOOD_WORK:
        return [30];
      case AppointmentType.FOLLOW_UP:
        return [30, 60];
      case AppointmentType.GROOMING:
        return [60, 90, 120];
      case AppointmentType.BEHAVIORAL_CONSULTATION:
        return [60, 90];
      case AppointmentType.MICROCHIPPING:
        return [30];
      default:
        return [30, 60, 90, 120]; // Default for unknown types
    }
  };// Get default duration for appointment type
  const getDefaultDuration = (appointmentType: AppointmentType): number => {
    const availableDurations = getTypeSpecificDurations(appointmentType);
    return availableDurations[0]; // Return the first (shortest) duration as default
  };
  // Get fixed cost for appointment type
  const getServiceCost = (appointmentType: AppointmentType): number => {
    switch (appointmentType) {
      case AppointmentType.WELLNESS_EXAM:
        return 55;
      case AppointmentType.VACCINATION:
        return 25;
      case AppointmentType.SPAY_NEUTER:
        return 180;
      case AppointmentType.DENTAL_CLEANING:
        return 120;
      case AppointmentType.EMERGENCY_CARE:
        return 85;
      case AppointmentType.SURGERY:
        return 250;
      case AppointmentType.DIAGNOSTIC_IMAGING:
        return 75;
      case AppointmentType.BLOOD_WORK:
        return 45;
      case AppointmentType.FOLLOW_UP:
        return 35;
      case AppointmentType.GROOMING:
        return 40;
      case AppointmentType.BEHAVIORAL_CONSULTATION:
        return 65;
      case AppointmentType.MICROCHIPPING:
        return 25;
      default:
        return 0;
    }
  };

  const generateTimeSlots = () => {
    if (!selectedStaff) return [];

    // Parse staff available slots (e.g., "Monday 09:00-17:00")
    const selectedDate = new Date(formData.date + 'T00:00:00');
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Find the staff's availability for this day
    const dayAvailability = selectedStaff.availableSlots.find(slot =>
      slot.toLowerCase().startsWith(dayOfWeek.toLowerCase())
    );

    if (!dayAvailability) return []; // Staff not available on this day

    // Extract time range from availability string (e.g., "Monday 09:00-17:00" -> "09:00-17:00")
    const timeRange = dayAvailability.split(' ').slice(1).join(' ');
    const [startTime, endTime] = timeRange.split('-');

    if (!startTime || !endTime) return [];    // Convert time strings to minutes for easier calculation
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Convert 12-hour format time to minutes since midnight
    const timeStringToMinutes = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === 'AM' && hours === 12) {
        totalMinutes = minutes; // 12:xx AM is 00:xx in 24-hour format
      }
      
      return totalMinutes;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const selectedDuration = formData.duration || 30;    // Generate all possible time slots within staff availability
    const allSlots = [];
    // Only generate slots where the appointment can complete within working hours
    for (let minutes = startMinutes; minutes + selectedDuration <= endMinutes; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours < 12 ? 'AM' : 'PM';
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;
      const time = `${displayHour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
      
      // Check if this time slot would overlap with any existing appointment
      const slotStartMinutes = minutes; // Use the loop variable directly
      const slotEndMinutes = slotStartMinutes + selectedDuration;
      
      let hasOverlap = false;
      
      for (const appointment of staffAppointments) {
        const existingStartMinutes = timeStringToMinutes(appointment.time);
        const existingEndMinutes = existingStartMinutes + appointment.duration;
        
        // Check if the time slots overlap - appointments overlap if they share any time
        const isOverlapping = (
          slotStartMinutes < existingEndMinutes && slotEndMinutes > existingStartMinutes
        );
        
        if (isOverlapping) {
          hasOverlap = true;
          break;
        }
      }
      
      if (!hasOverlap) {
        allSlots.push(time);
      }
    }

    return allSlots;
  };
  const handleStaffChange = (staffId: string) => {
    const selectedStaffMember = staff.find(s => s._id === staffId) || null;
    setSelectedStaff(selectedStaffMember);
    handleInputChange('staffId', staffId);
    // Clear selected time when staff changes
    handleInputChange('time', '');
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
    setError(null); if (!selectedClient || !selectedPetId) {
      setError("Please select a client and a pet.");
      return;
    }

    if (!selectedStaff) {
      setError("Please select a staff member.");
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
    }    // Ensure all required fields for the service call are present
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
          )}            {/* Appointment Details Section */}
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
                  Staff Member *
                </label>
                <select
                  value={typeof formData.staffId === 'object' ? (formData.staffId as Staff)._id : formData.staffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
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
                  Time *
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                  required
                  disabled={!selectedStaff || loadingAppointments}
                >
                  <option value="">
                    {!selectedStaff ? 'Select Staff Member First' :
                      loadingAppointments ? 'Loading available times...' :
                        'Select Time'}
                  </option>
                  {generateTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {selectedStaff && generateTimeSlots().length === 0 && !loadingAppointments && (<p className="text-sm text-red-500 mt-1">No available time slots for this staff member on this date.</p>
                )}
              </div>   
              <div></div>               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as AppointmentType;
                    handleInputChange('type', newType);                    // Auto-update duration to the default for this type
                    const defaultDuration = getDefaultDuration(newType);
                    handleInputChange('duration', defaultDuration);
                    // Auto-update cost for this service type
                    const serviceCost = getServiceCost(newType);
                    handleInputChange('cost', serviceCost);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
                  required>
                  <option value={AppointmentType.WELLNESS_EXAM}>Wellness Exam</option>
                  <option value={AppointmentType.VACCINATION}>Vaccination</option>
                  <option value={AppointmentType.SPAY_NEUTER}>Spay/Neuter</option>
                  <option value={AppointmentType.DENTAL_CLEANING}>Dental Cleaning</option>
                  <option value={AppointmentType.EMERGENCY_CARE}>Emergency Care</option>
                  <option value={AppointmentType.SURGERY}>Surgery</option>
                  <option value={AppointmentType.DIAGNOSTIC_IMAGING}>Diagnostic Imaging (X-ray/Ultrasound)</option>
                  <option value={AppointmentType.BLOOD_WORK}>Blood Work/Lab Tests</option>
                  <option value={AppointmentType.FOLLOW_UP}>Follow-up Visit</option>
                  <option value={AppointmentType.GROOMING}>Grooming</option>
                  <option value={AppointmentType.BEHAVIORAL_CONSULTATION}>Behavioral Consultation</option>
                  <option value={AppointmentType.MICROCHIPPING}>Microchipping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"                >                  {getAvailableDurations(formData.type || AppointmentType.WELLNESS_EXAM).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Cost
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                ${formData.cost?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-gray-500 mt-1">Cost is automatically set based on service type</p>
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
            </button>              <button
              type="submit"
              disabled={!selectedClient || !selectedPetId || !selectedStaff || loadingStaff}
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
