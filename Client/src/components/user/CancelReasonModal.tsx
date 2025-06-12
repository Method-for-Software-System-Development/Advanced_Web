import React, { useState } from 'react';

export interface CancelReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const REASONS = [
  'Scheduling conflict',
  'No longer needed',
  'Found another provider',
  'Personal reasons',
  'Other',
];

export const CancelReasonModal: React.FC<CancelReasonModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReason(e.target.value);
    if (e.target.value !== 'Other') setCustomReason('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReason === 'Other' && !customReason.trim()) return;
    onSubmit(selectedReason === 'Other' ? customReason : selectedReason);
    setSelectedReason('');
    setCustomReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8d7da]/80 backdrop-blur-sm">
      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#FDF6F0] dark:bg-[#4A3F35] p-8 rounded-xl shadow-xl border border-[#EF92A6] dark:border-[#D17C8F] animate-fadeIn">
        {/* Close (X) Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-[#EF92A6] dark:hover:text-[#D17C8F] text-2xl font-bold focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-2">Cancel Appointment</h2>
          <div className="h-1 w-16 bg-[#EF92A6] rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Please let us know why you are cancelling your appointment.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Reason for Cancellation *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
          {selectedReason === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Please specify *</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                type="text"
                placeholder="Enter your reason..."
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                required
              />
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-redButton)] rounded-md text-sm font-medium text-[var(--color-redButton)] hover:bg-[var(--color-redButton)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-redButton)] transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] transition-colors duration-150 shadow-md"
              disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
