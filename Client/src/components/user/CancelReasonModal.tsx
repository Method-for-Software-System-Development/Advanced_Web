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
    <div className="bg-white dark:bg-[#4A3F35] p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-[#4A3F35] dark:text-[#FDF6F0]">Reason for Cancellation</h3>
      <form onSubmit={handleSubmit}>
        <select
          className="w-full p-2 mb-4 border rounded"
          value={selectedReason}
          onChange={handleReasonChange}
          required
        >
          <option value="" disabled>Select a reason...</option>
          {REASONS.map((reason) => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
        {selectedReason === 'Other' && (
          <input
            className="w-full p-2 mb-4 border rounded"
            type="text"
            placeholder="Please specify..."
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
            required
          />
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
          >
            Confirm Cancellation
          </button>
        </div>
      </form>
    </div>
  );
};
