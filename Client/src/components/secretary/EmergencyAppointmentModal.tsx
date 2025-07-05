import React, { useState, useEffect } from "react";
import { Pet, Patient } from '../../types';
import { patientService } from '../../services/patientService';

interface EmergencyAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (emergencyReason: string, petId: string, patientId: string) => void;
  isSubmitting: boolean;
}

const EmergencyAppointmentModal: React.FC<EmergencyAppointmentModalProps & { error?: string }> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  error = "",
}) => {
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    patientService.getAllPatients().then((data) => {
      setPatients(data);
      // If a patient was previously selected, keep it if still in the list
      if (selectedPatientId && data.some(p => p._id === selectedPatientId)) {
        setSelectedPatientId(selectedPatientId);
      } else if (data.length > 0) {
        setSelectedPatientId(data[0]._id);
      } else {
        setSelectedPatientId(null);
      }
    });
  }, [open]);

  useEffect(() => {
    if (!selectedPatientId) {
      setPets([]);
      setSelectedPetId(null);
      return;
    }
    const patient = patients.find((p) => p._id === selectedPatientId);
    if (patient && Array.isArray(patient.pets) && patient.pets.length > 0) {
      setPets([...patient.pets]);
      setSelectedPetId(patient.pets[0]?._id || null);
    } else {
      setPets([]);
      setSelectedPetId(null);
    }
  }, [selectedPatientId, patients]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8d7da]/80 backdrop-blur-sm">
      <div className="relative w-[95vw] max-w-xs sm:w-full sm:max-w-md bg-[#FDF6F0] dark:bg-[#4A3F35] p-3 sm:p-8 rounded-xl shadow-xl border border-[#EF92A6] dark:border-[#D17C8F] animate-fadeIn max-h-[70vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-[#EF92A6] dark:hover:text-[#D17C8F] text-xl sm:text-2xl font-bold focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          &times;
        </button>
        {/* Error message box for emergency errors */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded text-center">
            {error}
          </div>
        )}
        <div className="mb-4 sm:mb-6 text-center">
          <span className="text-2xl sm:text-4xl block mb-2">🚨</span>
          <h2 className="text-lg sm:text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-2">Emergency Appointment</h2>
          <div className="h-1 w-8 sm:w-16 bg-[#EF92A6] rounded-full mx-auto mb-2"></div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
            <b className="text-red-700 dark:text-red-400">This is an emergency request</b><br />
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Patient:</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={selectedPatientId || ''}
            onChange={e => setSelectedPatientId(e.target.value)}
            disabled={isSubmitting || patients.length === 0}
          >
            <option value="" disabled>Select a patient...</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>{patient.firstName} {patient.lastName}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Pet:</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            value={selectedPetId || ''}
            onChange={e => setSelectedPetId(e.target.value)}
            disabled={isSubmitting || pets.length === 0}
          >
            <option value="" disabled>Select a pet...</option>
            {pets.map(pet => (
              <option key={pet._id} value={pet._id}>{pet.name}</option>
            ))}
          </select>
        </div>
        <form onSubmit={e => { e.preventDefault(); if(selectedPetId && selectedPatientId) onConfirm(reason, selectedPetId, selectedPatientId); }} className="space-y-6">
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
              I understand that this appointment is for emergencies only.
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-redButton)] rounded-md text-sm font-medium text-[var(--color-redButton)] hover:bg-[var(--color-redButton)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-redButton)] transition-colors duration-150 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>            <button
              type="submit"
              className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] transition-colors duration-150 shadow-md cursor-pointer"
              disabled={!checked || isSubmitting || !selectedPetId || !selectedPatientId}
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
