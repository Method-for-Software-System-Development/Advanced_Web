import React, { useEffect, useState } from "react";
import { Treatment } from "../../types";

interface PetLastTreatmentProps {
  petId: string;
}

const PetLastTreatment: React.FC<PetLastTreatmentProps> = ({ petId }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTreatments = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`http://localhost:3000/api/treatments/pet/${petId}/sorted`);
      if (!response.ok) {
        throw new Error("Failed to fetch treatments");
      }
      const data = await response.json();
      setTreatments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load treatment information");
      console.error("Error fetching treatments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
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
          onClick={fetchTreatments}
          className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md text-sm hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  if (!treatments.length) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-[#4A2F33] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-300 font-medium">No treatments found</p>
        <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">This pet has no treatment history yet</p>
      </div>
    );
  }
  const treatment = treatments[0];
  return (
    <div className="bg-white dark:bg-[#58383E] rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🏥</span>
        <h4 className="font-bold text-[#664147] dark:text-[#FDF6F0] text-xl">Most Recent Treatment</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Date:</span>
            <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {new Date(treatment.visitDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })} at {treatment.visitTime}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Type:</span>
            <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              {treatment.treatmentType}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Cost:</span>
            <span className="ml-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
              ${treatment.cost}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] min-w-[80px]">Category:</span>
            <span className="ml-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
              {treatment.visitationCategory}
            </span>
          </div>
        </div>
      </div>
      
      {treatment.notes && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-[#4A2F33] rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-start">
            <span className="font-semibold text-[#664147] dark:text-[#FDF6F0] mr-3 mt-1">Notes:</span>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{treatment.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetLastTreatment;
