import React from 'react';
import Navbar from '../components/Navbar';
import AboutSection from '../components/AboutSection';
import TeamSection from '../components/TeamSection';

interface HomeProps {
  onLoginClick: () => void; // Pass login modal trigger function to Navbar
}

const Home: React.FC<HomeProps> = ({ onLoginClick }) => {
  return (
    <>
      <Navbar onLoginClick={onLoginClick} />
      <main className="pt-40 bg-gradient-to-b from-[#F5D2B3] to-[#FDF6F0]">
        <AboutSection />
        <TeamSection />
      </main>
    </>
  );
};

export default Home;
