import React from 'react';

interface SecretaryWelcomeProps {
  onNavigateToAppointments: () => void;
  onNavigateToManagePatients: () => void; // Add this new prop
  // Add other navigation functions as props here if needed for other sub-pages
}

const SecretaryWelcome: React.FC<SecretaryWelcomeProps> = ({ 
  onNavigateToAppointments, 
  onNavigateToManagePatients // Destructure the new prop
}) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-2xl">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-[#4A3F35] mb-3">Secretary Dashboard</h1>
        <p className="text-lg text-gray-600">Welcome! Please select an option below to manage clinic activities.</p>
      </header>

      <nav className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appointments Card */}
        <button
          onClick={onNavigateToAppointments}
          className="block p-8 bg-gradient-to-br from-[#EF92A6] to-[#E87A90] text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#F9F3F0] focus:ring-opacity-50"
        >
          <h2 className="text-2xl font-semibold mb-2">View Appointments</h2>
          <p className="text-sm opacity-90">Access the calendar, view scheduled appointments, and manage daily schedules.</p>
        </button>

        {/* Manage Patients Card */}
        <button
          onClick={onNavigateToManagePatients} // Use the new prop here
          className="block p-8 bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-200 focus:ring-opacity-50"
        >
          <h2 className="text-2xl font-semibold mb-2">Manage Patients</h2>
          <p className="text-sm opacity-90">Access and update patient records, view history, and manage contact information.</p>
        </button>
        
        <div className="block p-8 bg-gray-100 text-gray-700 rounded-lg shadow-lg cursor-not-allowed opacity-60">
          <h2 className="text-2xl font-semibold mb-2">Billing & Reports (Coming Soon)</h2>
          <p className="text-sm opacity-90">Generate invoices, track payments, and create financial reports.</p>
        </div>

        <div className="block p-8 bg-gray-100 text-gray-700 rounded-lg shadow-lg cursor-not-allowed opacity-60">
          <h2 className="text-2xl font-semibold mb-2">Settings (Coming Soon)</h2>
          <p className="text-sm opacity-90">Configure application settings and preferences.</p>
        </div>
      </nav>
    </div>
  );
};

export default SecretaryWelcome;
