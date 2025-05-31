import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SecretaryWelcome from '../components/secretary/SecretaryWelcome';
import AppointmentView from '../components/secretary/AppointmentView';
import ManagePatientsView from '../components/secretary/ManagePatientsView';
import EditStaffView from '../components/secretary/EditStaffView'; // Updated import
import FooterSection from '../components/FooterSection';

export type SecretaryView = 'welcome' | 'appointments' | 'managePatients' | 'editStaff'; // Updated view name

const SecretaryPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<SecretaryView>('welcome');

  const navigateTo = (view: SecretaryView) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F9F3F0] to-[#EAE0D9] text-[#4A3F35]">
      <Navbar />
      <main className="flex-grow pt-40 pb-12 px-4 sm:px-6 lg:px-8">        {currentView === 'welcome' && (
          <SecretaryWelcome 
            onNavigateToAppointments={() => navigateTo('appointments')} 
            onNavigateToManagePatients={() => navigateTo('managePatients')}
            onNavigateToEditStaff={() => navigateTo('editStaff')} // Updated function name
          />
        )}
        {currentView === 'appointments' && (
          <AppointmentView onBack={() => navigateTo('welcome')} />
        )}
        {currentView === 'managePatients' && (
          <ManagePatientsView onBack={() => navigateTo('welcome')}/>
        )}
        {currentView === 'editStaff' && ( // Updated view name
          <EditStaffView onBack={() => navigateTo('welcome')} />
        )}
      </main>
      <FooterSection />
    </div>
  );
};

export default SecretaryPage;
