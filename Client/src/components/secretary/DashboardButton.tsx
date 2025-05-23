import React from 'react';

interface DashboardButtonProps {
  onClick: () => void;
  label: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ onClick, label, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 bg-[#664147] text-white font-semibold rounded-lg shadow-md hover:bg-[#58383E] transition-colors duration-200 ${className}`}
    >
      {label}
    </button>
  );
};

export default DashboardButton;
