import React, { useState, useEffect, useMemo } from 'react';
import AddAppointmentFormToClient from './AddAppointmentFormToClient.tsx';
import EditAppointmentForm from './EditAppointmentForm';
import appointmentService from '../../services/appointmentService';
import { Appointment } from '../../types';
import UserNavButton from './UserNavButton';
import { CancelReasonModal } from './CancelReasonModal';
import EmergencyAppointmentModal from './appointments/EmergencyAppointmentModal';

interface AppointmentViewClientProps {
  onBack?: () => void; // Make this optional since it's not being used
}

// Helper function to format appointment data for display
const formatAppointmentForDisplay = (appointment: Appointment) => {
  // Handle populated vs unpopulated references
  const staff = typeof appointment.staffId === 'object' ? appointment.staffId : null;
  const pet = typeof appointment.petId === 'object' ? appointment.petId : null;
  
  return {
    id: appointment._id,
    time: appointment.time,
    petName: pet ? pet.name : 'Unknown Pet',
    service: appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace('_', ' '),
    staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff',
    description: appointment.description,
    notes: appointment.notes,
    status: appointment.status,
    duration: appointment.duration,
    cost: appointment.cost,
    date: appointment.date
  };
};

const AppointmentViewClient: React.FC<AppointmentViewClientProps> = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [sortField, setSortField] = useState<'date' | 'petName' | 'staffName' | 'service'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Function to show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // Auto-dismiss after 3 seconds
  };

  // Function to load all appointments from pets
  const loadAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const clientRaw = localStorage.getItem("client");
      if (!clientRaw) {
        setError('No client info found.');
        setIsLoading(false);
        return;
      }
      
      const client = JSON.parse(clientRaw);
      if (!client.pets || client.pets.length === 0) {
        setAppointments([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch all appointments for all pets
      // Only keep future appointments for each pet
      const now = new Date();
      let allAppointments: Appointment[] = [];
      
      for (const pet of client.pets) {
        try {
          // Check if pet is a string (ID) or an object with _id property
          const petId = typeof pet === 'string' ? pet : pet._id;
          
          if (!petId) {
            console.error('Invalid pet ID:', pet);
            continue;
          }
          
          console.log("Fetching appointments for pet ID:", petId);
          const petAppointments = await appointmentService.getAppointmentsByPet(petId);
          console.log(`Received ${petAppointments.length} appointments for pet ${petId}`);
          
          const futurePetAppointments = petAppointments.filter(appt => new Date(appt.date) >= now);
          allAppointments = [...allAppointments, ...futurePetAppointments];
        } catch (err) {
          // Optionally handle per-pet errors
          const petName = typeof pet === 'object' && pet.name ? pet.name : 'unknown';
          console.error(`Failed to load appointments for pet ${petName}:`, err);
        }
      }
      
      // Deduplicate appointments by _id
      const dedupedAppointments = Array.from(
        new Map(allAppointments.map(appt => [appt._id, appt])).values()
      ) as Appointment[];
      
      console.log(`Final appointments list: ${dedupedAppointments.length} items`);
      setAppointments(dedupedAppointments);
    } catch (err: any) {
      let errorMsg = 'Failed to load appointments. Please try again.';
      if (err instanceof Error) {
        errorMsg += `\n${err.message}`;
      } else if (typeof err === 'string') {
        errorMsg += `\n${err}`;
      }
      setError(errorMsg);
      console.error('Appointment loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const sortedAppointments = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'petName':
          aVal = typeof a.petId === 'object' && a.petId && 'name' in a.petId ? a.petId.name.toLowerCase() : '';
          bVal = typeof b.petId === 'object' && b.petId && 'name' in b.petId ? b.petId.name.toLowerCase() : '';
          break;
        case 'staffName':
          aVal = typeof a.staffId === 'object' && a.staffId && 'firstName' in a.staffId ? `${a.staffId.firstName} ${a.staffId.lastName}`.toLowerCase() : '';
          bVal = typeof b.staffId === 'object' && b.staffId && 'firstName' in b.staffId ? `${b.staffId.firstName} ${b.staffId.lastName}`.toLowerCase() : '';
          break;
        case 'service':
          aVal = a.type.toLowerCase();
          bVal = b.type.toLowerCase();
          break;
        default:
          break;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [appointments, sortField, sortDirection]);

  // Filter appointments by pet name
  const filteredAppointments = useMemo(() => {
    if (!searchTerm.trim()) return sortedAppointments;
    return sortedAppointments.filter(apt => {
      let petName = "";
      if (typeof apt.petId === "object" && apt.petId && "name" in apt.petId) {
        petName = apt.petId.name.toLowerCase();
      }
      return petName.includes(searchTerm.trim().toLowerCase());
    });
  }, [searchTerm, sortedAppointments]);

  // Handler for when a new appointment is added
  const handleAppointmentAdded = (newAppointment: Appointment) => {
    setShowAddForm(false);
    console.log("New appointment added:", newAppointment);
    
    // Reload all appointments to ensure consistency
    loadAppointments();
  };

  // Handler for saving appointment edits
  const handleEditSave = async (updated: { staffId: string; date: string; time: string }) => {
    if (!editingAppointmentId) return;
    setIsLoading(true);
    setError('');
    try {
      await appointmentService.updateAppointment(editingAppointmentId, {
        staffId: updated.staffId,
        date: updated.date,
        time: updated.time,
      });
      setEditingAppointmentId(null);
      showSuccessMessage('Appointment updated successfully!');
      loadAppointments();
    } catch (err) {
      setError('Failed to update appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (appointmentId: string) => {
    setCancelingAppointmentId(appointmentId);
    setShowCancelModal(true);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelingAppointmentId(null);
  };

  const handleCancelSubmit = async (reason: string) => {
    if (!cancelingAppointmentId) return;
    setCancelReason(reason);
    setShowCancelModal(false);
    try {
      await appointmentService.cancelAppointment(cancelingAppointmentId, reason);
      showSuccessMessage('Appointment cancelled successfully!');
      loadAppointments();
    } catch (err) {
      setError('Failed to cancel appointment.');
    } finally {
      setCancelingAppointmentId(null);
    }
  };

  // Add handleEmergencyAppointmentClient function
  const handleEmergencyAppointmentClient = async (reasonFromModal?: string) => {
    const clientRaw = localStorage.getItem("client");
    if (!clientRaw) {
      setError("No client info found.");
      return;
    }
    const client = JSON.parse(clientRaw);
    // Use the first pet as default for emergency, or prompt user for pet selection if needed
    const petId = client.pets && client.pets.length > 0 ? (typeof client.pets[0] === 'string' ? client.pets[0] : client.pets[0]._id) : null;
    if (!petId) {
      setError("Please select a pet.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await appointmentService.createEmergencyAppointment({
        userId: client._id,
        petId,
        description: reasonFromModal?.trim() || 'No description provided',
        emergencyReason: reasonFromModal?.trim() || 'No reason provided',
      });
      showSuccessMessage("Emergency request sent! Please come to the clinic ASAP—our staff will contact you shortly.");
    } catch (err: any) {
      setError(err?.message || "Failed to create emergency appointment.");
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-[#664147] rounded-lg shadow-xl">
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

      {/* Header, now only the title and count */}
      {!showAddForm && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3F35] dark:text-[#FDF6F0] mb-1">My Upcoming Appointments</h1>
            <div className="text-sm text-gray-500 dark:text-gray-300">
              Showing {filteredAppointments.filter(apt => apt.status && apt.status.toLowerCase() === 'scheduled').length} appointments
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] transition"
            >
              Add New Appointment
            </button>
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 shadow-md disabled:opacity-50"
              title="For emergencies only! Our staff will contact you immediately."
            >
              🚨 Emergency Appointment
            </button>
          </div>
        </div>
      )}
      {/* Search row, like in treatment history */}
      {!showAddForm && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Search by Pet Name:</span>
          <input
            id="search-pet"
            type="text"
            placeholder="Enter pet name..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ minWidth: 200 }}
          />
        </div>
      )}
      {/* Sort controls row with label, like in treatment history */}
      {!showAddForm && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Sort by:</span>
          <select
            id="sort-field"
            value={sortField}
            onChange={e => setSortField(e.target.value as any)}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            style={{ minWidth: 120 }}
          >
            <option value="date">Date</option>
            <option value="petName">Pet Name</option>
            <option value="staffName">Staff Member</option>
            <option value="service">Service</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortDirection === 'asc' ? (
              <span>&uarr;</span>
            ) : (
              <span>&darr;</span>
            )}
          </button>
        </div>
      )}

      {showAddForm && (
        <section className="mb-8">
          <AddAppointmentFormToClient
            onClose={() => setShowAddForm(false)}
            onAppointmentAdded={handleAppointmentAdded}
            selectedDate={new Date()}
          />
        </section>
      )}

      {/* Filter appointments by pet name */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">Loading appointments...</p>
      ) : filteredAppointments && filteredAppointments.length > 0 ? (
        <ul className="space-y-6">
          {filteredAppointments
            .filter(apt => apt.status && apt.status.toLowerCase() === 'scheduled')
            .map(apt => {
              const formatted = formatAppointmentForDisplay(apt);
              let petName = formatted.petName;
              if (petName === 'Unknown Pet' && apt.petId && typeof apt.petId === 'object' && 'name' in apt.petId) {
                petName = apt.petId.name;
              }
              return (
                <li key={apt._id} className="p-6 border border-gray-200 dark:border-gray-600 rounded-xl shadow bg-[#FDF6F0] dark:bg-[#4A3F35] hover:shadow-lg transition-shadow duration-200 ease-in-out">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {/* Only show Scheduled if not editing this appointment */}
                      {editingAppointmentId !== apt._id && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                          Scheduled
                        </span>
                      )}
                      <span className="px-3 py-1 text-sm font-semibold text-white bg-[#EF92A6] rounded-full">
                        {formatted.service}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancelClick(apt._id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-red-600 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={apt.status && apt.status.toLowerCase() === 'cancelled'}
                      >
                        Cancel
                      </button>
                      {editingAppointmentId !== apt._id && (
                        <button
                          onClick={() => setEditingAppointmentId(apt._id)}
                          className="px-3 py-1 bg-[#664147] hover:bg-[#58383E] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150"
                          disabled={editingAppointmentId === apt._id}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  {editingAppointmentId === apt._id ? (
                    <EditAppointmentForm
                      appointment={apt}
                      onSave={handleEditSave}
                      onCancel={() => setEditingAppointmentId(null)}
                    />
                  ) : showCancelModal && cancelingAppointmentId === apt._id ? (
                    <CancelReasonModal
                      isOpen={true}
                      onClose={handleCancelModalClose}
                      onSubmit={handleCancelSubmit}
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-700 dark:text-gray-200"><strong className="font-medium text-gray-600 dark:text-gray-400">Pet:</strong> {petName}</p>
                          <p className="text-gray-700 dark:text-gray-200"><strong className="font-medium text-gray-600 dark:text-gray-400">Date:</strong> {new Date(formatted.date).toLocaleDateString()}</p>
                          <p className="text-gray-700 dark:text-gray-200"><strong className="font-medium text-gray-600 dark:text-gray-400">Time:</strong> {formatted.time}</p>
                        </div>
                        <div>
                          <p className="text-gray-700 dark:text-gray-200"><strong className="font-medium text-gray-600 dark:text-gray-400">Staff Member:</strong> {formatted.staffName}</p>
                          <p className="text-gray-700 dark:text-gray-200"><strong className="font-medium text-gray-600 dark:text-gray-400">Duration:</strong> {formatted.duration} min</p>
                          {formatted.cost && (
                            <p className="text-gray-700 dark:text-gray-200"><strong className="font-medium text-gray-600 dark:text-gray-400">Cost:</strong> ${formatted.cost}</p>
                          )}
                        </div>
                      </div>
                      {formatted.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300"><strong className="font-medium">Description:</strong> {formatted.description}</p>
                      )}
                      {formatted.notes && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300"><strong className="font-medium">Notes:</strong> {formatted.notes}</p>
                      )}
                    </>
                  )}
                </li>
              );
            })}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No upcoming appointments.</p>
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyAppointmentModal
          open={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          isSubmitting={isLoading}
          onConfirm={async (reason: string) => {
            setShowEmergencyModal(false);
            await handleEmergencyAppointmentClient(reason);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentViewClient;