import React, { useState } from 'react';

/**
 * CancelReasonModal - Modal component for selecting a cancellation reason for an appointment
 * @param isOpen Whether the modal is open
 * @param onClose Function to close the modal
 * @param onSubmit Function that receives the selected cancellation reason
 */

export interface CancelReasonModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Closes the modal */
  onClose: () => void;
  /** Receives the selected cancellation reason */
  onSubmit: (reason: string) => void;
}

// List of cancellation reasons for the dropdown
const REASONS = [
  'Scheduling conflict',
  'No longer needed',
  'Found another provider',
  'Personal reasons',
  'Other',
];

export const CancelReasonModal: React.FC<CancelReasonModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // State for the selected reason from the dropdown
  const [selectedReason, setSelectedReason] = useState('');
  // State for a custom reason if 'Other' is selected
  const [customReason, setCustomReason] = useState('');

  /**
   * Handles change in the reason dropdown
   * If 'Other' is selected, clears the custom reason field
   */
  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReason(e.target.value);
    if (e.target.value !== 'Other') setCustomReason('');
  };

  /**
   * Handles form submission - calls onSubmit with the selected or custom reason
   * Resets the fields after submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If 'Other' is selected but no custom reason entered, do not submit
    if (selectedReason === 'Other' && !customReason.trim()) return;
    onSubmit(selectedReason === 'Other' ? customReason : selectedReason);
    setSelectedReason('');
    setCustomReason('');
  };

  // If the modal is not open, render nothing
  if (!isOpen) return null;

  return (
    // Modal overlay and dialog
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8d7da]/80 backdrop-blur-sm">      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#FDF6F0] dark:bg-darkMode p-4 sm:p-8 rounded-xl shadow-xl border border-[#EF92A6] dark:border-[#D17C8F] animate-fadeIn mx-3">
        {/* Close (X) button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-[#EF92A6] dark:hover:text-[#D17C8F] text-xl sm:text-2xl font-bold focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="mb-4 sm:mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-1 sm:mb-2">Cancel Appointment</h2>
          <div className="h-1 w-12 sm:w-16 bg-[#EF92A6] rounded-full mx-auto mb-1 sm:mb-2"></div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Please let us know why you are cancelling your appointment.</p>
        </div>
        {/* Cancellation reason form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Reason for Cancellation *</label>
            {/* Dropdown for selecting a reason */}
            <select
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={selectedReason}
              onChange={handleReasonChange}
              required
            >
              <option value="" disabled>Select a reason...</option>
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>
          {/* If 'Other' is selected, show custom reason input */}
          {selectedReason === 'Other' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Please specify *</label>
              <input
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                type="text"
                placeholder="Enter your reason..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                required
              />
            </div>
          )}
          {/* Action buttons */}
          <div className="flex justify-between pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--color-redButton)] rounded-md text-xs sm:text-sm font-medium text-[var(--color-redButton)] hover:bg-[var(--color-redButton)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-redButton)] transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#EF92A6] text-white rounded-md text-xs sm:text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] transition-colors duration-150 shadow-md"
              disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
            >
              <span className="hidden sm:inline">Confirm Cancellation</span>
              <span className="sm:hidden">Confirm Cancellation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
