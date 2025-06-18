import React, { useEffect } from 'react';
import Calendar from 'react-calendar';

type Value = Date | null | [Date | null, Date | null];

interface TailwindCalendarProps {
  onChange: (value: Value, event: React.MouseEvent<HTMLButtonElement>) => void;
  value: Value;
  locale?: string;
  onActiveStartDateChange?: ({ activeStartDate }: { activeStartDate: Date | null }) => void;
  tileContent?: ({ date, view }: { date: Date; view: string }) => React.ReactNode;
}

const TailwindCalendar: React.FC<TailwindCalendarProps> = ({
  onChange,
  value,
  locale = "en-US",
  onActiveStartDateChange,
  tileContent
}) => {
  useEffect(() => {
    // Inject Tailwind-based calendar styles
    const styleId = 'tailwind-calendar-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .tailwind-calendar .react-calendar {
          width: 100%;
          max-width: 600px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 1rem;
          font-family: inherit;
          line-height: 1.125em;
        }
        
        .dark .tailwind-calendar .react-calendar {
          background: #3B3B3B;
          border-color: #4b5563;
        }

        .tailwind-calendar .react-calendar button {
          margin: 0;
          border: 0;
          outline: none;
          border-radius: 0.25rem;
        }

        .tailwind-calendar .react-calendar button:enabled:hover {
          cursor: pointer;
        }

        .tailwind-calendar .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }

        .tailwind-calendar .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 1.25rem;
          color: #664147;
        }

        .dark .tailwind-calendar .react-calendar__navigation button {
          color: #FDF6F0;
        }

        .tailwind-calendar .react-calendar__navigation button:disabled {
          background-color: #f3f4f6;
        }

        .dark .tailwind-calendar .react-calendar__navigation button:disabled {
          background-color: #374151;
        }

        .tailwind-calendar .react-calendar__navigation button:enabled:hover,
        .tailwind-calendar .react-calendar__navigation button:enabled:focus {
          background-color: #e5e7eb;
        }

        .dark .tailwind-calendar .react-calendar__navigation button:enabled:hover,
        .dark .tailwind-calendar .react-calendar__navigation button:enabled:focus {
          background-color: #4b5563;
        }

        .tailwind-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
          color: #4A3F35;
        }

        .dark .tailwind-calendar .react-calendar__month-view__weekdays {
          color: #d1d5db;
        }

        .tailwind-calendar .react-calendar__month-view__weekdays__weekday {
          padding: 0.5em;
        }        .tailwind-calendar .react-calendar__month-view__weekNumbers .react-calendar__tile {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75em;
          font-weight: bold;
        }

        .tailwind-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #9ca3af;
          opacity: 0.6;
        }

        .dark .tailwind-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #6b7280;
          opacity: 0.6;
        }

        /* Ensure Sunday has the same color as other weekdays */
        .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile:nth-child(7n+1):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #1f2937;
        }

        .dark .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile:nth-child(7n+1):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #e5e7eb;
        }

        /* Ensure Friday has the same color as other weekdays */
        .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile:nth-child(7n+6):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #1f2937;
        }

        .dark .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile:nth-child(7n+6):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #e5e7eb;
        }        /* Make Saturday red */
        .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile:nth-child(7n):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #dc2626;
        }

        .dark .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile:nth-child(7n):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #f87171;
        }

        /* Make Saturday red even when it's from neighboring month */
        .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile.react-calendar__month-view__days__day--neighboringMonth:nth-child(7n):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #dc2626;
          opacity: 0.6;
        }

        .dark .tailwind-calendar .react-calendar__month-view__days .react-calendar__tile.react-calendar__month-view__days__day--neighboringMonth:nth-child(7n):not(.react-calendar__tile--active):not(.react-calendar__tile--now) {
          color: #f87171;
          opacity: 0.6;
        }

        .tailwind-calendar .react-calendar__year-view .react-calendar__tile,
        .tailwind-calendar .react-calendar__decade-view .react-calendar__tile,
        .tailwind-calendar .react-calendar__century-view .react-calendar__tile {
          padding: 2em 0.5em;
        }

        .tailwind-calendar .react-calendar__tile {
          max-width: 100%;
          padding: 10px 6.6667px;
          background: none;
          text-align: center;
          line-height: 16px;
          font-size: 1rem;
          color: #1f2937;
        }

        .dark .tailwind-calendar .react-calendar__tile {
          color: #e5e7eb;
        }

        .tailwind-calendar .react-calendar__tile:disabled {
          background-color: #f3f4f6;
        }

        .dark .tailwind-calendar .react-calendar__tile:disabled {
          background-color: #374151;
        }

        .tailwind-calendar .react-calendar__tile:enabled:hover,
        .tailwind-calendar .react-calendar__tile:enabled:focus {
          background-color: #e5e7eb;
        }

        .dark .tailwind-calendar .react-calendar__tile:enabled:hover,
        .dark .tailwind-calendar .react-calendar__tile:enabled:focus {
          background-color: #4b5563;
        }

        .tailwind-calendar .react-calendar__tile--now {
          background: #EF92A6;
          color: white;
          font-weight: bold;
        }

        .tailwind-calendar .react-calendar__tile--now:enabled:hover,
        .tailwind-calendar .react-calendar__tile--now:enabled:focus {
          background: #F7C9D3;
        }

        .tailwind-calendar .react-calendar__tile--hasActive {
          background: #664147;
          color: white;
        }

        .tailwind-calendar .react-calendar__tile--hasActive:enabled:hover,
        .tailwind-calendar .react-calendar__tile--hasActive:enabled:focus {
          background: #58383E;
        }

        .tailwind-calendar .react-calendar__tile--active {
          background: #664147;
          color: white;
          font-weight: bold;
        }

        .tailwind-calendar .react-calendar__tile--active:enabled:hover,
        .tailwind-calendar .react-calendar__tile--active:enabled:focus {
          background: #58383E;
        }

        .tailwind-calendar .react-calendar--selectRange .react-calendar__tile--hover {
          background-color: #e5e7eb;
        }

        .dark .tailwind-calendar .react-calendar--selectRange .react-calendar__tile--hover {
          background-color: #4b5563;
        }

        .tailwind-calendar .appointment-dot {
          height: 8px;
          width: 8px;
          background-color: #EF92A6;
          border-radius: 50%;
          display: block;
          margin-left: auto;
          margin-right: auto;
          margin-top: 4px;
        }

        .dark .tailwind-calendar .appointment-dot {
          background-color: #F7C9D3;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div className="tailwind-calendar">
      <Calendar
        onChange={onChange}
        value={value}
        locale={locale}
        onActiveStartDateChange={onActiveStartDateChange}
        tileContent={tileContent}
      />
    </div>
  );
};

export default TailwindCalendar;
