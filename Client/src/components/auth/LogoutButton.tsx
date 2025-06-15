/**
 * LogoutButton component
 * Renders a Logout button and handles clearing the user's token and client info from localStorage.
 * After logout, reloads the page to reset the app state.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';


interface LogoutButtonProps {
  /** “desktop” (navbar) or full-width “mobile” (mobile drawer) */
  variant?: "desktop" | "mobile";
  /** Tailwind utility overrides */
  className?: string;
  /** Callback after logout */
  onLogout?: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "desktop",
  className = "",
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("client");
    if (onLogout) onLogout();
    navigate("/");
  };

  // Full-width button (mobile)
  if (variant === "mobile")
    return (
      <button
        onClick={handleLogout}
        className="w-[90%] bg-wine dark:bg-white text-white dark:text-wine px-10 py-2 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 cursor-pointer"
      >
        Logout
      </button>
    );

  return (
    <button
      onClick={handleLogout}
      className="inline-block bg-wine dark:bg-white text-white dark:text-wine w-40 h-11 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110 cursor-pointer"
    >
      Logout
    </button>
  );
};

export default LogoutButton;