import React from "react";

interface UserNavButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const UserNavButton: React.FC<UserNavButtonProps> = ({ label, onClick, className }) => {  return (
    <button
      onClick={onClick}
      className={`bg-[#664147] dark:bg-[#58383E] text-white px-4 py-2 rounded shadow hover:bg-[#4d3034] dark:hover:bg-[#4A2F33] font-semibold transition text-base sm:text-sm ${className || ''}`}
      style={{ width: undefined }}
    >
      {label}
    </button>
  );
};

export default UserNavButton;