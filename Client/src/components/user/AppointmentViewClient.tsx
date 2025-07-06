import React, { useState, useEffect, useMemo } from 'react';
// Component for adding a new appointment (form)
import AddAppointmentFormToClient from './AddAppointmentFormToClient.tsx';
// Component for editing an existing appointment
import EditAppointmentForm from './EditAppointmentForm';
// Service for API calls related to appointments
import appointmentService from '../../services/appointmentService';
// Appointment type definition
import { Appointment } from '../../types';
// Navigation button for user section
import UserNavButton from './UserNavButton';
// Modal for entering cancel reason
import { CancelReasonModal } from './CancelReasonModal';

// Props for AppointmentViewClient component
interface AppointmentViewClientProps {
  onBack?: () => void; // Make this optional since it's not being used
}

// Helper function to format appointment data for display in the UI
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

// Main component for viewing, adding, editing, and canceling appointments for the client
const AppointmentViewClient: React.FC<AppointmentViewClientProps> = () => {
  // State variables for appointments, loading, errors, UI controls, etc.
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

  // Function to show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // Auto-dismiss after 3 seconds
  };

  // Function to load all appointments for the client's pets
  const loadAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const clientRaw = sessionStorage.getItem("client");
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
      // Only keep future appointments for each pet (including today)
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Set to start of today to include appointments for today
      let allAppointments: Appointment[] = [];
      
      for (const pet of client.pets) {
        try {
          // Check if pet is a string (ID) or an object with _id property
          const petId = typeof pet === 'string' ? pet : pet._id;
          
          if (!petId) {
          console.error('Invalid pet ID:', pet);
            continue;
          }
          
          const petAppointments = await appointmentService.getAppointmentsByPet(petId);
          
          const futurePetAppointments = petAppointments.filter(appt => {
            const apptDate = new Date(appt.date);
            apptDate.setHours(0, 0, 0, 0); // Set to start of appointment day
            return apptDate >= now;
          });
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

  // Check for direct navigation to add form (from other pages)
  useEffect(() => {
    const showAddFormDirectly = sessionStorage.getItem("showAddFormDirectly");
    if (showAddFormDirectly === "true") {
      setShowAddForm(true);
      sessionStorage.removeItem("showAddFormDirectly"); // Clean up
    }
  }, []);

  // Check for refresh trigger from emergency appointment creation
  useEffect(() => {
    const refreshFlag = sessionStorage.getItem("refreshAppointments");
    if (refreshFlag === "true") {
      loadAppointments();
      sessionStorage.removeItem("refreshAppointments"); // Clean up
    }
  }, []);

  // Add a visibility change listener to check for refresh flag when component becomes visible
  useEffect(() => {
    const checkForRefreshFlag = () => {
      const refreshFlag = sessionStorage.getItem("refreshAppointments");
      if (refreshFlag === "true") {
        loadAppointments();
        sessionStorage.removeItem("refreshAppointments");
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForRefreshFlag();
      }
    };

    const handleFocus = () => {
      checkForRefreshFlag();
    };

    // Check immediately when this effect runs
    checkForRefreshFlag();

    // Add multiple event listeners to catch different scenarios
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Also set up an interval to check periodically (as a fallback)
    const interval = setInterval(checkForRefreshFlag, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Memoized sorted appointments based on sort field and direction
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

  // Memoized filtered appointments by pet name
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

  // Handler for clicking cancel on an appointment
  const handleCancelClick = (appointmentId: string) => {
    setCancelingAppointmentId(appointmentId);
    setShowCancelModal(true);
  };

  // Handler for closing the cancel modal
  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelingAppointmentId(null);
  };

  // Handler for submitting a cancel reason
  const handleCancelSubmit = async (reason: string) => {
    if (!cancelingAppointmentId) return;
    setCancelReason(reason);
    setShowCancelModal(false);
    try {
      // Find the appointment being cancelled to check if it's an emergency
      const appointmentToCancel = appointments.find(apt => apt._id === cancelingAppointmentId);
      const isEmergencyAppointment = appointmentToCancel && appointmentToCancel.type === 'emergency_care';
      
      await appointmentService.cancelAppointment(cancelingAppointmentId, reason);
      showSuccessMessage('Appointment cancelled successfully!');
      
      // If it's an emergency appointment, reset the cooldown
      if (isEmergencyAppointment) {
        // Dispatch custom event to notify ClientPage to reset cooldown
        window.dispatchEvent(new CustomEvent('emergencyAppointmentCancelled'));
      }
      
      // Immediately reload appointments to refresh the count and list
      loadAppointments();
    } catch (err) {
      setError('Failed to cancel appointment.');
    } finally {
      setCancelingAppointmentId(null);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div 
        className="p-6 bg-white dark:bg-darkModeLight rounded-lg shadow-xl max-w-7xl mx-auto"
        style={{ width: "100%" }}
      >
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
        )}        {/* Header, now only the title and count */}
        {!showAddForm && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">            <div>              
            <h1 className="text-[21px] sm:text-3xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-4">Upcoming Appointments</h1>
            </div>
            {/* Desktop Add button */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-pinkDark text-white rounded-md text-sm font-medium hover:bg-pinkDarkHover cursor-pointer transition">
                Schedule an Appointment
              </button>
            </div>            {/* Mobile Add button - centered and full width with desktop style */}
            <div className="flex sm:hidden w-full py-1 px-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full mx-auto px-4 py-2 bg-pinkDark text-white rounded-md text-sm font-medium hover:bg-pinkDarkHover transition text-[12px]">
                Schedule an Appointment
              </button>
            </div>
          </div>
        )}
        {/* Search and Sort Controls */}
        {!showAddForm && (
          <div className="mb-8 space-y-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search-pet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search by Pet Name
              </label>
              <input
                id="search-pet"
                type="text"
                placeholder="Enter pet name..."
                className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base mobile:text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
              {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2 sm:gap-4 w-full sm:w-auto -ml-3 sm:ml-0">                <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort by:</label>
                  <select
                    id="sort-field"
                    value={sortField}
                    onChange={e => setSortField(e.target.value as any)}
                    className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-1 sm:flex-none max-w-[100px] sm:max-w-none"
                  >
                    <option value="date">Date</option>
                    <option value="petName">Pet Name</option>
                    <option value="staffName">Staff</option>
                    <option value="service">Service</option>                  
                    </select>
                </div>                <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Order:</label>
                  <select
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                    className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-1 sm:flex-none max-w-[130px] sm:max-w-none"
                  >
                    <option value="asc">Earliest</option>
                    <option value="desc">Latest</option>
                  </select>
                </div>
              </div>
              {/* DESKTOP ONLY: Refresh button */}
              <button
                onClick={() => {
                  setError('');
                  loadAppointments();
                }}
                disabled={isLoading}
                className="hidden sm:flex px-4 py-2 cursor-pointer bg-[var(--color-wine)] dark:bg-[#58383E] text-white rounded-md hover:bg-opacity-90 dark:hover:bg-[#4A2F33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>            {/* MOBILE ONLY: Refresh button */}
            <div className="block sm:hidden w-full py-1 px-2 mb-4">              <button
                onClick={() => {
                  if (!isLoading) {
                    setError('');
                    loadAppointments();
                  }
                }}
                disabled={isLoading}
                className="w-full mx-auto px-4 py-2 bg-[var(--color-wine)] dark:bg-[#58383E] text-white rounded-md hover:bg-opacity-90 dark:hover:bg-[#4A2F33] transition-colors text-[12px] flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
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
          </div>        )}        {/* Showing appointment count */}
        {!showAddForm && !isLoading && !error && (
          <div className="mb-4 text-[14px] sm:text-base text-gray-700 dark:text-gray-300 font-medium" style={{ color: 'var(--color-skyDark)' }}>
            Showing {filteredAppointments.filter(apt => apt.status && apt.status.toLowerCase() !== 'cancelled').length} upcoming appointment{filteredAppointments.filter(apt => apt.status && apt.status.toLowerCase() !== 'cancelled').length !== 1 ? 's' : ''}
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">Loading appointments...</p>
        ) : filteredAppointments && filteredAppointments.length > 0 ? (
          <ul className="space-y-6">
            {filteredAppointments
              .filter(apt => apt.status && apt.status.toLowerCase() !== 'cancelled')
              .map(apt => {
                const formatted = formatAppointmentForDisplay(apt);
                let petName = formatted.petName;
                if (petName === 'Unknown Pet' && apt.petId && typeof apt.petId === 'object' && 'name' in apt.petId) {
                  petName = apt.petId.name;
                }
                return (
                  <li key={apt._id} className="p-6 border border-gray-200 dark:border-gray-600 rounded-xl shadow bg-[#FDF6F0] dark:bg-darkMode hover:shadow-lg transition-shadow duration-200 ease-in-out">                    {/* Desktop view header */}
                    <div className="hidden sm:flex sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0]">
                          {petName}
                        </h2>
                        <span className="px-3 py-1 text-sm font-semibold text-white bg-[#EF92A6] rounded-full">
                          {formatted.service}
                        </span>
                      </div>                      <div className="flex gap-2 min-w-[160px]">
                        {editingAppointmentId !== apt._id && (
                          <button
                            onClick={() => handleCancelClick(apt._id)}
                            className="flex-1 px-3 py-1 bg-redButton text-white text-xs font-semibold rounded-md shadow-sm hover:bg-redButtonDark cursor-pointer transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed min-w-[70px]"
                            disabled={apt.status && apt.status.toLowerCase() === 'cancelled'}
                          >
                            Cancel
                          </button>
                        )}
                        {editingAppointmentId !== apt._id && (
                          <button
                            onClick={() => setEditingAppointmentId(apt._id)}
                            className="flex-1 px-3 py-1 bg-wine hover:bg-wineDark cursor-pointer text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 min-w-[70px]"
                            disabled={editingAppointmentId === apt._id}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>                    {/* Mobile view header */}                    <div className="flex flex-col sm:hidden mb-4 gap-1">
                      <div>
                        <h2 className="text-[18px] font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-1">
                          {petName}
                        </h2>                      </div>                      <div>
                        <span className="px-2 py-1 text-xs font-medium text-white bg-[#EF92A6] rounded-full">
                          {formatted.service}
                        </span>
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
                      />                    ) : (
                      <>
                        {/* Desktop view */}
                        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Date:</span>
                              <span className="ml-2 text-sm text-black dark:text-[#FDF6F0]">{new Date(formatted.date).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Time:</span>
                              <span className="ml-2 text-sm text-black dark:text-[#FDF6F0]">{formatted.time}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[120px]">Staff Member:</span>
                              <span className="ml-2 text-sm text-black dark:text-[#FDF6F0]">{formatted.staffName}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[120px]">Duration:</span>
                              <span className="ml-2 text-sm text-black dark:text-[#FDF6F0]">{formatted.duration} min</span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile view with horizontal separators and right-aligned labels */}
                        <div className="sm:hidden pt-2">
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Date:</span>
                            <span className="text-xs text-black dark:text-gray-100 text-right">{new Date(formatted.date).toLocaleDateString('en-GB')}</span>
                          </div>
                          <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Time:</span>
                            <span className="text-xs text-black dark:text-gray-100 text-right">{formatted.time}</span>
                          </div>
                          <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Staff:</span>
                            <span className="text-xs text-black dark:text-gray-100 text-right">{formatted.staffName}</span>
                          </div>
                          <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Duration:</span>
                            <span className="text-xs text-black dark:text-gray-100 text-right">{formatted.duration} min</span>
                          </div>                        </div>
                      </>
                    )}
                    
                    {/* Description and Notes with styling matching TreatmentCard */}
                    {!editingAppointmentId && !showCancelModal && (
                      <>
                                        {formatted.description && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white dark:bg-darkModeDark rounded-lg border border-gray-200 dark:border-gray-600">
                        {/* Desktop view */}
                        <div className="hidden sm:flex sm:items-start">
                          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] sm:mr-3 mb-1 sm:mb-0 flex-shrink-0">Description:</span>
                          <p className="text-sm sm:text-base text-black dark:text-gray-200 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap flex-1">{formatted.description}</p>
                        </div>
                        {/* Mobile view */}
                        <div className="sm:hidden">
                          <div className="flex justify-between items-start py-2">
                            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Description:</span>
                          </div>
                          <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0] mt-1 pt-2">
                            <p className="text-xs text-black dark:text-gray-200 leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">{formatted.description}</p>
                          </div>
                        </div>
                      </div>
                    )}

                        
                        {/* Mobile action buttons - shown below description/notes */}
                        <div className="sm:hidden flex gap-2 mt-3">
                          {editingAppointmentId !== apt._id && (
                            <button
                              onClick={() => handleCancelClick(apt._id)}
                              className="flex-1 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-red-600 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                              disabled={apt.status && apt.status.toLowerCase() === 'cancelled'}
                            >
                              Cancel
                            </button>
                          )}
                          {editingAppointmentId !== apt._id && (
                            <button
                              onClick={() => setEditingAppointmentId(apt._id)}
                              className="flex-1 px-3 py-1 bg-[#664147] hover:bg-[#58383E] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150"
                              disabled={editingAppointmentId === apt._id}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">No upcoming appointments.</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentViewClient;