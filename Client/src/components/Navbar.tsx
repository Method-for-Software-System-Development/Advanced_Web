import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LogoutButton from "./auth/LogoutButton";

interface NavbarProps {
  onLoginClick?: () => void;
  onBackToDashboard?: () => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onBackToDashboard, onLogout}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // Dummy state to force a re-render when localStorage changes
  const [refresh, setRefresh] = useState(0);

  /**
   * Listen for 'storage' events (localStorage changes in any tab)
   * This ensures that the Navbar always reflects the latest login/logout status,
   * even if authentication status changes in another tab or after login/logout in this tab.
   */
  useEffect(() => {
    const onStorage = () => setRefresh(r => r + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);  // Track whether the user is logged in by checking for a JWT token in sessionStorage
  const isLoggedIn = !!sessionStorage.getItem("token");

  // Get the user's role from sessionStorage
  const role = sessionStorage.getItem("role");
  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();
  /**
   * Handle navigation to the user's dashboard based on role.
   * If the user is a secretary, navigate to /secretary.
   * Otherwise, navigate to /client.
   */
  const handleDashboardClick = () => {
    // If we have a back to dashboard callback (for secretary subviews), use it
    if (onBackToDashboard) {
      onBackToDashboard();
      return;
    }

    // Otherwise, navigate normally based on role
    if (role === "secretary") {
      navigate("/secretary");
    } else {
      navigate("/client");
    }
  }; return (
    <nav className="bg-gradient-to-r from-pink to-pinkDark dark:from-wine dark:to-wineDark shadow-md fixed top-0 w-full z-50">
      <div className="px-6 md:px-20 py-4 flex justify-between items-center">

        {/* Logo and Clinic Name */}
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Pet Clinic Logo" className="h-16 md:h-18 2xl:h-24 w-auto" />
          <div className="leading-snug">
            <h1 className="font-[Nunito] text-lg md:text-2xl 2xl:text-4xl font-bold text-[#664147] dark:text-white">FurEver Friends - Pet Clinic</h1>
            <p className="text-sm md:text-md 2xl:text-lg italic text-wine dark:text-white">Your pet's health. Our FurEver mission.</p>
          </div>
        </div>
        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-6 font-[Nunito] text-md 2xl:text-lg text-wine dark:text-white font-bold">
          <a href="/#about" className="inline-block transition duration-200 transform hover:scale-110 hover:text-wineDark dark:hover:text-whiteDark">About Us</a>
          <a href="/#team" className="inline-block transition duration-200 transform hover:scale-110 hover:text-wineDark dark:hover:text-whiteDark">Our Team</a>
          <a href="/#contact" className="inline-block transition duration-200 transform hover:scale-110 hover:text-wineDark dark:hover:text-whiteDark">Contact Us</a>
          {/* Dashboard button: appears only if user is logged in */}
          {isLoggedIn && (
            <button
              onClick={handleDashboardClick}
              className="inline-block bg-wine dark:bg-white text-white dark:text-wine w-40 h-11 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110 cursor-pointer"
            >
              Dashboard
            </button>
          )}
         {isLoggedIn ? (
  <LogoutButton onLogout={() => {
    setRefresh(r => r + 1);  // Force a re-render of navbar state
    if (onLogout) onLogout(); // Call parent onLogout to close chat
  }} />) : (
            onLoginClick && (
              <button
                onClick={onLoginClick}
                className="inline-block bg-wine dark:bg-white text-white dark:text-wine w-40 h-11 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110 cursor-pointer"
              >
                Login
              </button>
            )
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />

        </div>

        {/* Hamburger Icon - Mobile only */}
        <button
          className="lg:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-wine dark:focus:ring-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={32} color="#664147" className="dark:stroke-white" /> : <Menu size={32} color="#664147" className="dark:stroke-white" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-pink dark:bg-wine shadow-md border-t border-pinkDark dark:border-wineDark">
          <div className="flex flex-col items-center space-y-4 py-6 font-[Nunito] text-lg text-wine dark:text-white font-bold">
            <a href="/#about" className="w-full text-center transition hover:text-wineDark dark:hover:text-whiteDark" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/#team" className="w-full text-center transition hover:text-wineDark dark:hover:text-whiteDark" onClick={() => setMenuOpen(false)}>Our Team</a>
            <a href="/#contact" className="w-full text-center transition hover:text-wineDark dark:hover:text-whiteDark" onClick={() => setMenuOpen(false)}>Contact Us</a>

            {/* Dashboard button: appears only if user is logged in */}
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