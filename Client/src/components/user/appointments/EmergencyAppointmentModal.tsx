import React, { useState } from "react";

interface EmergencyAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (emergencyReason: string) => void;
  isSubmitting: boolean;
}

const EmergencyAppointmentModal: React.FC<EmergencyAppointmentModalProps> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8d7da]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FDF6F0] dark:bg-[#4A3F35] p-8 rounded-xl shadow-xl border border-[#EF92A6] dark:border-[#D17C8F] animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-[#EF92A6] dark:hover:text-[#D17C8F] text-2xl font-bold focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="mb-6 text-center">
          <span className="text-4xl block mb-2">🚨</span>
          <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-2">Emergency Appointment Confirmation</h2>
          <div className="h-1 w-16 bg-[#EF92A6] rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <b className="text-red-700 dark:text-red-400">This is an emergency request ($1000 charge)</b><br />
            Please arrive at the clinic immediately. Our staff will contact you right away.
          </p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onConfirm(reason); }} className="space-y-6">
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
              onChange={e => setChecked(e.target.checked)}
              className="mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="emergency-confirm" className="text-sm text-gray-700 dark:text-gray-300">
              I understand that this appointment is for emergencies only and agree to the fee.
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--color-redButton)] rounded-md text-sm font-medium text-[var(--color-redButton)] hover:bg-[var(--color-redButton)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-redButton)] transition-colors duration-150"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#EF92A6] text-white rounded-md text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] disabled:opacity-50 dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] transition-colors duration-150 shadow-md"
              disabled={!checked || isSubmitting}
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
