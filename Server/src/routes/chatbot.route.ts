import express from "express";
import axios from "axios";
import { authMiddleware, AuthRequest } from "../services/authMiddleware";
import {
  createAppointment,
  cancelAppointment,
  getFutureAppointments,
  getTakenTimesForDay,
  getActiveVets,
} from "../services/appointmentService";
import { getPetHistory } from "../services/treatmentService";
import User from "../models/userSchema";
import Pet from "../models/petSchema";
import { IPet } from "../models/petSchema"
import Staff from "../models/staffSchema"; 

// Helper function to format a Date object to YYYY-MM-DD string in local time
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const router = express.Router();

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();


const NUMBERED_MENU = [
  { label: "Book appointment", display: "Book appointment" },
  { label: "Cancel appointment", display: "Cancel appointment" },
  { label: "Show history", display: "Show history" },
  { label: "Show clinic hours", display: "Show clinic hours" },
  { label: "Show contact details", display: "Show contact details" },
  { label: "Emergency", display: "Emergency" },
];

async function callGemini(prompt: string, retries = 3): Promise<string> {
  const systemPrompt =
    "You are Kayo, the friendly virtual assistant for FurEver Friends – Pet Clinic in Karmiel, Israel.\n" +
    "Always answer as Kayo, in a warm and welcoming way, and never mention that you are an AI model.\n" +
    "Here is some background about the clinic:\n" +
    "At FurEver Friends, we care for your pets as if they were our own. With years of experience and a deep love for animals, our expert team of veterinarians and caregivers is dedicated to delivering compassionate, personalized care tailored to each pet’s unique needs. Whether it’s a routine check-up, preventive care, or specialized treatment, we strive to create a calm, welcoming environment where both pets and their owners feel safe and understood. We believe in building long-term relationships based on trust, empathy, and medical excellence—because your pet deserves nothing less. Schedule a free introductory consultation or your first appointment today.\n" +
    "The user asked: \"" + prompt + "\"\n" +
    "Please answer as Kayo, in a brief, clear, and friendly way (maximum 3 sentences).";

  try {
    const { data } = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: systemPrompt }] }] }
    );
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I didn't understand."
    );
  } catch (err: any) {
    if (retries > 0 && err.response?.status === 503) {
      await new Promise((r) => setTimeout(r, 1000));
      return callGemini(prompt, retries - 1);
    }
    throw err;
  }
}


function getNumberedMenuText() {
  return (
    "Please choose an option by typing the corresponding number:\n" +
    NUMBERED_MENU.map((opt, i) => `${i + 1}. ${opt.display}`).join("\n") +
    "\n\nTo exit, type 'exit'.\nFor any other question, just ask."
  );
}
const sessionMap = new Map<string, any>();
/**
 * Chatbot main endpoint.
 * Supports both guests and logged-in users (JWT optional).
 * Some actions (appointments/history) require authentication; others don't.
 */
