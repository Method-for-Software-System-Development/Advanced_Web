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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
      <div className="bg-white dark:bg-[#312524] p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <div className="mb-2">
            <span className="text-4xl">🚨</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Emergency Appointment Confirmation</h2>
          <div className="mb-4 text-gray-700 dark:text-gray-200 text-center">
            <p>
              <b>This is an emergency request ($1000 charge)</b><br />
              Please arrive at the clinic immediately. Our staff will contact you right away.
            </p>
          </div>
          <textarea
            placeholder="Briefly describe what happened (optional)"
            className="w-full border rounded-lg p-2 mb-3 dark:bg-[#41312a] dark:text-white"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={100}
            disabled={isSubmitting}
          />
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="emergency-confirm"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="emergency-confirm" className="text-sm">
              I understand that this appointment is for emergencies only and agree to the fee.
            </label>
          </div>
          <button
            onClick={() => onConfirm(reason)}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg disabled:opacity-50"
            disabled={!checked || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Confirm Emergency"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAppointmentModal;
