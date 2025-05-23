import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SecretaryWelcome from '../components/secretary/SecretaryWelcome';
import AppointmentView from '../components/secretary/AppointmentView';
import ManagePatientsView from '../components/secretary/ManagePatientsView';
import EditVeterinariansView from '../components/secretary/EditVeterinariansView'; // Import EditVeterinariansView
import FooterSection from '../components/FooterSection';

export type SecretaryView = 'welcome' | 'appointments' | 'managePatients' | 'editVeterinarians'; // Add 'editVeterinarians'

const SecretaryPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<SecretaryView>('welcome');

  const navigateTo = (view: SecretaryView) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F9F3F0] to-[#EAE0D9] text-[#4A3F35]">
      <Navbar />
      <main className="flex-grow pt-40 pb-12 px-4 sm:px-6 lg:px-8">
        {currentView === 'welcome' && (
          <SecretaryWelcome 
            onNavigateToAppointments={() => navigateTo('appointments')} 
            onNavigateToManagePatients={() => navigateTo('managePatients')}
            onNavigateToEditVeterinarians={() => navigateTo('editVeterinarians')} // Pass navigation function for edit veterinarians
          />
        )}
        {currentView === 'appointments' && (
          <AppointmentView onBack={() => navigateTo('welcome')} />
        )}
        {currentView === 'managePatients' && (
          <ManagePatientsView onBack={() => navigateTo('welcome')}/>
        )}
        {currentView === 'editVeterinarians' && ( // Add block for EditVeterinariansView
          <EditVeterinariansView onBack={() => navigateTo('welcome')} />
        )}
      </main>
      <FooterSection />
    </div>
  );
};

export default SecretaryPage;
