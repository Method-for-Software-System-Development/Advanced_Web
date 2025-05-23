import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = '&larr; Back to Dashboard' }) => {
  return (
    <div className="mb-8 text-center">
      <button 
        onClick={onClick} 
        className="px-6 py-3 bg-[#664147] text-white font-semibold rounded-lg shadow-md hover:bg-[#58383E] transition-colors duration-200"
      >
        {label}
      </button>
    </div>
  );
};

export default BackButton;
