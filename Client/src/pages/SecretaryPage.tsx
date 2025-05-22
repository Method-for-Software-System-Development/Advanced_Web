import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import Navbar
import FooterSection from '../components/FooterSection'; // Import FooterSection
import * as XLSX from 'xlsx'; // Import xlsx library

// Define the structure of an Appointment
interface Appointment {
  id: string;
  time: string; // e.g., "10:00 AM"
  clientName: string;
  service: string;
  notes?: string;
}

// Mock function to fetch appointments for a given date
// In a real application, this would be an API call
const fetchAppointmentsForDate = async (date: string): Promise<Appointment[]> => {
  console.log(`Fetching appointments for ${date}`);
  // Mock data - replace with actual API call
  const mockAppointments: { [key: string]: Appointment[] } = {
    '2025-05-22': [
      { id: '1', time: '09:00 AM', clientName: 'Alice Wonderland', service: 'Check-up' },
      { id: '2', time: '10:30 AM', clientName: 'Bob The Builder', service: 'Cleaning' },
      { id: '3', time: '02:00 PM', clientName: 'Charlie Brown', service: 'Consultation' },
    ],
    '2025-05-23': [
      { id: '4', time: '11:00 AM', clientName: 'Diana Prince', service: 'Follow-up' },
      { id: '5', time: '03:00 PM', clientName: 'Edward Scissorhands', service: 'Special Procedure' },
    ],
    // Add more dates and appointments as needed
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAppointments[date] || []);
    }, 500);
  });
};

const SecretaryPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      const fetchedAppointments = await fetchAppointmentsForDate(selectedDate);
      setAppointments(fetchedAppointments);
      setIsLoading(false);
    };
    loadAppointments();
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleExportToExcel = () => {
    if (appointments.length === 0) {
      alert("No appointments to export for the selected date.");
      return;
    }

    // Prepare data for Excel sheet
    const sheetData = appointments.map(apt => ({
      Time: apt.time,
      'Client Name': apt.clientName,
      Service: apt.service,
      Notes: apt.notes || '' // Ensure notes is not undefined
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

    // Define filename based on selected date
    const dateString = new Date(selectedDate).toLocaleDateString('en-CA'); // YYYY-MM-DD format for filename
    XLSX.writeFile(workbook, `Appointments_Report_${dateString}.xlsx`);
  };

  return (
    <>
      <Navbar /> {/* Add Navbar here */}
      <main className="pt-32 pb-16 bg-[#F5D2B3] min-h-screen"> {/* Added padding top, bottom, bg color, and min height */}
        <div className="container mx-auto p-4">
          <header className="mb-8 pt-10"> {/* Added pt-10 for spacing from navbar */}
            <h1 className="text-3xl font-bold text-center text-[#4A3F35]">Secretary Dashboard</h1>
            <p className="text-center text-gray-600">Manage and view appointments.</p>
          </header>

          <section className="mb-8 p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-[#4A3F35] mb-4 sm:mb-0">Select Date</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#664147] focus:border-[#664147] w-full sm:w-auto"
              />
            </div>
            <button
              onClick={handleExportToExcel}
              disabled={appointments.length === 0 || isLoading}
              className="mt-4 sm:mt-0 px-6 py-3 bg-[#664147] text-white font-semibold rounded-lg shadow-md hover:bg-[#58383E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Today's Appointments to Excel
            </button>
          </section>

          <section className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto"> {/* Enhanced shadow, max-width, centered */}
            <h2 className="text-2xl font-semibold text-[#4A3F35] mb-6">
              Appointments for {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500 text-lg">Loading appointments...</p>
              </div>
            ) : appointments.length > 0 ? (
              <ul className="space-y-6">
                {appointments.map((apt) => (
                  <li key={apt.id} className="p-6 border border-gray-200 rounded-lg shadow-md bg-gray-50 hover:shadow-lg transition-shadow duration-200 ease-in-out">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-xl text-[#664147]">{apt.time}</p>
                      <span className="px-3 py-1 text-sm font-semibold text-white bg-[#EF92A6] rounded-full">{apt.service}</span>
                    </div>
                    <p className="text-gray-800"><strong className="font-medium text-gray-600">Client:</strong> {apt.clientName}</p>
                    {apt.notes && <p className="mt-2 text-sm text-gray-600"><strong className="font-medium">Notes:</strong> {apt.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500 text-lg">No appointments scheduled for this date.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <FooterSection /> {/* Add FooterSection here */}
    </>
  );
};

export default SecretaryPage;
