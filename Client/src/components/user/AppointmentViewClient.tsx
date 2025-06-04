import React, { useState, useEffect, useMemo } from 'react';
import AddAppointmentFormToClient from './AddAppointmentFormToClient.tsx';
import appointmentService from '../../services/appointmentService';
import { Appointment } from '../../types';
import UserNavButton from './UserNavButton';

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
  const [searchTerm, setSearchTerm] = useState("");

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
            const petAppointments = await appointmentService.getAppointmentsByPet(pet._id);
            const futurePetAppointments = petAppointments.filter(appt => new Date(appt.date) >= now);
            allAppointments = allAppointments.concat(futurePetAppointments as Appointment[]);
          } catch (err) {
            // Optionally handle per-pet errors
            console.error(`Failed to load appointments for pet ${pet.name}:`, err);
          }
        }
        // Deduplicate appointments by _id
        const dedupedAppointments = Array.from(new Map(allAppointments.map(appt => [appt._id, appt])).values());
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

    loadAppointments();
  }, []);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

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

  const handleAppointmentAdded = (newAppointment: Appointment) => {
    setShowAddForm(false);
    if (new Date(newAppointment.date) >= new Date()) {
      setAppointments(prev => {
        const updated = [...prev, newAppointment];
        // Deduplicate by _id
        return Array.from(new Map(updated.map(appt => [appt._id, appt])).values());
      });
    }
  };
  

 return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-[#664147] rounded-lg shadow-xl">
      {/* Header and search bar, styled like Treatment History */}
      {!showAddForm && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#4A3F35] dark:text-[#FDF6F0] mb-1">My Upcoming Appointments</h1>
            <div className="text-sm text-gray-500 dark:text-gray-300">
              Showing {filteredAppointments.filter(apt => apt.status && apt.status.toLowerCase() === 'scheduled').length} appointments
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="search-pet" className="sr-only">Search by Pet Name</label>
            <input
              id="search-pet"
              type="text"
              placeholder="Enter pet name..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ minWidth: 200 }}
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] transition"
            >
              Add New Appointment
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
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">Loading appointments...</p>
      ) : filteredAppointments && filteredAppointments.length > 0 ? (
        <ul className="space-y-4">
          {filteredAppointments
            .filter(apt => apt.status && apt.status.toLowerCase() === 'scheduled')
            .map(apt => {
              const formatted = formatAppointmentForDisplay(apt);
              let petName = formatted.petName;
              if (petName === 'Unknown Pet' && apt.petId && typeof apt.petId === 'object' && 'name' in apt.petId) {
                petName = apt.petId.name;
              }
              return (
                <li key={apt._id} className="p-4 border rounded shadow bg-[#FDF6F0] dark:bg-[#664147] flex flex-col relative">
                  <UserNavButton
                    label="Cancel Appointment"
                    onClick={async () => {
                      try {
                        await appointmentService.cancelAppointment(apt._id);
                        // After cancel, reload appointments using the same logic as initial load
                        const clientRaw = localStorage.getItem("client");
                        if (!clientRaw) return;
                        const client = JSON.parse(clientRaw);
                        if (!client.pets || client.pets.length === 0) {
                          setAppointments([]);
                          return;
                        }
                        const now = new Date();
                        let allAppointments: Appointment[] = [];
                        for (const pet of client.pets) {
                          try {
                            const petAppointments = await appointmentService.getAppointmentsByPet(pet._id);
                            const futurePetAppointments = petAppointments.filter(appt => new Date(appt.date) >= now);
                            allAppointments = allAppointments.concat(futurePetAppointments as Appointment[]);
                          } catch (err) {
                            // Optionally handle per-pet errors
                          }
                        }
                        // Deduplicate appointments by _id
                        const dedupedAppointments = Array.from(new Map(allAppointments.map(appt => [appt._id, appt])).values());
                        setAppointments(dedupedAppointments);
                      } catch (err) {
                        alert('Failed to cancel appointment.');
                      }
                    }}
                    className="user-cancel-btn"
                  />
                  <div className="mt-2">
                    <p><strong>Pet:</strong> {petName}</p>
                    <p><strong>Date:</strong> {new Date(formatted.date).toLocaleDateString()}</p>
                    <p><strong>Service:</strong> {formatted.service}</p>
                    <p><strong>Staff Member:</strong> {formatted.staffName}</p>
                    {formatted.notes && <p><strong>Notes:</strong> {formatted.notes}</p>}
                  </div>
                </li>
              );
            })}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No upcoming appointments.</p>
      )}
    </div>
  );
};

export default AppointmentViewClient;