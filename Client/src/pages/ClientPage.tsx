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
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);
  const [showFirstTimePasswordChange, setShowFirstTimePasswordChange] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lastEmergencyTime, setLastEmergencyTime] = useState<number | null>(null);
  const [activeEmergencyAppointments, setActiveEmergencyAppointments] = useState<any[]>([]);

  // Emergency cooldown period in milliseconds (4 hours)
  const EMERGENCY_COOLDOWN = 4 * 60 * 60 * 1000;

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

    // Load last emergency appointment time from localStorage
    const savedLastEmergencyTime = localStorage.getItem("lastEmergencyAppointmentTime");
    if (savedLastEmergencyTime) {
      setLastEmergencyTime(parseInt(savedLastEmergencyTime));
    }

    // Check for active emergency appointments on page load
    checkActiveEmergencyAppointments();
  }, []);

  // Listen for emergency appointment cancellation
  useEffect(() => {
    const handleEmergencyCancellation = async () => {
      // Reset the cooldown when emergency appointment is cancelled
      setLastEmergencyTime(null);
      localStorage.removeItem("lastEmergencyAppointmentTime");
      // Also refresh the active emergency appointments list
      await checkActiveEmergencyAppointments();
    };

    // Listen for the custom event
    window.addEventListener('emergencyAppointmentCancelled', handleEmergencyCancellation);

    return () => {
      window.removeEventListener('emergencyAppointmentCancelled', handleEmergencyCancellation);
    };
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
  
  // Function to check for active emergency appointments
  const checkActiveEmergencyAppointments = async () => {
    try {
      const clientRaw = sessionStorage.getItem("client");
      if (!clientRaw) return [];

      const client = JSON.parse(clientRaw);
      if (!client.pets || client.pets.length === 0) return [];

      const { default: appointmentService } = await import("../services/appointmentService");
      
      // Get current date to filter for upcoming appointments
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      let emergencyAppointments: any[] = [];
      
      for (const pet of client.pets) {
        try {
          const petId = typeof pet === 'string' ? pet : pet._id;
          if (!petId) continue;
          
          const petAppointments = await appointmentService.getAppointmentsByPet(petId);
          
          // Filter for upcoming emergency appointments that are not cancelled
          const upcomingEmergencyAppointments = petAppointments.filter((appt: any) => {
            const apptDate = new Date(appt.date);
            apptDate.setHours(0, 0, 0, 0);
            return apptDate >= now && 
                   appt.type === 'emergency_care' && 
                   appt.status !== 'cancelled';
          });
          
          emergencyAppointments = [...emergencyAppointments, ...upcomingEmergencyAppointments];
        } catch (err) {
          console.error('Failed to load appointments for pet:', err);
        }
      }
      
      // Deduplicate by appointment ID
      const uniqueEmergencyAppointments = Array.from(
        new Map(emergencyAppointments.map(appt => [appt._id, appt])).values()
      );
      
      setActiveEmergencyAppointments(uniqueEmergencyAppointments);
      return uniqueEmergencyAppointments;
    } catch (error) {
      console.error('Failed to check emergency appointments:', error);
      return [];
    }
  };

  // Function to check if emergency cooldown is active
  const isEmergencyCooldownActive = async () => {
    // First check if there are any active emergency appointments
    const activeEmergencies = await checkActiveEmergencyAppointments();
    
    // If there are no active emergency appointments, no cooldown should apply
    if (activeEmergencies.length === 0) {
      return false;
    }
    
    // If there are active emergency appointments, check the timestamp cooldown
    if (!lastEmergencyTime) return false;
    const timeElapsed = Date.now() - lastEmergencyTime;
    return timeElapsed < EMERGENCY_COOLDOWN;
  };

  // Function to get remaining cooldown time in hours and minutes
  const getRemainingCooldownTime = () => {
    if (!lastEmergencyTime) return { hours: 0, minutes: 0 };
    const timeElapsed = Date.now() - lastEmergencyTime;
    const remainingTime = EMERGENCY_COOLDOWN - timeElapsed;
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    return { hours, minutes };
  };

  // Function to format remaining time as string
  const formatRemainingTime = () => {
    const { hours, minutes } = getRemainingCooldownTime();
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  // Function to show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // Auto-dismiss after 3 seconds
  };
  
  const handleEmergencyAppointmentClient = async (reasonFromModal?: string, petIdFromModal?: string) => {
    // Check cooldown before proceeding
    const cooldownActive = await isEmergencyCooldownActive();
    if (cooldownActive) {
      const remainingTime = formatRemainingTime();
      setEmergencyError(`You already have an emergency appointment scheduled. You can only request one emergency appointment every 4 hours. Please wait ${remainingTime} before requesting another emergency appointment.`);
      return;
    }

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
      
      // Set the last emergency time and save to localStorage
      const currentTime = Date.now();
      setLastEmergencyTime(currentTime);
      localStorage.setItem("lastEmergencyAppointmentTime", currentTime.toString());
      
      setShowEmergencyModal(false);
      showSuccessMessage('Emergency appointment created successfully!');
      // Set a flag to trigger refresh in AppointmentViewClient
      sessionStorage.setItem("refreshAppointments", "true");
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

          {/* Success Message Banner */}
          {successMessage && (
            <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg border-l-4 border-green-700 transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

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
            onClick={async () => {
              const cooldownActive = await isEmergencyCooldownActive();
              if (cooldownActive) {
                const remainingTime = formatRemainingTime();
                setEmergencyError(`You already have an emergency appointment scheduled. You can only request one emergency appointment every 4 hours. Please wait ${remainingTime} before requesting another emergency appointment.`);
                setShowEmergencyModal(true);
              } else {
                setEmergencyError(null);
                setShowEmergencyModal(true);
              }
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