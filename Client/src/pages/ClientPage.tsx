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
import FirstTimePasswordChangeModal from "../components/auth/FirstTimePasswordChangeModal";
import { User } from "../types";

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
  const [emergencyError, setEmergencyError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showFirstTimePasswordChange, setShowFirstTimePasswordChange] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  // Check for first-time login on page load/refresh
  useEffect(() => {
    const checkFirstTimeLogin = async () => {
      const clientRaw = sessionStorage.getItem("client");
      if (clientRaw) {
        const client = JSON.parse(clientRaw);
        setCurrentUser(client); // Set initial user data immediately
        
        // Always check with backend for the most current isFirstLogin status
        try {
          const { userService } = await import("../services/userService");
          const currentUserFromBackend = await userService.getUserById(client._id);
          
          // Only update if backend data is valid and has expected properties
          if (currentUserFromBackend && currentUserFromBackend._id) {
            setCurrentUser(currentUserFromBackend);
            sessionStorage.setItem("client", JSON.stringify(currentUserFromBackend));
            
            // Check if this is a first-time login based on backend data
            if (currentUserFromBackend.isFirstLogin === true) {
              setShowFirstTimePasswordChange(true);
            }
          } else {
            // Backend data is invalid, check isFirstLogin from sessionStorage
            if (client.isFirstLogin === true) {
              setShowFirstTimePasswordChange(true);
            }
          }
        } catch (error) {
          // If backend check fails, fall back to sessionStorage data
          console.error("Failed to verify user status:", error);
          if (client.isFirstLogin === true) {
            setShowFirstTimePasswordChange(true);
          }
        }
      }
    };
    
    checkFirstTimeLogin();
  }, []);

  const handlePasswordChanged = (updatedUser: User) => {
    // Update session storage with the updated user
    sessionStorage.setItem("client", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setShowFirstTimePasswordChange(false);
  };

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
    setEmergencyError(null);
    try {
      const { default: appointmentService } = await import("../services/appointmentService");
      const result = await appointmentService.createEmergencyAppointment({
        userId: client._id,
        petId,
        description: reasonFromModal?.trim() || 'No description provided',
        emergencyReason: reasonFromModal?.trim() || 'No reason provided',
      });
      
      if (!result.newAppointment || !result.newAppointment.staffId) {
        const msg = "No emergency appointments are available at the moment. Please visit the clinic and our team will assist you as soon as possible.";
        setEmergencyError(msg);
        setIsSubmittingEmergency(false);
        return;
      }
      
      setShowEmergencyModal(false);
      // Show success message or redirect to appointments
      setCurrentView("appointments");
    } catch (err: any) {
      let errorMessage = "No emergency appointments are available at the moment. Please visit the clinic and our team will assist you as soon as possible.";
      if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setEmergencyError(errorMessage);
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
      
      {/* Show FirstTimePasswordChangeModal if required - blocks everything else */}
      {showFirstTimePasswordChange && currentUser ? (
        <FirstTimePasswordChangeModal
          user={currentUser}
          onPasswordChanged={handlePasswordChanged}
          onClose={() => {}} // Empty function since modal shouldn't be closeable
        />
      ) : (
        <>
          <ChatButton onClick={() => setChatOpen(!chatOpen)} />
          <ChatWindow open={chatOpen} onClose={() => setChatOpen(false)} />

          <main className="flex-grow pt-40 pb-10 px-4 sm:px-6 lg:px-8">        <header className="mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-wine font-[Nunito] dark:text-white mb-1">Your Pet Clinic Dashboard</h1>
          <p className="text-base sm:text-lg text-grayText dark:text-lightGrayText">Track appointments, prescriptions, and your pets wellbeing</p>
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
                  id={
                    view === "profile"
                      ? "profile-btn"
                      : view === "appointments"
                      ? "appointments-btn"
                      : view === "prescriptions"
                      ? "prescriptions-btn"
                      : view === "history"
                      ? "history-btn"
                      : undefined
                  }
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
            id="emergency-btn"
            onClick={() => {
              setEmergencyError(null);
              setShowEmergencyModal(true);
            }}
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
            onClose={() => {
              setShowEmergencyModal(false);
              setEmergencyError(null);
            }}
            isSubmitting={isSubmittingEmergency}
            error={emergencyError}
            onConfirm={async (reason, petId) => {
              await handleEmergencyAppointmentClient(reason, petId);
            }}
          />
        )}
          </main>

          <FooterSection />
        </>
      )}
    </div>
  );
};

export default ClientPage;