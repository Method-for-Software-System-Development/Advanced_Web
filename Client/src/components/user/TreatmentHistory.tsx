import React, { useEffect, useState } from "react";
import TreatmentCard from "./TreatmentCard";
import UserNavButton from "./UserNavButton";
import { appointmentService } from "../../services/appointmentService";
import { Appointment, AppointmentStatus } from "../../types";
import { API_URL } from '../../config/api';

// Type for transformed appointment data to match TreatmentCard props
interface TreatmentHistoryItem {
  _id: string;
  petName: string;
  visitDate: string;
  vetName: string;
  visitationType: string;
  cost: number;
  notes: string;
  description: string;
}

const TreatmentHistory: React.FC = () => {
  const [appointments, setAppointments] = useState<TreatmentHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'pet' | 'cost'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');// Function to show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // Auto-dismiss after 3 seconds
  };
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const clientRaw = sessionStorage.getItem("client");
      if (!clientRaw) {
        setError('Please log in to view treatment history.');
        return;
      }

      const client = JSON.parse(clientRaw);
      // Support both array of pet objects and array of pet IDs
      let petIds: string[] = [];
      let petIdToName: Record<string, string> = {};
      if (Array.isArray(client.pets)) {
        if (typeof client.pets[0] === "object" && client.pets[0]?._id) {
          petIds = client.pets.map((p: any) => p._id);
          client.pets.forEach((p: any) => { petIdToName[p._id] = p.name; });
        } else {
          petIds = client.pets;
        }
      }

      if (petIds.length === 0) {
        setError('No pets found for this account.');
        return;
      }

      // Fetch completed appointments for all pets
      const allAppointments: Appointment[] = [];
      for (const petId of petIds) {
        const petAppointments = await appointmentService.getAllAppointments({
          petId: petId,
          status: AppointmentStatus.COMPLETED
        });
        allAppointments.push(...petAppointments);
      }      // If we don't have pet names, fetch them
      if (Object.keys(petIdToName).length !== petIds.length) {
        // Fetch all pets in parallel
        const petResults = await Promise.all(
          petIds.map(async (id) => {
            if (petIdToName[id]) return { _id: id, name: petIdToName[id] };
            const petRes = await fetch(`${API_URL}/pets/${id}`);
            const pet = petRes.ok ? await petRes.json() : null;
            return { _id: id, name: pet?.name || "Unknown" };
          })
        );
        petResults.forEach((p) => { petIdToName[p._id] = p.name; });
      }

      // Transform appointments to match TreatmentCard props
      const transformedAppointments = allAppointments.map((appointment) => {
        const pet = typeof appointment.petId === 'object' ? appointment.petId : null;
        const staff = typeof appointment.staffId === 'object' ? appointment.staffId : null;
        const petName = pet ? pet.name : petIdToName[appointment.petId as string] || "Unknown";
        const vetName = staff ? `${staff.firstName} ${staff.lastName}` : "Unknown Vet";
        
        return {
          _id: appointment._id,
          petName,
          visitDate: appointment.date,
          vetName,
          visitationType: appointment.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          cost: appointment.cost || 0,
          notes: appointment.notes || 'No notes available',
          description: appointment.description || 'No description available',
          // Keep original appointment data for potential future use
          originalAppointment: appointment
        };
      });

      setAppointments(transformedAppointments);
        // Show success message if appointments were loaded
      if (transformedAppointments.length > 0) {
        showSuccessMessage(`Successfully loaded ${transformedAppointments.length} completed appointment${transformedAppointments.length !== 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError('Failed to load treatment history. Please try again.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = appointments.filter((item) =>
    item.petName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the filtered treatments
  const sortedAndFiltered = [...filtered].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.visitDate).getTime();
        bValue = new Date(b.visitDate).getTime();
        break;
      case 'pet':
        aValue = a.petName?.toLowerCase() || '';
        bValue = b.petName?.toLowerCase() || '';
        break;
      case 'cost':
        aValue = a.cost || 0;
        bValue = b.cost || 0;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });  return (
    <div className="flex justify-center w-full min-h-[600px]">
      <div
        className="w-full max-w-5xl bg-white dark:bg-[#664147] rounded-2xl shadow-lg p-10 flex flex-col gap-10 mt-8 mobile:w-full"
        style={{ width: "80%" }}
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
        )}

        <h2 className="text-3xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-6">Treatment History</h2>        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
            <div className="mt-2">
              <button
                onClick={() => {
                  setError('');
                  fetchAppointments();
                }}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
              <span className="text-lg text-[var(--color-wine)] dark:text-[#FDF6F0]">Loading treatment history...</span>
            </div>
          </div>
        )}        {/* Search and Sort Controls */}
        {!isLoading && !error && (
          <div className="mb-8 space-y-4">            {/* Search Input */}
            <div>
              <label htmlFor="searchPatients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search by Pet Name
              </label>
              <input
                type="text"
                id="searchPatients"
                placeholder="Enter pet name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base mobile:text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2 sm:gap-4 w-full sm:w-auto -ml-3 sm:ml-0">                <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'pet' | 'cost')}
                    className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-1 sm:flex-none max-w-[100px] sm:max-w-none"
                  >
                    <option value="date">Date</option>
                    <option value="pet">Pet Name</option>
                    <option value="cost">Cost</option>
                  </select>
                </div>                <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Order:</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-1 sm:flex-none max-w-[130px] sm:max-w-none"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>              {/* Desktop refresh button */}
              <button
                onClick={() => {
                  setError('');
                  fetchAppointments();
                }}
                disabled={isLoading}
                className="hidden sm:flex px-4 py-2 bg-[var(--color-wine)] dark:bg-[#58383E] text-white rounded-md hover:bg-opacity-90 dark:hover:bg-[#4A2F33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>                Refresh
              </button>
            </div>

            {/* Mobile refresh button */}
            <div className="block sm:hidden w-full py-1 px-2 mb-4">
              <UserNavButton
                label="Refresh"
                onClick={() => {
                  if (!isLoading) {
                    setError('');
                    fetchAppointments();
                  }
                }}
                className={`w-full mx-auto text-[12px] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        )}        {/* Results Count and Treatment List */}
        {!isLoading && !error && (
          <>            <div className="mb-4 text-[10px] sm:text-base text-gray-700 dark:text-gray-300 font-medium" style={{ color: 'var(--color-skyDark)' }}>
              Showing {sortedAndFiltered.length} completed appointment{sortedAndFiltered.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </div><div className="space-y-6">
              {sortedAndFiltered.length > 0 ? (
                sortedAndFiltered.map((item, index) => (
                  <TreatmentCard
                    key={item._id || index}
                    petName={item.petName}
                    visitDate={item.visitDate}
                    vetName={item.vetName}
                    visitationType={item.visitationType}
                    cost={item.cost}
                    notes={item.notes}
                    description={item.description}
                  />
                ))              ) : (<div className="text-center py-12">
                  <p className="text-[var(--color-greyText)] dark:text-gray-300 text-lg mb-4">
                    {searchTerm ? `No completed appointments found matching "${searchTerm}"` : "No completed appointments found."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TreatmentHistory;
