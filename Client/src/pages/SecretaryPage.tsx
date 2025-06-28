import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import EnhancedSecretaryWelcome from '../components/secretary/EnhancedSecretaryWelcome';
import AppointmentView from '../components/secretary/AppointmentView';
import ManagePatientsView from '../components/secretary/ManagePatientsView';
import StaffManagement from '../components/secretary/StaffManagement'; // Updated import
import PrescriptionManagement from '../components/secretary/PrescriptionManagement';
import FooterSection from '../components/FooterSection';
import ChatButton from "../components/chatbot/ChatButton";
import ChatWindow from "../components/chatbot/ChatWindow";
import FirstTimePasswordChangeModal from '../components/auth/FirstTimePasswordChangeModal';
import { User } from '../types';
export type SecretaryView = 'welcome' | 'appointments' | 'managePatients' | 'editStaff' | 'addPrescription';

const SecretaryPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<SecretaryView>('welcome');  // Check for navigation signal from AboutSection
  const [chatOpen, setChatOpen] = useState(false);
  const [showFirstTimePasswordChange, setShowFirstTimePasswordChange] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const navigateToAppointments = sessionStorage.getItem("navigateToAppointments");
    const navigateToAddAppointment = sessionStorage.getItem("navigateToAddAppointment");
    
    if (navigateToAppointments === "true") {
      setCurrentView("appointments");
      sessionStorage.removeItem("navigateToAppointments"); // Clean up
    } else if (navigateToAddAppointment === "true") {
      setCurrentView("appointments");
      sessionStorage.removeItem("navigateToAddAppointment"); // Clean up
      // Note: We'll need to pass a signal to AppointmentView to show the add form
      sessionStorage.setItem("showAddFormDirectly", "true");
    }
  }, []);

  // Check for first-time login on page load/refresh
  useEffect(() => {
    const checkFirstTimeLogin = async () => {
      const clientRaw = sessionStorage.getItem("client");
      if (clientRaw) {
        const client = JSON.parse(clientRaw);
        setCurrentUser(client); // Set initial user data immediately
        
        // Always check with backend for the most current isFirstLogin status
        try {
          const { userService } = await import("../services/userService");
          const currentUserFromBackend = await userService.getUserById(client._id);
          
          // Only update if backend data is valid and has expected properties
          if (currentUserFromBackend && currentUserFromBackend._id) {
            setCurrentUser(currentUserFromBackend);
            sessionStorage.setItem("client", JSON.stringify(currentUserFromBackend));
            
            // Check if this is a first-time login based on backend data
            if (currentUserFromBackend.isFirstLogin === true) {
              setShowFirstTimePasswordChange(true);
            }
          } else {
            // Backend data is invalid, check isFirstLogin from sessionStorage
            if (client.isFirstLogin === true) {
              setShowFirstTimePasswordChange(true);
            }
          }
        } catch (error) {
          // If backend check fails, fall back to sessionStorage data
          console.error("Failed to verify user status:", error);
          if (client.isFirstLogin === true) {
            setShowFirstTimePasswordChange(true);
          }
        }
      }
    };
    
    checkFirstTimeLogin();
  }, []);

  const handlePasswordChanged = (updatedUser: User) => {
    // Update session storage with the updated user
    sessionStorage.setItem("client", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setShowFirstTimePasswordChange(false);
  };

  const navigateTo = (view: SecretaryView) => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('welcome');
  };  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-creamDark to-cream to-50% dark:from-darkModeDark dark:to-darkMode text-greyText dark:text-white">
      <Navbar onBackToDashboard={currentView !== 'welcome' ? handleBackToDashboard : undefined} onLogout={() => setChatOpen(false)} />
      
      {/* Show FirstTimePasswordChangeModal if required - blocks everything else */}
      {showFirstTimePasswordChange && currentUser ? (
        <FirstTimePasswordChangeModal
          user={currentUser}
          onPasswordChanged={handlePasswordChanged}
          onClose={() => {}} // Empty function since modal shouldn't be closeable
        />
      ) : (
        <>
          <main className="flex-grow pt-35 px-4 sm:px-6 lg:px-8">{currentView === 'welcome' && (
        <EnhancedSecretaryWelcome
          onNavigateToAppointments={() => navigateTo('appointments')}
          onNavigateToManagePatients={() => navigateTo('managePatients')}
          onNavigateToEditStaff={() => navigateTo('editStaff')} // Updated function name
          onNavigateToAddPrescription={() => navigateTo('addPrescription')}
        />
      )}
        {currentView === 'appointments' && (
          <AppointmentView onBack={() => navigateTo('welcome')} />
        )}
        {currentView === 'managePatients' && (
          <ManagePatientsView onBack={() => navigateTo('welcome')} />
        )}        {currentView === 'editStaff' && ( // Updated view name
          <StaffManagement onBack={() => navigateTo('welcome')} />
        )}
        {currentView === 'addPrescription' && (
          <PrescriptionManagement onBack={() => navigateTo('welcome')} />
        )}
          </main>
          {/* floating chat UI */}
          <ChatButton onClick={() => setChatOpen(!chatOpen)} />
          <ChatWindow open={chatOpen} onClose={() => setChatOpen(false)} />
          <FooterSection />
        </>
      )}
    </div>
  );
};

export default SecretaryPage;
