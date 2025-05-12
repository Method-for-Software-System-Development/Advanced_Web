import React from 'react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <>
      <Navbar />
      <section id="about" className="pt-24 h-screen bg-[#FDF6F0]">
        <h2 className="text-center text-3xl text-[#3B3B3B] font-semibold">About Us</h2>
      </section>
      <section id="team" className="h-screen bg-[#F7C9D3]">
        <h2 className="text-center text-3xl text-[#3B3B3B] font-semibold">Our Team</h2>
      </section>
      <section id="reviews" className="h-screen bg-[#664147]">
        <h2 className="text-center text-3xl text-white font-semibold">Reviews</h2>
      </section>
      <section id="login" className="h-screen bg-[#3B3B3B]">
        <h2 className="text-center text-3xl text-white font-semibold">Login</h2>
      </section>
    </>
  );
};

export default Home;