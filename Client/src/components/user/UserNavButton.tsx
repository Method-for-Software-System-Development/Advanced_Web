import React from "react";

interface UserNavButtonProps {
  label: string;
  onClick: () => void;
}

const UserNavButton: React.FC<UserNavButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
    >
      {label}
    </button>
  );
};

export default UserNavButton;