import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChatButton from "../components/chatbot/ChatButton";
import ChatWindow from "../components/chatbot/ChatWindow";
import FooterSection from "../components/FooterSection";
import ClientProfile from "../components/user/ClientProfile";
import TreatmentHistory from "../components/user/TreatmentHistory";
import UserNavButton from "../components/user/UserNavButton";
import ShowPrescriptions from "../components/user/ShowPrescriptions";
import AppointmentViewClient from "../components/user/AppointmentViewClient";
import EmergencyAppointmentModal from "../components/user/appointments/EmergencyAppointmentModal";

// Define all views (combine makeAppointment and showAppointments into 'appointments')
export type ClientView =
  | "profile"
  | "appointments"
  | "prescriptions"
  | "history"
  | "contact";

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
  contact: "📞 Contact Us",
};

const CLINIC_PHONE = "+97241234567"; // Sourced from ContactSection for consistency

const ClientPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ClientView>("profile");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
  // Show all navigation buttons for consistency
  const visibleViews = allViews;
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-creamDark to-cream to-50% dark:from-darkModeDark dark:to-darkMode text-greyText dark:text-white">
      <Navbar onBackToDashboard={currentView !== "profile" ? handleBackToDashboard : undefined}
        onLogout={() => setChatOpen(false)} />
      <ChatButton onClick={() => setChatOpen(!chatOpen)} />
      <ChatWindow open={chatOpen} onClose={() => setChatOpen(false)} />

      <main className="flex-grow pt-40 pb-10 px-4 sm:px-6 lg:px-8">        <header className="mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-wine font-[Nunito] dark:text-white mb-1">Your Pet Clinic Dashboard</h1>
          <p className="text-base sm:text-lg text-grayText dark:text-lightGrayText">Track appointments, prescriptions, and your pets' wellbeing</p>
        </header>

        <div className="max-w-7xl mx-auto mb-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {visibleViews.map((view) => {
              const getButtonStyle = (viewType: ClientView) => {

                switch (viewType) {
                  case "profile":
                    return "bg-gradient-to-br from-pink to-pinkDark";
                  case "appointments":
                    return "bg-gradient-to-br from-sky to-skyDark";
                  case "prescriptions":
                    return "bg-gradient-to-br from-mint to-mintDark";
                  case "history":
                    return "bg-gradient-to-br from-orange to-orangeDark";
                  default:
                    return "bg-gradient-to-br from-gray-400 to-gray-600";
                }
              };      

              const getIcon = (viewType: ClientView) => {
                switch (viewType) {
                  case "profile": return "👤";
                  case "appointments": return "📅";
                  case "prescriptions": return "💊";
                  case "history": return "📖";
                  case "contact": return "📞";
                  default: return "🔧";
                }
              };  

              const getTitle = (viewType: ClientView) => {
                switch (viewType) {
                  case "profile": return "My Profile";
                  case "appointments": return "My Appointments";
                  case "prescriptions": return "My Prescriptions";
                  case "history": return "Treatment History";
                  case "contact": return "Contact Us";
                  default: return "Dashboard";
                }
              };              
              
              const getDescription = (viewType: ClientView) => {
                switch (viewType) {
                  case "profile": return "Edit personal & pet info";
                  case "appointments": return "Schedule & view";
                  case "prescriptions": return "Current & past prescriptions";
                  case "history": return "Past treatments";
                  case "contact": return "clinic number";
                  default: return "General info";
                }

              };return (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`relative flex flex-col items-center justify-center p-3 ${getButtonStyle(view)} text-grayText rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none cursor-pointer ${currentView === view ? 'ring-4 ring-white ring-opacity-50 scale-105' : ''
                    }`}
                >
                  <div className="text-2xl mb-1">{getIcon(view)}</div>
                  <h3 className="text-lg font-semibold text-center">{getTitle(view)}</h3>
                  <p className="text-xs text-center opacity-90">{getDescription(view)}</p>
                  {currentView === view && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"></div>
                  )}
                </button>
              );            })}            
            {/* Contact Us Button - Mobile Only */}
            <a
              href={`tel:${CLINIC_PHONE}`}
              className="md:hidden flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#D8CEF5] to-[#BAA9E3]  text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none cursor-pointer"
              style={{ textDecoration: 'none' }}
            >
              <div className="text-2xl mb-1">📞</div>
              <h3 className="text-lg font-semibold text-center">Contact Us</h3>
              <p className="text-xs text-center opacity-90">clinic number</p>
            </a>            {/* Emergency Button */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-redButton to-redButtonDark text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none cursor-pointer"
            >
              <div className="text-2xl mb-1">🚨</div>
              <h3 className="text-lg font-semibold text-center">Emergency</h3>
              <p className="text-xs text-center opacity-90">Urgent appointment</p>
            </button>
          </div>
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