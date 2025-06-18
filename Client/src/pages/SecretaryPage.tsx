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
export type SecretaryView = 'welcome' | 'appointments' | 'managePatients' | 'editStaff' | 'addPrescription';

const SecretaryPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<SecretaryView>('welcome');  // Check for navigation signal from AboutSection
  const [chatOpen, setChatOpen] = useState(false);
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

  const navigateTo = (view: SecretaryView) => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('welcome');
  }; return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-creamDark to-cream to-50% dark:from-darkModeDark dark:to-darkMode text-greyText dark:text-white">
      <Navbar onBackToDashboard={currentView !== 'welcome' ? handleBackToDashboard : undefined} onLogout={() => setChatOpen(false)} />
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
    </div>
  );
};

export default SecretaryPage;