router.post("/", async (req, res, next) => {
  // Parse menu numbers
  let { message, petId, date, time, type, description } = req.body;
  let normalizedMessage = message;
 
// --- Handle "help" requests globally ---
const helpKeywords = [
  "help", "support", "i need help", "assistance"
];
if (helpKeywords.some(kw => normalizedMessage.toLowerCase().includes(kw))) {
  return res.json({
    reply:
      "Of course! Here’s what I can help you with:\n" +
      getNumberedMenuText() +
      "\nTo perform any of these actions, simply type the number, select from the menu, or type 'menu' at any time to see your options. For any other question, just ask!",
    menu: [],
  });
}

  // Always parse JWT if exists
  let userId: string | undefined = undefined;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    // Reuse your existing middleware as a function
    await new Promise<void>((resolve) => {
      authMiddleware(req as AuthRequest, res, (result: any) => {
        if ((req as AuthRequest).user) userId = (req as AuthRequest).user?.userId;
        resolve();
      });
    });
  }
  const session = userId ? sessionMap.get(userId) : undefined;

  // Only map 1-6 to menu if not in a session flow
  if (!session || session.step === "idle") {
    const idx = parseInt(message, 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < NUMBERED_MENU.length) {
      normalizedMessage = NUMBERED_MENU[idx].label;
    }
  }

  if (userId && sessionMap.has(userId)) {
    const session = sessionMap.get(userId);
        /* ------------------------------------------------------------
 *  STEP 2: user typed a date  ➜  show free time-slots
 * ---------------------------------------------------------- */
    if (session?.step === "chooseDate") {
      // --- Parse date:  YYYY-MM-DD  |  DD/MM  |  MM/DD  ---
      let pickedDate: Date | null = null;

      // YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedMessage)) {
        const [year, month, day] = normalizedMessage.split('-').map(Number);
        pickedDate = new Date(year, month - 1, day); // Parses as local midnight
      }

// DD/MM  or  MM/DD  
if (!pickedDate || isNaN(pickedDate.getTime())) {
  const m = normalizedMessage.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const [ , a, b ] = m.map(Number);
    const yyyy = new Date().getFullYear();
    pickedDate = new Date(yyyy, a - 1, b); // DD/MM
    if (isNaN(pickedDate.getTime())) {
      pickedDate = new Date(yyyy, b - 1, a); // MM/DD
    }
  }
}

if (!pickedDate || isNaN(pickedDate.getTime())) {
  return res.json({
    reply: "Date format not recognised. Try MM/DD, DD/MM or YYYY-MM-DD:",
    menu: [],
  });
}


  // 2. build list of free 30-min slots (08:00–19:30)
  const takenTimes = await getTakenTimesForDay(pickedDate);        // ← add helper in appointmentService
  const allSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2); // 08..19
    const minute = i % 2 === 0 ? "00" : "30";
    let h = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 ? "AM" : "PM";
    return `${h.toString().padStart(2, "0")}:${minute} ${ampm}`;
  });

  const freeSlots = allSlots.filter(t => !takenTimes.includes(t));

  if (!freeSlots.length) {
    return res.json({
      reply: "No available times that day, please choose another date:",
      menu: [],
    });
  }

  // 3. save state + reply
  sessionMap.set(userId, { ...session, step: "chooseTime", date: pickedDate, freeSlots });
  return res.json({
    reply:
      `Available times on ${formatDateToYYYYMMDD(pickedDate!)}:
` +
      freeSlots.map((t, i) => `${i + 1}. ${t}`).join("\n") +
      "\n(Type the number of your preferred time)",
    menu: [],
  });
}

/* ------------------------------------------------------------
 *  STEP 3: user picked a time  ➜  choose vet
 * ---------------------------------------------------------- */
    if (session?.step === "chooseTime") {
      const idx = parseInt(normalizedMessage, 10) - 1;
      const { freeSlots, date, petId, petName } = session;

      if (isNaN(idx) || idx < 0 || idx >= freeSlots.length) {
        return res.json({
          reply: "Invalid choice. Please type the number of the desired time from the list.",
          menu: [],
        });
      }

      const timeChosen = freeSlots[idx];

      // Fetch active vets for selection
      const vets = await getActiveVets();
      if (!vets.length) {
        return res.json({ reply: "No veterinarians available.", menu: [] });
      }

      // Update session and ask user to select vet
      sessionMap.set(userId, { ...session, step: "chooseVet", time: timeChosen, vets });

      return res.json({
        reply: `Please choose a veterinarian:\n` +
          vets.map((v: any, i: number) => `${i + 1}. ${v.firstName} ${v.lastName}`).join("\n") +
          "\n(Type the number of the vet you prefer)",
        menu: [],
      });
    }
/* ------------------------------------------------------------
 *  STEP 4: user picked a vet  ➜  ask for reason
 * ---------------------------------------------------------- */
    if (session?.step === "chooseVet") {
      const idx = parseInt(normalizedMessage, 10) - 1;
      const { vets } = session;

      if (isNaN(idx) || idx < 0 || idx >= vets.length) {
        return res.json({ reply: "Invalid choice. Please type the vet number from the list.", menu: [] });
      }

      const vet = vets[idx];
      sessionMap.set(userId, { ...session, step: "chooseReason", vetId: vet._id });
      return res.json({
        reply: "Please provide a brief reason for the appointment:",
        menu: [],
      });
    }
/* ------------------------------------------------------------
 *  STEP 5: user entered reason  ➜  ask for confirmation
 * ---------------------------------------------------------- */
    if (session?.step === "chooseReason") {
      const { petId, date, time, vetId, pets } = session;
      const petName = pets?.find((p: any) => p._id.toString() === petId.toString())?.name || "your pet";
      const reason = normalizedMessage?.trim();
      if (!reason) {
        return res.json({ reply: "Please provide a reason for the appointment.", menu: [] });
      }

      // Store details in session and ask for confirmation
      sessionMap.set(userId, { 
        ...session, 
        step: "confirmBooking", 
        appointmentDetails: { userId, petId, vetId, date, time, type: "wellness_exam", description: reason, petName }
      });

      return res.json({
        reply: `You are about to book an appointment for ${petName} on ${formatDateToYYYYMMDD(date)} at ${time} for: ${reason}.\nAre you sure? Type 'accept' to confirm or 'exit' to cancel.`,
        menu: [],
      });
    }

