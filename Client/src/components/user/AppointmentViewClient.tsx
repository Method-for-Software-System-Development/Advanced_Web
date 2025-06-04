import React, { useState, useEffect, useMemo } from 'react';
import AddAppointmentFormToClient from './AddAppointmentFormToClient.tsx';
import appointmentService from '../../services/appointmentService';
import { Appointment } from '../../types';


interface AppointmentViewClientProps {
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

const AppointmentViewClient: React.FC<AppointmentViewClientProps> = ({ onBack }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
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
        // TEMP: fallback to getAllAppointments if getAppointmentsByUser fails
        let allAppointments = [];
        try {
          allAppointments = await appointmentService.getAppointmentsByUser(client._id);
        } catch (err) {
          // fallback to old method if route fails
          allAppointments = await appointmentService.getAllAppointments({ userId: client._id });
        }
        const now = new Date();
        const futureAppointments = allAppointments.filter(appt => new Date(appt.date) >= now);
        setAppointments(futureAppointments);
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

    loadAppointments();
  }, []);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const handleAppointmentAdded = (newAppointment: Appointment) => {
    setShowAddForm(false);
    if (new Date(newAppointment.date) >= new Date()) {
      setAppointments(prev => [...prev, newAppointment]);
    }
  };
  

 return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-[#664147] rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-[#4A3F35] dark:text-[#FDF6F0]">My Upcoming Appointments</h1>

      <button
        onClick={() => setShowAddForm(true)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Add New Appointment
      </button>

      {showAddForm && (
        <section className="mb-8">
          <AddAppointmentFormToClient
            onClose={() => setShowAddForm(false)}
            onAppointmentAdded={handleAppointmentAdded}
            selectedDate={new Date()}
          />
        </section>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">Loading appointments...</p>
      ) : sortedAppointments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">No upcoming appointments.</p>
      ) : (
        <ul className="space-y-4">
          {sortedAppointments.map(apt => {
            const formatted = formatAppointmentForDisplay(apt);
            return (
              <li key={apt._id} className="p-4 border rounded shadow bg-gray-50 dark:bg-gray-700">
                <p><strong>Date:</strong> {new Date(formatted.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {formatted.time}</p>
                <p><strong>Service:</strong> {formatted.service}</p>
                <p><strong>Status:</strong> {formatted.status}</p>
                {formatted.notes && <p><strong>Notes:</strong> {formatted.notes}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AppointmentViewClient;