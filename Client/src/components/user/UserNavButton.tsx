import React from "react";

interface UserNavButtonProps {
  label: string;
  onClick: () => void;
}

const UserNavButton: React.FC<UserNavButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#664147] text-white px-4 py-2 rounded shadow hover:bg-[#4d3034] font-semibold transition w-full sm:w-auto text-base sm:text-sm"
    >
      {label}
    </button>
  );
};

export default UserNavButton;