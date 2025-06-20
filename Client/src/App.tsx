import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import SecretaryPage from "./pages/SecretaryPage"; // Import the new page
import ClientPage from "./pages/ClientPage"; // Import the new page
import ScrollToHash from "./components/ScrollToHash";


const App = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false); // State for showing/hiding login modal

  return (
    <Router>   
      {/* Scroll handler for URL hash navigation */}
      <ScrollToHash />    
      <Routes>
     
        <Route path="/" element={<Home onLoginClick={() => setLoginOpen(true)} />} />
        <Route 
          path="/secretary" 
          element={
            <ProtectedRoute requiredRole="secretary">
              <SecretaryPage />
            </ProtectedRoute>
          } 
        />        <Route 
          path="/client" 
          element={
            <ProtectedRoute requireAuth={true} excludedRoles={["secretary"]}>
              <ClientPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {/* Login modal */}
      {loginOpen && (
        <Login onClose={() => setLoginOpen(false)} />
      )}
    </Router>
  );
};

export default App;