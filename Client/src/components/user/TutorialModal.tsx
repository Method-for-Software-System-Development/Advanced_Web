import React, { useState, useEffect } from "react";

/**
 * StepData describes each step of the tutorial:
 * - title: Step header
 * - description: Step instructions
 * - selector: id of the button to highlight (for overlay)
 */
interface StepData {
  title: string;
  description: string;
  selector: string | null;
  
}

// Tutorial steps: add selector for each button's id
const allSteps: StepData[] = [
  {
    title: "No Pets Linked",
    description:
      "To add pets to your account, please contact the clinic secretary by phone. Adding pets yourself is not supported.\n\nCall: +972 4 123 4567",
    selector: null,
  },
  {
    title: "My Profile",
    description:
      "View and update your personal details, including your email, phone number, city, street, and postal code. You can also see all pets linked to your account.",
    selector: "#profile-btn",
  },
  {
    title: "My Appointments",
    description:
      "See all your upcoming and past appointments for each pet. You can schedule a new appointment, edit or cancel existing ones, and review appointment details including date, time, staff, and notes.",
    selector: "#appointments-btn",
  },
  {
    title: "My Prescriptions",
    description:
      "View a full history of prescriptions for your pets. Search by pet or medicine, check status (fulfilled/unfulfilled), and find dosage details and issue dates.",
    selector: "#prescriptions-btn",
  },
  {
    title: "Treatment History",
    description:
      "Review all past treatments your pets received at the clinic. You’ll find details like type of treatment, treating vet, cost, date, description, and notes for each visit.",
    selector: "#history-btn",
  },
  {
    title: "Emergency Appointment",
    description:
      "If your pet needs urgent care, click here to request an immediate emergency appointment.\n\nThis appointment costs $1000 and is intended for real emergencies only. Fill in the required details and our team will contact you right away.",
    selector: "#emergency-btn",
  },
];




interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
  hasPets: boolean;
}

/**
 * TutorialModal
 * - Shows a multi-step tutorial with an overlay highlighting the relevant button.
 * - Modal is placed at the bottom-left corner of the screen.
 * - No blur, just a transparent background overlay.
 */
  const TutorialModal: React.FC<TutorialModalProps> = ({ open, onClose, hasPets  }) => {
  const steps = React.useMemo(
  () => (hasPets ? allSteps.slice(1) : allSteps),
  [hasPets]
    );
  
  const [step, setStep] = useState(0);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  
  // Update overlay position when step changes or window resizes
  useEffect(() => {
    /**
     * Calculates and sets the overlay position and size based on the button's DOMRect.
     */
    function updateOverlay() {
      const selector = steps[step].selector;
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setOverlayStyle({
            position: "fixed",
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            zIndex: 1002,
            pointerEvents: "none",
            border: "3px solid #EF92A6",
            borderRadius: "18px",
            boxShadow: "0 0 20px 6px #EF92A6",
            transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
          });
        } else {
          setOverlayStyle({});
        }
      } else {
        setOverlayStyle({});
      }
    }

    if (open) {
      updateOverlay();
      window.addEventListener("resize", updateOverlay);
      window.addEventListener("scroll", updateOverlay, { passive: true });
    }
   return () => {
    window.removeEventListener("resize", updateOverlay);
    window.removeEventListener("scroll", updateOverlay);               
  };
}, [step, open, steps]);

  if (!open) return null;

  const isLast = step === steps.length - 1;

  // Move to next step
  const handleNext = () => {
    if (!isLast) setStep((s) => s + 1);
  };

  // Skip tutorial or close modal
  const handleSkipOrClose = () => {
    setStep(0);
    onClose();
  };

  // Complete tutorial
  const handleGotIt = () => {
    setStep(0);
    onClose();
  };

  return (
    <>
      {/* Overlay highlight around the relevant button */}
      {steps[step].selector && <div style={overlayStyle} />}

      {/* Transparent screen overlay (no blur) */}
      <div className="fixed inset-0 z-50 bg-black/20 pointer-events-none" />

      {/* Tutorial modal positioned bottom-left */}
      <div
        className="fixed z-[1010] left-8 bottom-8 max-w-md w-[350px] p-6 bg-white dark:bg-darkMode border-2 border-wine dark:border-wineDark rounded-2xl shadow-2xl"
        style={{
          transition: "all 0.3s",
        }}
      >
        <button
          onClick={handleSkipOrClose}
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="Close tutorial"
        >
          ×
        </button>
        <h2 className="mb-2 text-xl font-bold text-wine dark:text-white">
          {steps[step].title}
        </h2>
        <p className="text-base whitespace-pre-line text-grayText dark:text-white mb-6">
          {steps[step].description}
        </p>
        <div className="flex justify-between mt-2">
          <button
            onClick={handleSkipOrClose}
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition w-30 cursor-pointer"
          >
            Skip All
          </button>
          {!isLast ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-wine text-white font-bold hover:bg-wineDark transition w-30 cursor-pointer"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGotIt}
              className="px-5 py-2 rounded-lg bg-wine text-white font-bold hover:bg-wineDark transition w-30 cursor-pointer"
            >
              Got it
            </button>
          )}
        </div>
        <div className="mt-4 text-center text-gray-400 text-sm">
          Step {step + 1} of {steps.length}
        </div>
      </div>
    </>
  );
};

export default TutorialModal;
