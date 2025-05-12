import React, { useState } from "react"; 
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/index.css";
import ChatButton from "./components/chatbot/ChatButton";
import ChatWindow from "./components/chatbot/ChatWindow";
import Login from "./components/auth/Login";
import Home from "./pages/Home";


const App = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* floating chat toggle */}
      <ChatButton onClick={() => setChatOpen(!chatOpen)} />
      
      {/* ChatWindow 
          {chatOpen && <ChatWindow onClose={() => setChatOpen(false)} />}
      */}
       <ChatWindow open={chatOpen} onClose={() => setChatOpen(false)} />
    </Router>
  );
};


export default App;