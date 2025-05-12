import React from 'react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-[#F7C9D3] shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo and Clinic Name */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Pet Clinic Logo" className="h-10 w-auto" />
          <span className="text-[#664147] font-bold text-xl">Pet Clinic</span>
        </div>

        {/* Navigation Links */}
        <div className="space-x-6 text-sm text-[#664147] font-medium">
          <a href="#about" className="hover:text-[#664147]">About Us</a>
          <a href="#team" className="hover:text-[#664147]">Our Team</a>
          <a href="#reviews" className="hover:text-[#664147]">Reviews</a>
          <a href="#login" className="hover:text-[#664147]">Login</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;