
import React, { useState, useEffect } from "react";
import { Pet, Patient } from '../../../types';
import { API_URL } from '../../../config/api';

/**
 * EmergencyAppointmentModal
 * Modal for submitting an emergency appointment request for a pet.
 * Allows the user to select a pet, describe the emergency, and confirm the high-fee emergency request.
 *
 * Props:
 * - open: Whether the modal is visible
 * - onClose: Function to close the modal
 * - onConfirm: Function called with (reason, petId) when submitting
 * - isSubmitting: Whether the form is currently submitting
 * - error: Optional error message to display
 */

interface EmergencyAppointmentModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close the modal */
  onClose: () => void;
  /** Confirm the emergency appointment (reason, petId) */
  onConfirm: (emergencyReason: string, petId: string) => void;
  /** Is the form submitting */
  isSubmitting: boolean;
  /** Optional error message */
  error?: string | null;
}


const EmergencyAppointmentModal: React.FC<EmergencyAppointmentModalProps> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}) => {
  // State for the emergency reason/description
  const [reason, setReason] = useState("");
  // State for the confirmation checkbox
  const [checked, setChecked] = useState(false);
  // State for the client's pets (full objects)
  const [clientPets, setClientPets] = useState<Pet[]>([]);
  // State for the client object
  const [client, setClient] = useState<Patient | null>(null);
  // State for the selected pet ID
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  /**
   * Loads client and pet data from sessionStorage when modal opens.
   * Handles both pet objects and pet ID arrays.
   * Filters out inactive pets.
   */
  useEffect(() => {
    if (!open) return;
    try {
      const clientRaw = sessionStorage.getItem("client");
      if (!clientRaw) return;
      const parsedClient = JSON.parse(clientRaw);
      setClient(parsedClient);
      if (parsedClient.pets && parsedClient.pets.length > 0) {
        let petsArr = parsedClient.pets;
        // If pets are stored as IDs, fetch their full objects from the server
        if (typeof petsArr[0] === 'string') {
          const validPetIds = petsArr.filter((id: string) => typeof id === 'string' && id.length === 24);
          if (validPetIds.length === 0) {
            setClientPets([]); setSelectedPetId(null);
            return;
          }
          fetch(`${API_URL}/pets/byIds`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: validPetIds }),
          })
            .then((res) => res.json())
            .then((data) => {
              // Only include active pets
              const activePets = Array.isArray(data) ? data.filter((pet: any) => pet.isActive !== false) : [];
              setClientPets(activePets);
              if (activePets.length > 0) {
                setSelectedPetId(activePets[0]._id);
              } else {
                setSelectedPetId(null);
              }
            })
            .catch(() => {
              setClientPets([]);
              setSelectedPetId(null);
            });
        } else {
          // If pets are already objects, just filter for active
          const activePets = petsArr.filter((pet: any) => pet.isActive !== false);
          setClientPets(activePets);
          if (activePets.length > 0) {
            setSelectedPetId(activePets[0]._id);
          } else {
            setSelectedPetId(null);
          }
        }
      } else {
        setClientPets([]);
        setSelectedPetId(null);
      }
    } catch { }
  }, [open]);

  /**
   * Handles checkbox state for user confirmation
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  };

  // Do not render modal if not open
  if (!open) return null;

  return (
    // Modal overlay and dialog
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8d7da]/80 backdrop-blur-sm">
      <div className="relative w-[95vw] max-w-xs sm:w-full sm:max-w-md bg-[#FDF6F0] dark:bg-darkMode p-3 sm:p-8 rounded-xl shadow-xl border border-[#EF92A6] dark:border-[#D17C8F] animate-fadeIn">
        {/* Close (X) button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-[#EF92A6] dark:hover:text-[#D17C8F] text-xl sm:text-2xl font-bold focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="mb-4 sm:mb-6 text-center">
          <span className="text-2xl sm:text-4xl block mb-2">🚨</span>
          <h2 className="text-lg sm:text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-2">Emergency Appointment Confirmation</h2>
          <div className="h-1 w-8 sm:w-16 bg-[#EF92A6] rounded-full mx-auto mb-2"></div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
            <b className="text-red-700 dark:text-red-400">This is an emergency request ($1000 charge)</b><br />
            Please arrive at the clinic immediately. Our staff will contact you right away.
          </p>
        </div>
        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-200 text-red-900 rounded-lg border border-red-400 text-center">
            {error}
          </div>
        )}

        {/* Pet selection dropdown */}
        {client && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Pet:</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={selectedPetId || ''}
              onChange={e => setSelectedPetId(e.target.value)}
              disabled={isSubmitting || clientPets.length === 0}
            >
              <option value="" disabled>Select a pet...</option>
              {clientPets.map(pet => (
                <option key={pet._id} value={pet._id}>{pet.name}</option>
              ))}
            </select>
          </div>
        )}
        {/* Emergency reason textarea and confirmation checkbox */}
        <form onSubmit={e => { e.preventDefault(); if (selectedPetId) onConfirm(reason, selectedPetId); }} className="space-y-6">
          <div>
            <textarea
              placeholder="Briefly describe what happened (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="emergency-confirm"
              checked={checked}
              onChange={handleCheckboxChange}
              className="mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="emergency-confirm" className="text-sm text-gray-700 dark:text-gray-300">
              I understand that this appointment is for emergencies only and agree to the fee.
            </label>
          </div>
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-redButton)] rounded-md text-sm font-medium text-[var(--color-redButton)] hover:bg-[var(--color-redButton)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-redButton)] transition-colors duration-150 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] transition-colors duration-150 shadow-md cursor-pointer"
              disabled={!checked || isSubmitting || !selectedPetId}
            >
              {isSubmitting ? "Sending..." : "Confirm Emergency"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyAppointmentModal;
