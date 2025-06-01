import React, { useState, useEffect, useMemo } from 'react';
import TailwindCalendar from './TailwindCalendar';
import DashboardButton from './DashboardButton';
import AddAppointmentForm from './AddAppointmentForm';
import appointmentService from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types';

interface AppointmentViewProps {
  onBack: () => void;
}

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
    notes: appointment.notes || appointment.description,
    status: appointment.status,
    duration: appointment.duration,
    cost: appointment.cost,
    date: appointment.date
  };
};

const AppointmentView: React.FC<AppointmentViewProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [currentCalendarMonthView, setCurrentCalendarMonthView] = useState<Date>(new Date());

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
  }, [currentCalendarMonthView]);  const handleCancelAppointment = async (appointmentId: string) => {
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
        )
      );
      alert('Appointment cancelled successfully.');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment. Please try again.');
    }
  };const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
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
      alert(`Appointment status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update appointment status. Please try again.');
    }
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
  };
  const handleExportToExcel = async () => {
    if (appointments.length === 0) {
      alert("No appointments to export for the selected date.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Format the date for the API call (YYYY-MM-DD)
      const dateString = selectedDate.toLocaleDateString('en-CA');
      
      // Call the server-side Excel export endpoint
      const response = await fetch(`http://localhost:3000/api/appointments/export-excel?date=${dateString}`, {
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
      }

      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export appointments to Excel. Please try again.');
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
    <>      <div className="mb-8 text-center">
        <DashboardButton onClick={onBack} label="&larr; Back to Dashboard" />
      </div>      {/* Calendar and Export Section */}
      <section className="mb-8 p-6 bg-white dark:bg-[#664147] rounded-lg shadow-xl max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-4">Select Date to View Appointments</h2>        <div className="flex justify-center mb-6">
          <TailwindCalendar
            onChange={(value: Value) => handleDateChange(value)}
            value={selectedDate}
            locale="en-US"
            onActiveStartDateChange={({ activeStartDate }: { activeStartDate: Date | null }) => activeStartDate && setCurrentCalendarMonthView(activeStartDate)}
            tileContent={tileContent}
          />
        </div><div className="text-center">
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleExportToExcel}
              disabled={appointments.length === 0 || isLoading}
              className="px-6 py-3 bg-[#664147] text-white font-semibold rounded-lg shadow-md hover:bg-[#58383E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[#EF92A6] text-white font-semibold rounded-lg shadow-md hover:bg-[#E57D98] transition-colors duration-200"
            >
              Add New Appointment
            </button>
          </div>        </div>
      </section>      {/* Add Appointment Form Section */}
      {showAddForm && (
        <section className="mb-8 p-6 bg-white dark:bg-[#664147] rounded-lg shadow-xl max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors ml-auto"
            >
              Cancel
            </button>          </div>          <AddAppointmentForm
            onClose={() => setShowAddForm(false)}
            onAppointmentAdded={handleAppointmentAdded}
            selectedDate={selectedDate}
          />
        </section>
      )}      {/* Appointments List Section */}
      <section className="p-6 bg-white dark:bg-[#664147] rounded-lg shadow-xl max-w-4xl mx-auto">
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
                <li key={apt._id} className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-shadow duration-200 ease-in-out">                  <div className="flex justify-between items-start mb-4">
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
                    <div className="flex gap-2">
                      <select
                        value={formattedApt.status}
                        onChange={(e) => handleUpdateStatus(apt._id, e.target.value as AppointmentStatus)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-200"
                        disabled={formattedApt.status === AppointmentStatus.CANCELLED}
                      >
                        <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
                        <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                        <option value={AppointmentStatus.IN_PROGRESS}>In Progress</option>
                        <option value={AppointmentStatus.COMPLETED}>Completed</option>
                        <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                      </select>
                      <button
                        onClick={() => handleCancelAppointment(apt._id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-red-600 transition-colors duration-150"
                        disabled={formattedApt.status === AppointmentStatus.CANCELLED}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>                  
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Time:</strong> {formattedApt.time}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Client:</strong> {formattedApt.clientName}</p>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Pet:</strong> {formattedApt.petName}</p>
                    </div>
                    <div>                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Staff:</strong> {formattedApt.staffName}</p>
                      <p className="text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Duration:</strong> {formattedApt.duration} min</p>
                    </div>
                  </div>
                  
                  {formattedApt.cost && (
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300"><strong className="font-medium text-gray-600 dark:text-gray-400">Cost:</strong> ${formattedApt.cost}</p>
                  )}
                  
                  {formattedApt.notes && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><strong className="font-medium">Notes:</strong> {formattedApt.notes}</p>
                  )}
                </li>
              );
            })}
          </ul>        ) : (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No appointments scheduled for this date.</p>
          </div>
        )}
      </section>
    </>
  );
};

export default AppointmentView;
