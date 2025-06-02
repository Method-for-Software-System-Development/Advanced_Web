/**
 * LogoutButton component
 * Renders a Logout button and handles clearing the user's token and client info from localStorage.
 * After logout, reloads the page to reset the app state.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
interface LogoutButtonProps {
  onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Remove token and client info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("client");
    
    if (onLogout) onLogout();
       // Navigate to the homepage ("/")
      navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-block bg-[#664147] text-white w-40 h-11 rounded-full hover:bg-[#58383E] transform transition duration-200 hover:scale-110 cursor-pointer"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
