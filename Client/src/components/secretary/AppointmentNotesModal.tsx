import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types';

interface AppointmentNotesModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentId: string, notes: string) => Promise<void>;
  isEditMode?: boolean;
}

const AppointmentNotesModal: React.FC<AppointmentNotesModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSave,
  isEditMode = false
}) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize notes when modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes(appointment.notes || '');
      setError('');
    }
  }, [isOpen, appointment.notes]);

  const handleSave = async () => {
    if (!notes.trim()) {
      setError('Please enter notes before saving.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(appointment._id, notes.trim());
      onClose();
    } catch (err) {
      console.error('Error saving notes:', err);
      setError('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get appointment display information
  const getAppointmentDisplayInfo = () => {
    const user = typeof appointment.userId === 'object' ? appointment.userId : null;
    const pet = typeof appointment.petId === 'object' ? appointment.petId : null;
    
    return {
      clientName: user ? `${user.firstName} ${user.lastName}` : 'Unknown Client',
      petName: pet ? pet.name : 'Unknown Pet',
      service: appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1).replace('_', ' '),
      date: new Date(appointment.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: appointment.time
    };
  };

  const appointmentInfo = getAppointmentDisplayInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#664147] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-600 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-2">
                {isEditMode ? 'Edit Appointment Notes' : 'Add Appointment Notes'}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p><strong>Client:</strong> {appointmentInfo.clientName}</p>
                <p><strong>Pet:</strong> {appointmentInfo.petName}</p>
                <p><strong>Service:</strong> {appointmentInfo.service}</p>
                <p><strong>Date & Time:</strong> {appointmentInfo.date} at {appointmentInfo.time}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="appointment-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Appointment Notes *
            </label>
            <textarea
              id="appointment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter detailed notes about the appointment, treatment provided, observations, recommendations, etc."
              rows={8}
              maxLength={1000}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EF92A6] focus:border-[#EF92A6] dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {notes.length}/1000 characters
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <p className="mb-2"><strong>Guidelines for appointment notes:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Document the main findings and treatments provided</li>
              <li>Include any medications prescribed or administered</li>
              <li>Note the pet's behavior and condition during the visit</li>
              <li>Record any follow-up recommendations or next steps</li>
              <li>Mention any concerns or issues that arose during the appointment</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-600 p-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF92A6] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !notes.trim()}
            className="px-4 py-2 bg-[#EF92A6] text-white rounded-md hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Notes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentNotesModal;
