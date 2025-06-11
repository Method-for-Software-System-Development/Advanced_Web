import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import EnhancedSecretaryWelcome from '../components/secretary/EnhancedSecretaryWelcome';
import AppointmentView from '../components/secretary/AppointmentView';
import ManagePatientsView from '../components/secretary/ManagePatientsView';
import StaffManagement from '../components/secretary/StaffManagement'; // Updated import
import PrescriptionManagement from '../components/secretary/PrescriptionManagement';
import FooterSection from '../components/FooterSection';

export type SecretaryView = 'welcome' | 'appointments' | 'managePatients' | 'editStaff' | 'addPrescription';

const SecretaryPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<SecretaryView>('welcome');

  const navigateTo = (view: SecretaryView) => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('welcome');
  };  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F9F3F0] to-[#EAE0D9] dark:from-[#121212] dark:to-[#1a1a1a] text-[#4A3F35] dark:text-[#FDF6F0]">
      <Navbar onBackToDashboard={currentView !== 'welcome' ? handleBackToDashboard : undefined} />
      <main className="flex-grow pt-40 pb-12 px-4 sm:px-6 lg:px-8">{currentView === 'welcome' && (
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
          <ManagePatientsView onBack={() => navigateTo('welcome')}/>
        )}        {currentView === 'editStaff' && ( // Updated view name
          <StaffManagement onBack={() => navigateTo('welcome')} />
        )}
        {currentView === 'addPrescription' && (
          <PrescriptionManagement onBack={() => navigateTo('welcome')} />
        )}
      </main>
      <FooterSection />
    </div>
  );
};

export default SecretaryPage;
