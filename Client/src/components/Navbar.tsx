import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LogoutButton from "./auth/LogoutButton";

/**
 * Props for the Navbar component
 */
interface NavbarProps {
  /** Callback function triggered when login button is clicked */
  onLoginClick?: () => void;
  /** Callback function for returning to dashboard (used in secretary subviews) */
  onBackToDashboard?: () => void;
  /** Callback function triggered when user logs out */
  onLogout?: () => void;
}

/**
 * Navigation bar component for the FurEver Friends Pet Clinic application.
 * Provides responsive navigation with different views for desktop and mobile.
 * Handles user authentication state and role-based navigation.
 */

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onBackToDashboard, onLogout }) => {
  // State for controlling mobile menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  // Force re-render when authentication state changes
  const [refresh, setRefresh] = useState(0);

  /**
   * Listen for storage events to sync authentication state across tabs
   */
  useEffect(() => {
    const onStorage = () => setRefresh(r => r + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Check if user is logged in by looking for JWT token
  const isLoggedIn = !!sessionStorage.getItem("token");
  // Get user role for role-based navigation
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();

  /**
   * Navigate to appropriate dashboard based on user role
   */
  const handleDashboardClick = () => {
    // Use callback for secretary subviews if provided
    if (onBackToDashboard) {
      onBackToDashboard();
      return;
    }

    // Navigate based on user role
    if (role === "secretary") {
      navigate("/secretary");
    } else {
      navigate("/client");
    }
  }; return (
    <nav className="bg-gradient-to-r from-pink to-pinkDark dark:from-wine dark:to-wineDark shadow-md fixed top-0 w-full z-50">
      <div className="px-6 md:px-20 py-4 flex justify-between items-center">
        
        {/* Logo and clinic branding */}
        <div className="flex items-center space-x-4">
          <a href="/#">
            <img
              src={logo}
              alt="Pet Clinic Logo"
              className="h-16 md:h-18 2xl:h-24 w-auto cursor-pointer"
            />
          </a>
          <div className="leading-snug">
            <h1 className="font-[Nunito] text-lg md:text-2xl 2xl:text-4xl font-bold text-[#664147] dark:text-white">FurEver Friends - Pet Clinic</h1>
            <p className="text-sm md:text-md 2xl:text-lg italic text-wine dark:text-white">Your pet's health. Our FurEver mission.</p>
          </div>
        </div>

        {/* Desktop navigation menu */}
        <div className="hidden lg:flex items-center space-x-6 font-[Nunito] text-md 2xl:text-lg text-wine dark:text-white font-bold">
          <a href="/#about" className="inline-block transition duration-200 transform hover:scale-110 hover:text-wineDark dark:hover:text-whiteDark">About Us</a>
          <a href="/#team" className="inline-block transition duration-200 transform hover:scale-110 hover:text-wineDark dark:hover:text-whiteDark">Our Team</a>
          <a href="/#contact" className="inline-block transition duration-200 transform hover:scale-110 hover:text-wineDark dark:hover:text-whiteDark">Contact Us</a>

          {/* Dashboard button - only visible when logged in */}
          {isLoggedIn && (
            <button
              onClick={handleDashboardClick}
              className="inline-block bg-wine dark:bg-white text-white dark:text-wine w-40 h-11 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110 cursor-pointer"
            >
              Dashboard
            </button>
          )}

          {/* Authentication controls */}
          {isLoggedIn ? (
            <LogoutButton onLogout={() => {
              setRefresh(r => r + 1);  // Update navbar state
              if (onLogout) onLogout(); // Notify parent component
            }} />
          ) : (
            onLoginClick && (
              <button
                onClick={onLoginClick}
                className="inline-block bg-wine dark:bg-white text-white dark:text-wine w-40 h-11 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110 cursor-pointer"
              >
                Login
              </button>
            )
          )}

          <ThemeToggle />
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-wine dark:focus:ring-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={32} color="#664147" className="dark:stroke-white" /> : <Menu size={32} color="#664147" className="dark:stroke-white" />}
        </button>
      </div>
      
      {/* Mobile navigation menu */}
      {menuOpen && (
        <div className="lg:hidden bg-pink dark:bg-wine shadow-md border-t border-pinkDark dark:border-wineDark">
          <div className="flex flex-col items-center space-y-4 py-6 font-[Nunito] text-lg text-wine dark:text-white font-bold">
            <a href="/#about" className="w-full text-center transition hover:text-wineDark dark:hover:text-whiteDark" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/#team" className="w-full text-center transition hover:text-wineDark dark:hover:text-whiteDark" onClick={() => setMenuOpen(false)}>Our Team</a>
            <a href="/#contact" className="w-full text-center transition hover:text-wineDark dark:hover:text-whiteDark" onClick={() => setMenuOpen(false)}>Contact Us</a>

            {/* Dashboard button for mobile - only visible when logged in */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleDashboardClick();
                }}
                className="w-[90%] bg-wine dark:bg-white text-white dark:text-wine px-10 py-2 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 cursor-pointer"
              >
                Dashboard
              </button>
            )}

            {/* Mobile authentication controls */}
            {isLoggedIn ? (
              <LogoutButton
                variant="mobile"
                onLogout={() => {
                  setRefresh(r => r + 1);
                  if (onLogout) onLogout();
                }}
              />
            ) : (
              onLoginClick && (
                <button
                  onClick={() => { setMenuOpen(false); onLoginClick(); }}
                  className="w-[90%] bg-wine dark:bg-white text-white dark:text-wine px-10 py-2 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 cursor-pointer"
                >
                  Login
                </button>
              )
            )}

            <ThemeToggle variant="button" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;