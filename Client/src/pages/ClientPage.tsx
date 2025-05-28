import React, { useState } from "react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import ClientProfile from "../components/user/ClientProfile";
import UserNavButton from "../components/user/UserNavButton";

// Define all 6 views
export type ClientView =
  | "profile"
  | "makeAppointment"
  | "showAppointments"
  | "prescriptions"
  | "history"
  | "review";

const allViews: ClientView[] = [
  "profile",
  "makeAppointment",
  "showAppointments",
  "prescriptions",
  "history",
  "review",
];

const viewLabels: Record<ClientView, string> = {
  profile: "Profile",
  makeAppointment: "Make Appointment",
  showAppointments: "Show Appointments",
  prescriptions: "Show Prescriptions",
  history: "Treatment History",
  review: "Review the Clinic",
};

const ClientPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ClientView>("profile");

  // Show 5 views excluding the current one
  const visibleViews = allViews.filter((v) => v !== currentView).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F3F0] text-[#4A3F35]">
      <Navbar />

      <main className="flex-grow pt-40 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Button Navigation */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          {allViews
            .filter((view) => view !== currentView) // exclude current view
            .slice(0, 5) // ensure only 5 are shown
            .map((view) => (
              <UserNavButton
                key={view}
                label={viewLabels[view]}
                onClick={() => setCurrentView(view)}
              />
            ))}
        </div>
        {/* View Content */}
        {currentView === "profile" && <ClientProfile />}
        {currentView === "makeAppointment" && (
          <div>Appointment Scheduler Coming Soon</div>
        )}
        {currentView === "showAppointments" && (
          <div>Your Appointments Will Appear Here</div>
        )}
        {currentView === "prescriptions" && (
          <div>Prescription List Placeholder</div>
        )}
        {currentView === "history" && (
          <div>Treatment History Component Placeholder</div>
        )}
        {currentView === "review" && (
          <div>Submit Clinic Review Form Placeholder</div>
        )}
      </main>

      <FooterSection />
    </div>
  );
};

export default ClientPage;
