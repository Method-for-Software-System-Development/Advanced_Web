import React from 'react';
import Navbar from '../components/Navbar';
import AboutSection from '../components/homePage/AboutSection';
import TeamSection from '../components/homePage/TeamSection';
import ContactSection from '../components/homePage/ContactSection';
import FooterSection from '../components/FooterSection';

interface HomeProps {
  onLoginClick: () => void; // Pass login modal trigger function to Navbar
}

const Home: React.FC<HomeProps> = ({ onLoginClick }) => {
  return (
    <>
      <Navbar onLoginClick={onLoginClick} />
      <main className="pt-40 bg-[#F5D2B3]">
        <AboutSection onLoginClick={onLoginClick} />
        <TeamSection />
        <ContactSection />
        <FooterSection />
      </main>
    </>
  );
};

export default Home;
