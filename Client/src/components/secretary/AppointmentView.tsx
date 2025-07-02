import React, { useState, useEffect, useMemo } from 'react';
import TailwindCalendar from './TailwindCalendar';
import AddAppointmentForm from './AddAppointmentForm';
import AppointmentNotesInline from './AppointmentNotesInline';
import appointmentService from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types';
import { API_URL } from '../../config/api';
import EmergencyAppointmentModal from './EmergencyAppointmentModal';
import ConfirmCancelModal from './ConfirmCancelModal';
import { Download, Plus, AlertCircle } from 'lucide-react';

interface AppointmentViewProps {
  onBack: () => void;
}

const AppointmentView: React.FC<AppointmentViewProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [currentCalendarMonthView, setCurrentCalendarMonthView] = useState<Date>(new Date());
  // Inline notes state
  const [showNotesForAppointment, setShowNotesForAppointment] = useState<string | null>(null);
  const [notesEditMode, setNotesEditMode] = useState<boolean>(false);

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string>(''); const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [cancelAptId, setCancelAptId] = useState<string | null>(null);

  // Handler to open the cancel confirmation modal
  const handleRequestCancel = (appointmentId: string) => {
    setCancelAptId(appointmentId);
    setShowConfirmCancelModal(true);
  };

  // Handler to close the cancel confirmation modal
  const handleCloseCancelModal = () => {
    setShowConfirmCancelModal(false);
    setCancelAptId(null);
  };

  // Handler to confirm cancellation
  const handleConfirmCancel = async () => {
    if (cancelAptId) {
      await handleCancelAppointment(cancelAptId);
    }
    setShowConfirmCancelModal(false);
    setCancelAptId(null);
  };

  // Helper function to format appointment data for display
  const formatAppointmentForDisplay = (appointment: Appointment) => {
    // Handle populated vs unpopulated references
    const staff = typeof appointment.staffId === 'object' ? appointment.staffId : null;
    const pet = typeof appointment.petId === 'object' ? appointment.petId : null;
    const user = typeof appointment.userId === 'object' ? appointment.userId : null;

    return {
      id: appointment._id,
      time: appointment.time,
      clientName: user ? `${user.firstName} ${user.lastName}` : 'Unknown Client',
      petName: pet ? pet.name : 'Unknown Pet',
      service: appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace('_', ' '),
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff',
      description: appointment.description,
      notes: appointment.notes,
      status: appointment.status, // <-- Add status to the returned object
      duration: appointment.duration,
      cost: appointment.cost,
      date: appointment.date
    };
  };

  // Check for direct navigation to add form
  useEffect(() => {
    const showAddFormDirectly = sessionStorage.getItem("showAddFormDirectly");
    if (showAddFormDirectly === "true") {
      setShowAddForm(true);
      sessionStorage.removeItem("showAddFormDirectly"); // Clean up
    }
  }, []);

  // Load appointments for selected date
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Ensure we query based on the UTC equivalent of the selected local date at midnight
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth(); // 0-indexed
        const day = selectedDate.getDate();
        const dateForQuery = new Date(Date.UTC(year, month, day));

        const fetchedAppointments = await appointmentService.getAppointmentsByDate(dateForQuery);
        setAppointments(fetchedAppointments);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setError('Failed to load appointments. Please try again.');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, [selectedDate]);

  // Effect to load appointments for the current calendar month view
  useEffect(() => {
    const loadMonthlyAppointments = async () => {
      // setIsLoading(true); // Optionally set loading state for monthly view
      try {
        const year = currentCalendarMonthView.getFullYear();
        const month = currentCalendarMonthView.getMonth(); // 0-indexed

        const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)); // Start of the first day of the month, UTC
        const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)); // End of the last day of the month, UTC

        const fetchedMonthlyAppointments = await appointmentService.getAppointmentsByDateRange(startDate, endDate);
        setMonthlyAppointments(fetchedMonthlyAppointments);

      } catch (err) {
        console.error('Error loading monthly appointments:', err);
        // setError('Failed to load monthly appointments.'); // Optionally set error for monthly view
        setMonthlyAppointments([]);
      } finally {
        // setIsLoading(false); // Optionally set loading state for monthly view
      }
    };
    loadMonthlyAppointments();
  }, [currentCalendarMonthView]); const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      // Update the appointment status to CANCELLED instead of removing it
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt._id === appointmentId
            ? { ...apt, status: AppointmentStatus.CANCELLED }
            : apt
        )
      );
      // Also update monthly appointments to refresh calendar dots
      setMonthlyAppointments(prevMonthlyAppointments =>
        prevMonthlyAppointments.map(apt =>
          apt._id === appointmentId
            ? { ...apt, status: AppointmentStatus.CANCELLED }
            : apt
        ));
      showSuccessMessage('Appointment cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment. Please try again.');
    }
  }; const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt._id === appointmentId
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      // Also update monthly appointments to refresh calendar dots
      setMonthlyAppointments(prevMonthlyAppointments =>
        prevMonthlyAppointments.map(apt =>
          apt._id === appointmentId
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      // If status is changed to "completed", show inline notes
      if (newStatus === AppointmentStatus.COMPLETED) {
        setShowNotesForAppointment(appointmentId);
        setNotesEditMode(false);
      } else {
        showSuccessMessage(`Appointment status updated to ${newStatus}!`);
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status. Please try again.');
    }
  };

  // Handle opening inline notes for editing existing notes
  const handleEditNotes = (appointmentId: string) => {
    setShowNotesForAppointment(appointmentId);
    setNotesEditMode(true);
  };
  // Handle saving notes
  const handleSaveNotes = async (appointmentId: string, notes: string) => {
    try {
      await appointmentService.updateAppointment(appointmentId, { notes });

      // Update the appointment in state
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt._id === appointmentId
            ? { ...apt, notes }
            : apt
        )
      );

      // Also update monthly appointments if needed
      setMonthlyAppointments(prevMonthlyAppointments =>
        prevMonthlyAppointments.map(apt =>
          apt._id === appointmentId
            ? { ...apt, notes }
            : apt
        )
      );

      showSuccessMessage('Appointment notes saved successfully!');
    } catch (err) {
      console.error('Error saving appointment notes:', err);
      throw err; // Re-throw to let the inline component handle the error display
    }
  };
  // Handle closing inline notes
  const handleCloseInlineNotes = () => {
    setShowNotesForAppointment(null);
    setNotesEditMode(false);
  };

  // Function to show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // Auto-dismiss after 3 seconds
  };
  const handleAppointmentAdded = (newAppointment: Appointment) => {
    setShowAddForm(false);

    // Update the list of appointments for the selected day if the new appointment is on this day
    const newAppDate = new Date(newAppointment.date);
    // Compare using local date parts, assuming selectedDate is also local
    if (
      newAppDate.getFullYear() === selectedDate.getFullYear() &&
      newAppDate.getMonth() === selectedDate.getMonth() &&
      newAppDate.getDate() === selectedDate.getDate()
    ) {
      setAppointments(prevAppointments => [...prevAppointments, newAppointment]);
    }

    // Add the new appointment to the monthly appointments list to update calendar dots
    setMonthlyAppointments(prevMonthlyAppointments => [...prevMonthlyAppointments, newAppointment]);
  };

  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  }; const handleExportToExcel = async () => {
    if (appointments.length === 0) {
      setError("No appointments to export for the selected date.");
      return;
    }

    try {
      setIsLoading(true);

      // Format the date for the API call (YYYY-MM-DD)
      const dateString = selectedDate.toLocaleDateString('en-CA');

      // Call the server-side Excel export endpoint
      const response = await fetch(`${API_URL}/appointments/export-excel?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Appointments_${dateString}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessMessage('Appointments exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export appointments to Excel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED: return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case AppointmentStatus.CONFIRMED: return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case AppointmentStatus.IN_PROGRESS: return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case AppointmentStatus.COMPLETED: return 'text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800';
      case AppointmentStatus.CANCELLED: return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case AppointmentStatus.NO_SHOW: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Helper function to convert 12-hour time to 24-hour for sorting
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours}:${minutes}`;
  };

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      // Convert time to 24-hour format for sorting
      const timeA = convertTo24Hour(a.time);
      const timeB = convertTo24Hour(b.time);
      return timeA.localeCompare(timeB);
    });
  }, [appointments]);
  // Function to render a dot if there are appointments on a date (excluding cancelled ones)
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasActiveAppointment = monthlyAppointments.some((appointment) => {
        const appointmentDate = new Date(appointment.date); // appointment.date is typically a UTC timestamp string from server

        // Only show dot for appointments that are NOT cancelled
        const isActiveAppointment = appointment.status !== AppointmentStatus.CANCELLED;

        // Compare local year, month, and day of the appointment
        // with the local year, month, and day of the calendar tile.
        // 'date' (from react-calendar tile) is already a local date.
        // 'appointmentDate' (from new Date(appointment.date_from_server_UTC))
        // will give its local parts when getFullYear/Month/Date are called.
        return (
          isActiveAppointment &&
          appointmentDate.getFullYear() === date.getFullYear() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getDate() === date.getDate()
        );
      });
      if (hasActiveAppointment) {
        return <div className="appointment-dot"></div>;
      }
    }
    return null;
  };
  return (
    <>
      {/* Success Message Banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg border-l-4 border-green-700 transition-all duration-300 ease-in-out">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>)}

      {/* Calendar and Export Section */}
      <section className="mt-5 mb-8 p-6 bg-white dark:bg-darkModeLight rounded-lg shadow-xl max-w-7xl mx-auto">

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-wine font-[Nunito] dark:text-white mb-1">&#128197; View Appointments</h1>
          <p className="text-lg text-grayText dark:text-lightGrayText">Access calendar, view schedules, and export reports</p>
        </header>

        <div className="flex justify-center">
          <div className="w-fit">
            <h2 className="text-2xl font-semibold text-grayText dark:text-white mb-4 text-left lg:ml-0">Select Date to View Appointments Below</h2>
            <div className="flex flex-col lg:flex-row gap-8 items-start mb-6">
              <div className="flex justify-start lg:justify-center w-full lg:w-auto">
                <TailwindCalendar
                  onChange={(value: Value) => handleDateChange(value)}
                  value={selectedDate}
                  locale="en-US"
                  onActiveStartDateChange={({ activeStartDate }: { activeStartDate: Date | null }) => activeStartDate && setCurrentCalendarMonthView(activeStartDate)}
                  tileContent={tileContent}
                />
              </div>
              <div className="flex flex-col gap-6 w-full lg:w-110">
                <button
                  onClick={handleExportToExcel}
                  disabled={appointments.length === 0 || isLoading}
                  className="flex items-center justify-center gap-2 h-11 bg-wine text-white font-bold rounded-full hover:bg-wineDark transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full text-base sm:text-lg px-2 sm:px-4"
                >
                  <Download size={20} />
                  <span className="sm:hidden">Export today's meeting</span>
                  <span className="hidden sm:inline">
                    Export Appointments to Excel for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center justify-center gap-2 h-11 bg-pinkDark text-white font-bold rounded-full hover:bg-pinkDarkHover transition-colors duration-200 cursor-pointer w-full text-base sm:text-lg"
                >
                  <Plus size={20} />
                  Add New Appointment
                </button>
                <button
                  onClick={() => setShowEmergencyModal(true)}
                  className="flex items-center justify-center gap-2 h-11 bg-redButton text-white font-bold rounded-full hover:bg-redButtonDark transition-colors duration-200 cursor-pointer w-full text-base sm:text-lg"
                >
                  <AlertCircle size={20} />
                  Emergency Appointment
                </button>
              </div>
            </div>
          </div>
        </div>

      </section>

      {showEmergencyModal && (
        <EmergencyAppointmentModal
          open={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          onConfirm={async (reason, petId, patientId) => {
            setIsSubmittingEmergency(true);
            setError("");
            try {
              if (!patientId || !petId || !reason.trim()) {
                setError("Please select a patient, pet, and provide a description for the emergency.");
                setIsSubmittingEmergency(false);
                return;
              }
              await appointmentService.createEmergencyAppointment({
                userId: patientId,
                petId,
                description: reason,
                emergencyReason: reason || "EMERGENCY"
              });
              alert("Emergency appointment request sent! Please come to the clinic immediately. Our staff will contact you soon.");
              setShowEmergencyModal(false);
            } catch (err: any) {
              if (err instanceof Error) {
                setError(err.message);
              } else if (typeof err === 'object' && err !== null && 'message' in err) {
                setError((err as any).message);
              } else {
                setError('Failed to schedule emergency appointment.');
              }
            } finally {
              setIsSubmittingEmergency(false);
            }
          }}
          isSubmitting={isSubmittingEmergency}
        />
      )}

      {showConfirmCancelModal && (
        <ConfirmCancelModal
          isOpen={showConfirmCancelModal}
          onClose={handleCloseCancelModal}
          onConfirm={handleConfirmCancel}
        />
      )}

      {/* Add Appointment Form Section */}
      {showAddForm && (
        <section className="mb-8 p-6 bg-white dark:bg-[#664147] rounded-lg shadow-xl max-w-7xl mx-auto">
          <AddAppointmentForm
            onClose={() => setShowAddForm(false)}
            onAppointmentAdded={handleAppointmentAdded}
            selectedDate={selectedDate}
          />
        </section>
      )}      {/* Appointments List Section */}
      <section className="p-6 bg-white dark:bg-darkModeLight rounded-lg shadow-xl max-w-7xl mx-auto mb-10">
        <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-6">
          Appointments for {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Loading appointments...</p>
          </div>
        ) : sortedAppointments.length > 0 ? (
          <ul className="space-y-6">
            {sortedAppointments.map((apt) => {
              const formattedApt = formatAppointmentForDisplay(apt);
              return (
                <li key={apt._id} className="p-4 sm:p-6 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md bg-gray-50 dark:bg-darkMode hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col gap-2 sm:gap-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2 sm:gap-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(formattedApt.status)}`}>
                          {formattedApt.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="px-3 py-1 text-sm font-semibold text-white bg-[#EF92A6] rounded-full inline-block">
                        {formattedApt.service}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
                      {/* Hide status dropdown for cancelled appointments */}
                      {formattedApt.status !== AppointmentStatus.CANCELLED && (
                        <select
                          value={formattedApt.status}
                          onChange={(e) => handleUpdateStatus(apt._id, e.target.value as AppointmentStatus)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-200 w-full sm:w-auto"
                        >
                          <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
                          <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                          <option value={AppointmentStatus.IN_PROGRESS}>In Progress</option>
                          <option value={AppointmentStatus.COMPLETED}>Completed</option>
                          <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                        </select>
                      )}
                      {formattedApt.status === AppointmentStatus.COMPLETED && (
                        <button
                          onClick={() => handleEditNotes(apt._id)}
                          className="px-3 py-1 bg-[#EF92A6] text-white text-xs font-semibold rounded-md shadow-sm hover:bg-[#E57D98] transition-colors duration-150 w-full sm:w-auto"
                          title="Edit appointment notes"
                        >
                          {formattedApt.notes ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      )}
                      {/* Hide cancel button for cancelled appointments */}
                      {formattedApt.status !== AppointmentStatus.CANCELLED && (
                        <button
                          onClick={() => handleRequestCancel(apt._id)}
                          className="px-3 py-1 bg-redButton text-white text-xs font-semibold rounded-md shadow-sm hover:bg-redButtonDark cursor-pointer transition-colors duration-150 w-full sm:w-auto"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Time:</strong> {formattedApt.time}</p>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Client:</strong> {formattedApt.clientName}</p>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Pet:</strong> {formattedApt.petName}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Staff:</strong> {formattedApt.staffName}</p>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Duration:</strong> {formattedApt.duration} min</p>
                      {formattedApt.cost && (
                        <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Cost:</strong> ${formattedApt.cost}</p>
                      )}
                    </div>
                  </div>
                  {formattedApt.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><strong className="font-medium">Description:</strong> {formattedApt.description}</p>
                  )}
                  {formattedApt.notes && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><strong className="font-medium">Notes:</strong> {formattedApt.notes}</p>
                  )}

                  {/* Inline Notes Component */}
                  {showNotesForAppointment === apt._id && (
                    <AppointmentNotesInline
                      appointment={apt}
                      onSave={handleSaveNotes}
                      onCancel={handleCloseInlineNotes}
                      isEditMode={notesEditMode}
                    />
                  )}
                </li>
              );
            })}
          </ul>) : (<div className="flex justify-center items-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No appointments scheduled for this date.</p>
          </div>
        )}
      </section>
    </>
  );
};

export default AppointmentView;