/* ------------------------------------------------------------
 *  STEP 6: user confirms booking  ➜  create appointment
 * ---------------------------------------------------------- */
    if (session?.step === "confirmBooking") {
      const { appointmentDetails } = session;

      if (!appointmentDetails) {
        sessionMap.delete(userId);
        return res.json({
            reply: "Session error: Could not retrieve appointment details. Please start over.",
            menu: [],
        });
      }
      
      const { userId: storedUserId, petId, vetId, date, time, type, description, petName } = appointmentDetails;

      if (normalizedMessage.toLowerCase() === "accept") {
        await createAppointment(storedUserId, petId, vetId, date, time, type, description);
        sessionMap.delete(userId);
        return res.json({
          reply: `✅ Appointment booked for ${petName} on ${formatDateToYYYYMMDD(date)} at ${time}.`,
          menu: [],
        });
      } else if (normalizedMessage.toLowerCase() === "exit") {
        sessionMap.delete(userId);
        return res.json({
          reply: "Booking process aborted.",
          menu: [],
        });
      } else {
        return res.json({
          reply: "Please type 'accept' to confirm or 'exit' to cancel.",
          menu: [],
        });
      }
    }


    // If user is currently in pet selection step
    if (session.step === "choosePet") {
      const selectedIdx = parseInt(normalizedMessage, 10) - 1;
      // Validate input
      if (isNaN(selectedIdx) || selectedIdx < 0 || selectedIdx >= session.pets.length) {
        return res.json({
          reply: "Invalid choice. Please type the number of your pet from the list.",
          menu: [],
        });
      }
  

      // Get selected pet
      const chosenPet = session.pets[selectedIdx];

      // Update session for next step
      sessionMap.set(userId, {
        ...session,
        step: "chooseDate",
        petId: chosenPet._id,
        petName: chosenPet.name,
      });

      return res.json({
        reply: `Great! You selected ${chosenPet.name}. Please enter a date for the appointment (MM/DD or YYYY-MM-DD):`,
        menu: [],
      });
    } // End of original content for this if block

    // MOVED AND MODIFIED CANCELLATION STEPS
    //step 2: user chose an appointment to cancel
    if (session?.step === "chooseAppointmentToCancel") {
        const idx = parseInt(normalizedMessage, 10) - 1;
        const { appts } = session;
        if (isNaN(idx) || idx < 0 || !appts || idx >= appts.length) { // Added !appts check
            return res.json({
                reply: "Invalid choice. Please type the number of the appointment to cancel.",
                menu: [],
            });
        }
        const selectedAppt = appts[idx];
        sessionMap.set(userId, {
            ...session, // Preserve other session data
            step: "confirmCancelAppointment",
            selectedAppt
        });
        return res.json({
            reply:
                `You chose to cancel the appointment on ${formatDateToYYYYMMDD(selectedAppt.date)} at ${selectedAppt.time}.\n` +
                "Are you sure? Type 'accept' to confirm or 'exit' to cancel.",
            menu: [],
        });
    }

    //step 3: user confirmed cancellation
    if (session?.step === "confirmCancelAppointment") {
        const { selectedAppt } = session; 

        if (!selectedAppt || !selectedAppt._id) { // Added check for selectedAppt and selectedAppt._id
            sessionMap.delete(userId);
            return res.json({
                reply: "Session error: Could not identify the appointment to cancel. Please start over.",
                menu: [],
            });
        }

        if (normalizedMessage.toLowerCase() === "accept") {
            const ok = await cancelAppointment(userId, selectedAppt._id);
            sessionMap.delete(userId);
            return res.json({
                reply: ok
                    ? "Appointment cancelled."
                    : "Could not cancel the appointment (please try again).",
                menu: [],
            });
        } else if (normalizedMessage.toLowerCase() === "exit") {
            sessionMap.delete(userId);
            return res.json({
                reply: "Cancellation process aborted.",
                menu: [],
            });
        } else {
            return res.json({
                reply: "Please type 'accept' to confirm or 'exit' to cancel.",
                menu: [],
            });
        }
    }
  } // End of if (userId && sessionMap.has(userId))

  // The original blocks for chooseAppointmentToCancel and confirmCancelAppointment (previously around here) are now moved above.
  // Continue with the code that followed them.

  // Exit command
  if (normalizedMessage.toLowerCase() === "exit") {
    return res.json({
      reply: "You have exited the menu. To start over, type 'menu'.",
      menu: [],
    });
  }

  // ================== Actions that require login ==================
  if (
    normalizedMessage === "Book appointment" ||
    (normalizedMessage === "Book now" && petId && date && time && type) ||
    normalizedMessage === "Cancel appointment" ||
    normalizedMessage.startsWith("Cancel ") ||
    normalizedMessage === "Show history"
  ) {
    if (!userId) {
      return res.json({
        reply: "Please log in to perform this action.",
        menu: [],
      });
    }

   /** runtime guard – narrows unknown  IPet */
function isPopulatedPet(p: unknown): p is IPet {
  return typeof p === "object" && p !== null && "name" in p;
}

/* ---------- Book-appointment – step 1 ---------- */
if (normalizedMessage === "Book appointment") {
  if (!userId) {
    return res.json({ reply: "Please log in to book an appointment.", menu: [] });
  }

  // pull user with typed, populated pets
  const user = await User
    .findById(userId)
    .populate<{ pets: IPet[] }>("pets");

  const pets = (user?.pets ?? []).filter(isPopulatedPet);

  if (!pets.length) {
    return res.json({
      reply: "You have no registered pets. Please add one first.",
      menu: [],
    });
  }

  /* one pet → skip selection */
  if (pets.length === 1) {
    const [pet] = pets;
    sessionMap.set(userId, {
      step: "chooseDate",
      petId: pet._id,
      petName: pet.name,
      pets,
    });
    return res.json({
      reply: `Pet selected (${pet.name}). Enter a date (MM/DD or YYYY-MM-DD):`,
      menu: [],
    });
  }

  /* multiple pets → ask user */
  const options = pets.map((p, i) => `${i + 1}. ${p.name}`).join("\n");
  sessionMap.set(userId, { step: "choosePet", pets });
  return res.json({
    reply: `Choose a pet:\n${options}\n(Type the number)`,
    menu: [],
  });
}

  //setp 1: user wants to cancel an appointment
if (normalizedMessage === "Cancel appointment") {
    const appts = await getFutureAppointments(userId);
    if (!appts.length) {
        return res.json({
            reply: "You have no upcoming appointments to cancel.",
            menu: [],
        });
    }
    // when there are multiple appointments, ask user to choose one
    sessionMap.set(userId, { step: "chooseAppointmentToCancel", appts });
    const menuText = appts.map( // Renamed 'menu' to 'menuText' to avoid conflict with res.json({ menu: [] })
        (a, idx) =>
            `${idx + 1}. ${formatDateToYYYYMMDD(a.date)} at ${a.time}` // استخدم formatDateToYYYYMMDD
    ).join("\n"); // Ensure this is a single backslash for newline

    return res.json({
        reply: `Please choose an appointment to cancel:\n${menuText}\n(Type the number)`,
        menu: [],
    });
}
    // Show pet history
    if (normalizedMessage === "Show history") {
      if (!petId) {
        return res.json({
          reply: "Please provide your Pet ID.",
          menu: [],
        });
      }
      const treatments = await getPetHistory(petId);
      if (!treatments.length) {
        return res.json({
          reply: "No treatment history found for this pet.",
          menu: [],
        });
      }
      return res.json({
        reply: treatments
          .slice(0, 3)
          .map(
            (t) =>
              `${formatDateToYYYYMMDD(t.visitDate)}: ` + // استخدم formatDateToYYYYMMDD
              `${t.treatmentType} – ${t.notes}`
          )
          .join("\n"), // Ensure this is a single backslash for newline
        menu: [],
      });
    }
  }

  // ================== Actions open for all ==================
 // 4. Static answers (hours / contact / emergency)
