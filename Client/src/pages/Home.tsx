import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AboutSection from '../components/homePage/AboutSection';
import TeamSection from '../components/homePage/TeamSection';
import ContactSection from '../components/homePage/ContactSection';
import FooterSection from '../components/FooterSection';
import ChatButton from "../components/chatbot/ChatButton";
import ChatWindow from "../components/chatbot/ChatWindow";

interface HomeProps {
  onLoginClick: () => void; // Pass login modal trigger function to Navbar
}

const Home: React.FC<HomeProps> = ({ onLoginClick }) => {
  /** Local chat-window state for the Home page */
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <>
      {/* Navbar gets onLogout so Logout closes the chat */}
      <Navbar
        onLoginClick={onLoginClick}
        onLogout={() => setChatOpen(false)}
      />
      <main className="pt-40 bg-[#F5D2B3]">
        <AboutSection onLoginClick={onLoginClick} />
        <TeamSection />
        <ContactSection />
        <FooterSection />
      </main>
      {/* Floating chat button + chat window */}
      <ChatButton onClick={() => setChatOpen(!chatOpen)} />
      <ChatWindow open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default Home;
