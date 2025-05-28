import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-[#F7C9D3] to-[#EF92A6] shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo and Clinic Name */}
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Pet Clinic Logo" className="h-24 w-auto" />
          <div className="leading-snug">
            <h1 className="font-[Nunito] text-2xl sm:text-3xl md:text-4xl font-bold text-[#664147]">FurEver Friends - Pet Clinic</h1>
            <p className="text-sm sm:text-base md:text-lg italic text-[#664147]">Your pet's health. Our FurEver mission.</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-6 font-[Nunito] text-lg text-[#664147] font-bold">
          <a href="/#about" className="inline-block transition duration-200 transform hover:scale-110 hover:text-[#58383E]">About Us</a>
          <a href="/#team" className="inline-block transition duration-200 transform hover:scale-110 hover:text-[#58383E]">Our Team</a>
          <a href="/#contact" className="inline-block transition duration-200 transform hover:scale-110 hover:text-[#58383E]">Contact Us</a>
          <Link to="/secretary" className="inline-block transition duration-200 transform hover:scale-110 hover:text-[#58383E]">Secretary</Link>
          {onLoginClick && (
            <button
              onClick={onLoginClick}
              className="inline-block bg-[#664147] text-white px-10 py-2 rounded-full hover:bg-[#58383E] transform transition duration-200 hover:scale-110 cursor-pointer"
            >
              Login
            </button>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />
          
        </div>

        {/* Hamburger Icon - Mobile only */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#664147]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={32} color="#664147" /> : <Menu size={32} color="#664147" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#F7C9D3] shadow-md border-t border-[#EF92A6]">
          <div className="flex flex-col items-center space-y-4 py-6 font-[Nunito] text-lg text-[#664147] font-bold">
            <a href="/#about" className="w-full text-center transition hover:text-[#58383E]" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/#team" className="w-full text-center transition hover:text-[#58383E]" onClick={() => setMenuOpen(false)}>Our Team</a>
            <a href="/#contact" className="w-full text-center transition hover:text-[#58383E]" onClick={() => setMenuOpen(false)}>Contact Us</a>
            <Link to="/secretary" className="w-full text-center transition hover:text-[#58383E]" onClick={() => setMenuOpen(false)}>Secretary</Link>
            {onLoginClick && (
              <button
                onClick={() => { setMenuOpen(false); onLoginClick(); }}
                className="w-[90%] bg-[#664147] text-white px-10 py-2 rounded-full hover:bg-[#58383E] transition cursor-pointer"
              >
                Login
              </button>
            )}
            <ThemeToggle variant="button" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;