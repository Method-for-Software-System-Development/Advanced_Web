import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Calendar from 'react-calendar';
import '../../styles/react-calendar.css'; // Adjusted path

// Define the structure of an Appointment
interface Appointment {
  id: string;
  time: string; // e.g., "10:00 AM"
  clientName: string;
  service: string;
  notes?: string;
  date: string; // Add date to appointment if not already present for filtering
}

// Mock function to fetch appointments for a given date
// In a real application, this would be an API call
const fetchAppointmentsForDate = async (date: Date): Promise<Appointment[]> => {
  const dateString = date.toISOString().split('T')[0];
  console.log(`Fetching appointments for ${dateString} from AppointmentView`);
  // Mock data - replace with actual API call
  const mockAppointments: { [key: string]: Appointment[] } = {
    '2025-05-22': [
      { id: '1', date: '2025-05-22', time: '09:00 AM', clientName: 'Alice Wonderland', service: 'Check-up' },
      { id: '2', date: '2025-05-22', time: '10:30 AM', clientName: 'Bob The Builder', service: 'Cleaning' },
      { id: '3', date: '2025-05-22', time: '02:00 PM', clientName: 'Charlie Brown', service: 'Consultation' },
    ],
    '2025-05-23': [
      { id: '4', date: '2025-05-23', time: '11:00 AM', clientName: 'Diana Prince', service: 'Follow-up' },
      { id: '5', date: '2025-05-23', time: '03:00 PM', clientName: 'Edward Scissorhands', service: 'Special Procedure' },
    ],
    '2025-06-10': [
      { id: '6', date: '2025-06-10', time: '10:00 AM', clientName: 'Peter Pan', service: 'Vaccination' },
    ],
  };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAppointments[dateString] || []);
    }, 500);
  });
};

const AppointmentView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const locale = "en-US";

  const datesWithAppointments = useMemo(() => {
    const mockAppointmentDates: { [key: string]: any } = {
      '2025-05-22': true,
      '2025-05-23': true,
      '2025-06-10': true,
    };
    return Object.keys(mockAppointmentDates);
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      const fetchedAppointments = await fetchAppointmentsForDate(selectedDate);
      setAppointments(fetchedAppointments);
      setIsLoading(false);
    };
    loadAppointments();
  }, [selectedDate]);

  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  const handleExportToExcel = () => {
    if (appointments.length === 0) {
      alert("No appointments to export for the selected date.");
      return;
    }
    const sheetData = appointments.map(apt => ({
      Time: apt.time,
      'Client Name': apt.clientName,
      Service: apt.service,
      Notes: apt.notes || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const headerCellStyle = { font: { bold: true } };
    if (worksheet['A1']) worksheet['A1'].s = headerCellStyle;
    if (worksheet['B1']) worksheet['B1'].s = headerCellStyle;
    if (worksheet['C1']) worksheet['C1'].s = headerCellStyle;
    if (worksheet['D1']) worksheet['D1'].s = headerCellStyle;
    const columnWidths = [
      { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 40 }
    ];
    worksheet['!cols'] = columnWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");
    const dateString = selectedDate.toLocaleDateString('en-CA');
    XLSX.writeFile(workbook, `Appointments_Report_${dateString}.xlsx`);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      if (datesWithAppointments.includes(dateString)) {
        const today = new Date();
        const isTodayDate = date.getDate() === today.getDate() &&
                          date.getMonth() === today.getMonth() &&
                          date.getFullYear() === today.getFullYear();
        const isSelectedDate = selectedDate &&
                             date.getDate() === selectedDate.getDate() &&
                             date.getMonth() === selectedDate.getMonth() &&
                             date.getFullYear() === selectedDate.getFullYear();
        let dotColorClass = "bg-[#EF92A6]";
        if (isTodayDate && isSelectedDate) dotColorClass = "bg-white";
        else if (isTodayDate && !isSelectedDate) dotColorClass = "bg-[#664147]";
        else if (!isTodayDate && isSelectedDate) dotColorClass = "bg-white";
        return <div className={`h-1.5 w-1.5 rounded-full mx-auto mt-1 ${dotColorClass}`}></div>;
      }
    }
    return null;
  };

  const tileClassNames = ({ view }: { date: Date; view: string }): string => {
    if (view === 'month') {
      const classes = ['react-calendar__tile'];
      return classes.join(' ');
    }
    return '';
  };

  return (
    <>
      {/* Calendar and Export Section */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow-xl max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-[#4A3F35] mb-4">Select Date to View Appointments</h2>
        <div className="flex justify-center mb-6">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={tileClassNames}
            tileContent={tileContent}
            locale={locale}
            navigationLabel={({ date }) => (
              <div className="react-calendar__navigation__label">
                {new Intl.DateTimeFormat(locale, {
                  year: 'numeric',
                  month: 'long',
                }).format(date)}
              </div>
            )}
            prevLabel={<button type="button" aria-label="Previous month" className="react-calendar__navigation__arrow react-calendar__navigation__prev-button">&lt;</button>}
            nextLabel={<button type="button" aria-label="Next month" className="react-calendar__navigation__arrow react-calendar__navigation__next-button">&gt;</button>}
            prev2Label={<button type="button" aria-label="Previous year" className="react-calendar__navigation__arrow react-calendar__navigation__prev2-button">&lt;&lt;</button>}
            next2Label={<button type="button" aria-label="Next year" className="react-calendar__navigation__arrow react-calendar__navigation__next2-button">&gt;&gt;</button>}
            formatShortWeekday={(l, d) => 
              new Intl.DateTimeFormat(l, { weekday: 'narrow' }).format(d) 
            }
          />
        </div>
        <div className="text-center">
          <button
            onClick={handleExportToExcel}
            disabled={appointments.length === 0 || isLoading}
            className="px-6 py-3 bg-[#664147] text-white font-semibold rounded-lg shadow-md hover:bg-[#58383E] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </button>
        </div>
      </section>

      {/* Appointments List Section */}
      <section className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-[#4A3F35] mb-6">
          Appointments for {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
    </>
  );
};

export default AppointmentView;
