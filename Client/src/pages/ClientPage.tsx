import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import ClientProfile from "../components/user/ClientProfile";
import TreatmentHistory from "../components/user/TreatmentHistory";
import UserNavButton from "../components/user/UserNavButton";
import ShowPrescriptions from "../components/user/ShowPrescriptions";
import AppointmentViewClient from "../components/user/AppointmentViewClient";
import EmergencyAppointmentModal from "../components/user/appointments/EmergencyAppointmentModal";

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
  profile: "👤 My Profile",
  appointments: "📅 My Appointments",
  prescriptions: "💊 My Prescriptions",
  history: "📖 Treatment History",
};

const CLINIC_PHONE = "+97241234567"; // Sourced from ContactSection for consistency

const ClientPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ClientView>("profile");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState(false);
  // Check for navigation signal from AboutSection
  useEffect(() => {
    const navigateToAppointments = sessionStorage.getItem("navigateToAppointments");
    const navigateToAddAppointment = sessionStorage.getItem("navigateToAddAppointment");
    
    if (navigateToAppointments === "true") {
      setCurrentView("appointments");
      sessionStorage.removeItem("navigateToAppointments"); // Clean up
    } else if (navigateToAddAppointment === "true") {
      setCurrentView("appointments");
      sessionStorage.removeItem("navigateToAddAppointment"); // Clean up
      // Note: We'll need to pass a signal to AppointmentViewClient to show the add form
      sessionStorage.setItem("showAddFormDirectly", "true");
    }
  }, []);

  const handleBackToDashboard = () => {
    setCurrentView("profile");
  };
  const handleEmergencyAppointmentClient = async (reasonFromModal?: string, petIdFromModal?: string) => {
    const clientRaw = sessionStorage.getItem("client");
    if (!clientRaw) return;
    const client = JSON.parse(clientRaw);
    const petId = petIdFromModal || (client.pets && client.pets.length > 0 ? (typeof client.pets[0] === 'string' ? client.pets[0] : client.pets[0]._id) : null);
    if (!petId) return;
    setIsSubmittingEmergency(true);
    try {
      await import("../services/appointmentService").then(({ default: appointmentService }) =>
        appointmentService.createEmergencyAppointment({
          userId: client._id,
          petId,
          description: reasonFromModal?.trim() || 'No description provided',
          emergencyReason: reasonFromModal?.trim() || 'No reason provided',
        })
      );
      setShowEmergencyModal(false);
      // Optionally show a toast/notification here
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsSubmittingEmergency(false);
    }
  };

  // Show navigation buttons for all views except the current one
  const visibleViews = allViews.filter((v) => v !== currentView);
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F3F0] dark:bg-[#2D1B1F] text-[#4A3F35] dark:text-[#FDF6F0]">
      <Navbar onBackToDashboard={currentView !== "profile" ? handleBackToDashboard : undefined} />

      <main className="flex-grow pt-40 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          {visibleViews.map((view) => (
            <UserNavButton
              key={view}
              label={viewLabels[view]}
              onClick={() => setCurrentView(view)}
              className="w-full sm:w-auto"
            />
          ))}
          <UserNavButton
            label="🚨 Emergency Appointment"
            onClick={() => setShowEmergencyModal(true)}
            className="w-full sm:w-auto"
          />
          <a
            href={`tel:${CLINIC_PHONE}`}
            className="bg-[#664147] dark:bg-[#58383E] text-white px-4 py-2 rounded shadow hover:bg-[#4d3034] dark:hover:bg-[#4A2F33] font-semibold transition text-base sm:text-sm w-full sm:w-auto"
            style={{ textDecoration: 'none' }}
          >
            📞 Contact us
          </a>
        </div>
        {/* View Content */}
        {currentView === "profile" && <ClientProfile />}
        {currentView === "appointments" && <AppointmentViewClient onBack={() => setCurrentView("profile")} />}
        {currentView === "prescriptions" && <ShowPrescriptions />}
        {currentView === "history" && <TreatmentHistory />}
        {showEmergencyModal && (
          <EmergencyAppointmentModal
            open={showEmergencyModal}
            onClose={() => setShowEmergencyModal(false)}
            isSubmitting={isSubmittingEmergency}
            onConfirm={async (reason, petId) => {
              await handleEmergencyAppointmentClient(reason, petId);
            }}
          />
        )}
      </main>

      <FooterSection />
    </div>
  );
};

export default ClientPage;
