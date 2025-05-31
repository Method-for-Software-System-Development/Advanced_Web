/**
 * LogoutButton component
 * Renders a Logout button and handles clearing the user's token and client info from localStorage.
 * After logout, reloads the page to reset the app state.
 */

import React from 'react';

interface LogoutButtonProps {
  onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const handleLogout = () => {
    // Remove token and client info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("client");
    // Optional callback to parent (e.g., to update state in NavBar)
    if (onLogout) onLogout();
    // Reload the page (optional, but resets all states and redirects user)
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-block bg-[#664147] text-white px-10 py-2 rounded-full hover:bg-[#58383E] transition duration-200"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
