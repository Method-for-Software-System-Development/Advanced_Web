import React, { useEffect, useState } from "react";
import { appointmentService } from "../../services/appointmentService";
import { AppointmentStatus } from "../../types";

interface PetLastTreatmentProps {
  petId: string;
}

// Type for transformed appointment data to match display format
interface TreatmentData {
  visitDate: string;
  visitTime: string;
  treatmentType: string;
  cost: number;
  visitationCategory: string;
  notes: string;
  vetName: string;
}

const PetLastTreatment: React.FC<PetLastTreatmentProps> = ({ petId }) => {
  const [lastTreatment, setLastTreatment] = useState<TreatmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLastTreatment = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Fetch completed appointments for this pet
      const appointments = await appointmentService.getAllAppointments({
        petId: petId,
        status: AppointmentStatus.COMPLETED
      });

      if (appointments.length > 0) {
        // Sort by date descending to get the most recent
        const sortedAppointments = appointments.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const mostRecentAppointment = sortedAppointments[0];
        
        // Transform appointment data to match treatment display format
        const staff = typeof mostRecentAppointment.staffId === 'object' 
          ? mostRecentAppointment.staffId 
          : null;
        
        const transformedTreatment: TreatmentData = {
          visitDate: mostRecentAppointment.date,
          visitTime: mostRecentAppointment.time,
          treatmentType: mostRecentAppointment.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          cost: mostRecentAppointment.cost || 0,
          visitationCategory: mostRecentAppointment.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          notes: mostRecentAppointment.notes || 'No notes available',
          vetName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Vet'
        };
        
        setLastTreatment(transformedTreatment);
      } else {
        setLastTreatment(null);
      }
    } catch (err) {
      setError("Unable to load treatment information");
      console.error("Error fetching last treatment:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLastTreatment();
  }, [petId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-[#664147] dark:text-[#FDF6F0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[#664147] dark:text-[#FDF6F0] font-medium">Loading treatment history...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-600 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-red-400 dark:text-red-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700 dark:text-red-200 font-medium">{error}</span>
        </div>
        <button
          onClick={fetchLastTreatment}
          className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md text-sm hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }    if (!lastTreatment) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-darkModeLight rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-300 font-medium flex items-center justify-center gap-2">
          <svg className="h-6 w-6 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          No Treatments Found
        </p>
      </div>
    );
  }return (    <div className="bg-gray-50 dark:bg-darkModeLight rounded-lg shadow w-full">
      <div className="mb-3 sm:mb-4 p-3 sm:p-4">
        <h4 className="font-bold text-[#664147] dark:text-[#FDF6F0] text-[17px] sm:text-xl">Most Recent Treatment</h4>
      </div>      {/* Desktop grid view */}
      <div className="hidden sm:block p-3 sm:p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Date:</span>
              <span className="ml-2 text-[#664147] dark:text-[#FDF6F0] text-sm font-medium">
                {new Date(lastTreatment.visitDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })} at {lastTreatment.visitTime}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Type:</span>
              <span className="ml-2 text-[#664147] dark:text-[#FDF6F0] text-sm font-medium">
                {lastTreatment.treatmentType}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Vet:</span>
              <span className="ml-2 text-[#664147] dark:text-[#FDF6F0] text-sm font-medium">
                {lastTreatment.vetName}
              </span>
            </div>
          </div>
            <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Cost:</span>
              <span className="ml-2 text-[#664147] dark:text-[#FDF6F0] text-sm font-medium">
                {lastTreatment.cost}$
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Category:</span>
              <span className="ml-2 text-[#664147] dark:text-[#FDF6F0] text-sm font-medium">
                {lastTreatment.visitationCategory}
              </span>
            </div>
          </div>
        </div>
      </div>      {/* Mobile stacked view */}
      <div className="sm:hidden p-3 sm:p-4 pt-0">
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Date:</span>
          <span className="text-xs text-right text-[var(--color-wine)] dark:text-[#FDF6F0]">
            {new Date(lastTreatment.visitDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })} at {lastTreatment.visitTime}
          </span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Type:</span>
          <span className="text-xs text-right break-words text-[var(--color-wine)] dark:text-[#FDF6F0]">{lastTreatment.treatmentType}</span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Vet:</span>
          <span className="text-xs text-right break-words text-[var(--color-wine)] dark:text-[#FDF6F0]">{lastTreatment.vetName}</span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Cost:</span>
          <span className="text-xs text-right text-[var(--color-wine)] dark:text-[#FDF6F0]">${lastTreatment.cost}</span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Category:</span>
          <span className="text-xs text-right break-words text-[var(--color-wine)] dark:text-[#FDF6F0]">{lastTreatment.visitationCategory}</span>
        </div>      </div>      {lastTreatment.notes && lastTreatment.notes !== 'No notes available' && (
        <div className="p-3 sm:p-4 pt-0">
          <div className="bg-white dark:bg-darkModeDark rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
            {/* Desktop view */}
            <div className="hidden sm:flex sm:items-start">
              <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] sm:mr-3 flex-shrink-0"> Notes:</span>
              <p className="text-xs sm:text-base text-[#664147] dark:text-[#FDF6F0] leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap flex-1">{lastTreatment.notes}</p>
            </div>
            
            {/* Mobile view */}
            <div className="sm:hidden">
              <div className="flex justify-between items-start py-2">
                <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs"> Notes:</span>
              </div>
              <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0] mt-1 pt-2">
                <p className="text-xs text-[#664147] dark:text-[#FDF6F0] leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">{lastTreatment.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetLastTreatment;
