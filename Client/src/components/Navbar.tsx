import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LogoutButton from "./auth/LogoutButton";


interface NavbarProps {
  onLoginClick?: () => void;
}


const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
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
  }, []);
  // Track whether the user is logged in by checking for a JWT token in localStorage
  const isLoggedIn = !!localStorage.getItem("token");

  // Get the user's role from localStorage
  const role = localStorage.getItem("role");
  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  /**
   * Handle navigation to the user's dashboard based on role.
   * If the user is a secretary, navigate to /secretary.
   * Otherwise, navigate to /client.
   */
  const handleDashboardClick = () => {
    if (role === "secretary") {
      navigate("/secretary");
    } else {
      navigate("/client");
    }
  };
  return (
    <nav className="bg-gradient-to-r from-[#F7C9D3] to-[#EF92A6] shadow-md fixed top-0 w-full z-50">
      <div className="px-6 md:px-20 py-4 flex justify-between items-center">

        {/* Logo and Clinic Name */}
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Pet Clinic Logo" className="h-16 md:h-18 2xl:h-24 w-auto" />
          <div className="leading-snug">
            <h1 className="font-[Nunito] text-lg md:text-2xl 2xl:text-4xl font-bold text-[#664147]">FurEver Friends - Pet Clinic</h1>
            <p className="text-sm md:text-md 2xl:text-lg italic text-[#664147]">Your pet's health. Our FurEver mission.</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-6 font-[Nunito] text-md 2xl:text-lg text-[#664147] font-bold">
          <a href="/#about" className="inline-block transition duration-200 transform hover:scale-110 hover:text-[#58383E]">About Us</a>
          <a href="/#team" className="inline-block transition duration-200 transform hover:scale-110 hover:text-[#58383E]">Our Team</a>
          <a href="/#contact" className="inline-block transition duration-200 transform hover:scale-110 hover:text-[#58383E]">Contact Us</a>
          {/* Dashboard button: appears only if user is logged in */}
          {isLoggedIn && (
            <button
              onClick={handleDashboardClick}
              className="inline-block bg-[#664147] text-white w-40 h-11 rounded-full hover:bg-[#58383E] transform transition duration-200 hover:scale-110 cursor-pointer"
            >
              Dashboard
            </button>
          )}
          {isLoggedIn ? (<LogoutButton onLogout={() => setRefresh(r => r + 1)} />) : (
            onLoginClick && (
              <button
                onClick={onLoginClick}
                className="inline-block bg-[#664147] text-white w-40 h-11 rounded-full hover:bg-[#58383E] transform transition duration-200 hover:scale-110 cursor-pointer"
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
          className="lg:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#664147]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={32} color="#664147" /> : <Menu size={32} color="#664147" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-[#F7C9D3] shadow-md border-t border-[#EF92A6]">
          <div className="flex flex-col items-center space-y-4 py-6 font-[Nunito] text-lg text-[#664147] font-bold">
            <a href="/#about" className="w-full text-center transition hover:text-[#58383E]" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/#team" className="w-full text-center transition hover:text-[#58383E]" onClick={() => setMenuOpen(false)}>Our Team</a>
            <a href="/#contact" className="w-full text-center transition hover:text-[#58383E]" onClick={() => setMenuOpen(false)}>Contact Us</a>
            {/* Dashboard button: appears only if user is logged in */}
            {isLoggedIn && (
              <button
                onClick={handleDashboardClick}
                className="inline-block bg-[#664147] text-white px-10 py-2 rounded-full hover:bg-[#58383E] transition duration-200 hover:scale-110 cursor-pointer"
              >
                Dashboard
              </button>
            )}
            {isLoggedIn ? (
              <LogoutButton onLogout={() => setRefresh(r => r + 1)} />) : (
              onLoginClick && (
                <button
                  onClick={() => { setMenuOpen(false); onLoginClick(); }}
                  className="w-[90%] bg-[#664147] text-white px-10 py-2 rounded-full hover:bg-[#58383E] transition cursor-pointer"
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