if (normalizedMessage === "Show clinic hours") {
  return res.json({
    reply:
      "Opening hours:\n" +
      "Sun-Thu 08:00–20:00\n" +
      "Friday 08:00–13:00\n" +
      "Saturday Closed",
    menu: []               // ← no quick-reply buttons
  });
}

if (normalizedMessage === "Show contact details") {
  return res.json({
    reply:
      "FurEver Friends – 51 Snonit St, Karmiel 🇮🇱\n" +
      "Phone: +972 4-123-4567\n" +
      "Email: info@fureverfriends.com",
    menu: []               // ← no quick-reply buttons
  });
}

if (normalizedMessage === "Emergency") {
  return res.json({
    reply: "🚑  For emergencies call +972 4-123-4567 immediately!",
    menu: []               // ← no quick-reply buttons
  });
}

  if (normalizedMessage === "Main menu" || normalizedMessage === "menu") {
    return res.json({ reply: getNumberedMenuText(), menu: [] });
  }

  // ================== Fallback to Gemini AI ==================
  try {
    const aiReply = await callGemini(normalizedMessage);
    res.json({ reply: aiReply, menu: [] });
  } catch (err: any) {
    console.error(
      "Gemini API error:",
      err.response?.data || err.message || err
    );
    res
      .status(500)
      .json({ reply: "Service busy – please try again shortly." });
  }
});

export default router;
