import React from 'react';

export interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8d7da]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FDF6F0] dark:bg-[#4A3F35] p-4 sm:p-8 rounded-xl shadow-xl border border-[#EF92A6] dark:border-[#D17C8F] animate-fadeIn mx-3">
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
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Are you sure you want to cancel this appointment?</p>
        </div>
        <div className="flex justify-between pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--color-redButton)] rounded-md text-xs sm:text-sm font-medium text-[var(--color-redButton)] hover:bg-[var(--color-redButton)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-redButton)] transition-colors duration-150"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#EF92A6] text-white rounded-md text-xs sm:text-sm font-medium hover:bg-[#E57D98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D17C8F] dark:bg-[#D17C8F] dark:hover:bg-[#C66B8C] transition-colors duration-150 shadow-md"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelModal;
