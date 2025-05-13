import React from 'react';
import logo from '../assets/logo.png';

interface NavbarProps {
  onLoginClick: () => void; // Prop for triggering Login modal
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  return (
    <nav className="bg-gradient-to-r from-[#F7C9D3] to-[#F3AEBD] shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo and Clinic Name */}
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Pet Clinic Logo" className="h-24 w-auto" />
          <div className="leading-snug">
            <h1 className="font-[Nunito] text-4xl font-bold text-[#664147]">FurEver Friends - Pet Clinic</h1>
            <p className="text-lg italic text-[#664147]">Your pet's health. Our FurEver mission.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-x-6 font-[Nunito] text-lg text-[#664147] font-bold">
          <a href="#about" className="hover:text-[#3B3B3B] transition-colors duration-200">About Us</a>
          <a href="#team" className="hover:text-[#3B3B3B] transition-colors duration-200">Our Team</a>
          <a href="#reviews" className="hover:text-[#3B3B3B] transition-colors duration-200">Testimonials</a>
          {/* Button to open Login modal */}
          <button
            onClick={onLoginClick}
            className="bg-[#664147] text-white px-10 py-2 rounded-full hover:bg-[#3B3B3B] transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
