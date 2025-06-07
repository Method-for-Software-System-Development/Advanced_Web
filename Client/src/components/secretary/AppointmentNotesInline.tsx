import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types';

interface AppointmentNotesInlineProps {
  appointment: Appointment;
  onSave: (appointmentId: string, notes: string) => Promise<void>;
  onCancel: () => void;
  isEditMode?: boolean;
}

const AppointmentNotesInline: React.FC<AppointmentNotesInlineProps> = ({
  appointment,
  onSave,
  onCancel,
  isEditMode = false
}) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize notes
  useEffect(() => {
    setNotes(appointment.notes || '');
    setError('');
  }, [appointment.notes]);

  const handleSave = async () => {
    if (!notes.trim()) {
      setError('Please enter notes before saving.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(appointment._id, notes.trim());
      onCancel(); // Close the inline editor after successful save
    } catch (err) {
      console.error('Error saving notes:', err);
      setError('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!isSaving) {
      onCancel();
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {isEditMode ? 'Edit Appointment Notes' : 'Add Appointment Notes'}
        </h4>
        
        {error && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter detailed notes about the appointment, treatment provided, observations, recommendations, etc."
          rows={6}
          maxLength={1000}
          disabled={isSaving}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EF92A6] focus:border-[#EF92A6] dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
        />
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {notes.length}/1000 characters
        </div>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        <p className="mb-1"><strong>Guidelines:</strong></p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Document main findings and treatments provided</li>
          <li>Include any medications prescribed or administered</li>
          <li>Note the pet's behavior and condition during the visit</li>
          <li>Record any follow-up recommendations or next steps</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF92A6] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !notes.trim()}
          className="px-3 py-1.5 bg-[#EF92A6] text-white rounded text-sm hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  );
};

export default AppointmentNotesInline;
