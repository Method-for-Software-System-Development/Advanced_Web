import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SecretaryWelcome from '../components/secretary/SecretaryWelcome';
import AppointmentView from '../components/secretary/AppointmentView';
import ManagePatientsView from '../components/secretary/ManagePatientsView'; // Import ManagePatientsView
import FooterSection from '../components/FooterSection';

export type SecretaryView = 'welcome' | 'appointments' | 'managePatients'; // Add 'managePatients'

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
            onNavigateToManagePatients={() => navigateTo('managePatients')} // Pass navigation function
          />
        )}
        {currentView === 'appointments' && (
          <>
            <div className="mb-8 text-center">
                <button 
                    onClick={() => navigateTo('welcome')} 
                    className="px-6 py-3 bg-[#664147] text-white font-semibold rounded-lg shadow-md hover:bg-[#58383E] transition-colors duration-200"
                >
                    Back to Secretary Dashboard
                </button>
            </div>
            <AppointmentView />
          </>
        )}
        {currentView === 'managePatients' && ( // Add block for ManagePatientsView
          <>
            <div className="mb-8 text-center">
                <button 
                    onClick={() => navigateTo('welcome')} 
                    className="px-6 py-3 bg-[#664147] text-white font-semibold rounded-lg shadow-md hover:bg-[#58383E] transition-colors duration-200"
                >
                    Back to Secretary Dashboard
                </button>
            </div>
            <ManagePatientsView />
          </>
        )}
      </main>
      <FooterSection />
    </div>
  );
};

export default SecretaryPage;
