import React, { useState } from "react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import ClientProfile from "../components/user/ClientProfile";
import TreatmentHistory from "../components/user/TreatmentHistory";
import UserNavButton from "../components/user/UserNavButton";
import ShowPrescriptions from "../components/user/ShowPrescriptions";

// Define all 5 views (combine makeAppointment and showAppointments into 'appointments')
export type ClientView =
  | "profile"
  | "appointments"
  | "prescriptions"
  | "history";

const allViews: ClientView[] = [
  "profile",
  "appointments",
  "prescriptions",
  "history",
];

const viewLabels: Record<ClientView, string> = {
  profile: "Profile",
  appointments: "Appointments",
  prescriptions: "Show Prescriptions",
  history: "Treatment History",
};

const ClientPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ClientView>("profile");

  // Show navigation buttons for all views except the current one
  const visibleViews = allViews.filter((v) => v !== currentView);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F3F0] text-[#4A3F35]">
      <Navbar />

      <main className="flex-grow pt-40 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Button Navigation */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          {visibleViews.map((view) => (
            <UserNavButton
              key={view}
              label={viewLabels[view]}
              onClick={() => setCurrentView(view)}
            />
          ))}
        </div>
        {/* View Content */}
        {currentView === "profile" && <ClientProfile />}
        {currentView === "appointments" && (
          <div>Appointments Section Coming Soon</div>
        )}
        {currentView === "prescriptions" && <ShowPrescriptions />}
        {currentView === "history" && <TreatmentHistory />}
      </main>

      <FooterSection />
    </div>
  );
};

export default ClientPage;
