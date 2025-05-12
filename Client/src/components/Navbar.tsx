import React from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
const Navbar = () => {
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
        <div className="space-x-6 text-sm text-[#664147] font-medium">
          <a href="#about" className="hover:text-[#664147]">About Us</a>
          <a href="#team" className="hover:text-[#664147]">Our Team</a>
          <a href="#reviews" className="hover:text-[#664147]">Reviews</a>
          <Link to="/login" className="hover:text-[#664147]">Login</Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;