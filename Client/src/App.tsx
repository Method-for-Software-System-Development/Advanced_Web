import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/index.css";
import ChatButton from "./components/chatbot/ChatButton";
import ChatWindow from "./components/chatbot/ChatWindow";
import Login from "./components/auth/Login";
import Home from "./pages/Home";
import SecretaryPage from "./pages/SecretaryPage"; // Import the new page

const App = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false); // State for showing/hiding login modal

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onLoginClick={() => setLoginOpen(true)} />} />
        <Route path="/secretary" element={<SecretaryPage />} /> {/* Add route for SecretaryPage */}
      </Routes>

      {/* Floating chat toggle */}
      <ChatButton onClick={() => setChatOpen(!chatOpen)} />
      <ChatWindow open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Login modal */}
      {loginOpen && (
        <Login onClose={() => setLoginOpen(false)} />
      )}
    </Router>
  );
};

export default App;