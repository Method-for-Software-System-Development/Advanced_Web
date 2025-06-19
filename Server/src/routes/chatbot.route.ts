/* ────────────────────────────────────────────────────────────────────────────
   FurEver Friends  - Chatbot Route  (TypeScript, fully documented in English)
──────────────────────────────────────────────────────────────────────────── */

import express, { Request, Response } from "express";
import axios from "axios";

import {
  createAppointment,
  cancelAppointment,
  getFutureAppointments,
  getTakenTimesForDay,
  getActiveVets,
  getAppointmentHistoryByPet,
} from "../services/appointmentService";
import { authMiddleware, AuthRequest } from "../services/authMiddleware";
import User  from "../models/userSchema";
import { IPet }                 from "../models/petSchema";
import Staff from "../models/staffSchema";
import { parseUserDate } from "../utils/dateParse";  
const router = express.Router();

/* ─────────────────────────── 1. Utility helpers ─────────────────────────── */
//Add to the response
const MENU_HINT = "\n\nℹ️ Tip: At any time, type 'menu' to return to the main menu.";

/** Format a Date as local-time YYYY-MM-DD (no UTC shift). */
const fmtDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Runtime guard for populated pets. */
const isPet = (x: unknown): x is IPet =>
  typeof x === "object" && x !== null && "name" in x;

/* ─────────────────────────  Helper: normaliseSpecialty  ─────────────────── */
/**
 * Converts a user-typed profession (e.g. "cardiologist", "receptionist")
 * to the wording that is actually stored in MongoDB.
 */
function normaliseSpecialty(raw: string): string {
  const ALIAS_MAP: Record<string, string> = {
    cardiologist:  "Cardiology",
    neurologist:   "Neurology", 
    dermatologist: "Dermatology",
    surgeon:       "Surgery",
    
    /* non-veterinarian roles */
    receptionist:  "Clinic Receptionist",
    secretary:     "Clinic Receptionist", 
    "vet assistant": "Veterinary Assistant",
    "veterinary assistant": "Veterinary Assistant",
    nurse:         "Veterinary Assistant"
  };

  const lower = raw.trim().toLowerCase();
  if (ALIAS_MAP[lower]) return ALIAS_MAP[lower];

  /* "…ologist" → "…ology"  (neurologist → neurology) */
  if (lower.endsWith("ologist")) {
    const base = lower.slice(0, -7); // remove "ologist"
    return `${base.charAt(0).toUpperCase()}${base.slice(1)}ology`;
  }

  /* "…ist" → "…y"  (therapist → therapy) */
  if (lower.endsWith("ist")) {
    const base = lower.slice(0, -3); // remove "ist"
    return `${base.charAt(0).toUpperCase()}${base.slice(1)}y`;
  }

  /* default: Title-case the cleaned string */
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/* ─────────────────────────── 2. Gemini helper ───────────────────────────── */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();

/** Minimal wrapper around Gemini Flash with 503 retry. */
async function askGemini(prompt: string, retries = 3): Promise<string> {
  // Check if API key is configured
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured');
    return "I'm sorry, but I'm currently unavailable. Please try the main menu options or contact support.";
  }

  const system = `You are Kayo, the friendly assistant for FurEver Friends.`
               + ` Answer briefly and warmly.\nUser: "${prompt}"`;
  try {
    const { data } = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: system }] }] },
      { timeout: 10000 } // 10 second timeout for Vercel
    );
    return data.candidates?.[0]?.content?.parts?.[0]?.text
        ?? "Sorry, I didn't understand.";
  } catch (err: any) {
    console.error('Gemini API error:', err.response?.data || err.message);
    if (retries && err.response?.status === 503) return askGemini(prompt, retries - 1);
    return "I'm having trouble connecting to my knowledge base. Please try the menu options or contact support.";
  }
}

/* ─────────────────────────── 3. Main-menu helpers ───────────────────────── */

const MENU = [
  { label: "Book appointment",   display: "Book appointment" },
  { label: "Cancel appointment", display: "Cancel appointment" },
  { label: "Show history",       display: "Show history" },
  { label: "Show clinic hours",  display: "Show clinic hours" },
  { label: "Show contact details", display: "Show contact details" },
  { label: "Emergency",          display: "Book emergency appointment" }, 
];

const numberedMenu = () =>
  "🐶 Hello, I am Kayo, your virtual assistant!\n\n" + 
  "Please choose an option by typing the corresponding number:\n" +
  MENU.map((o, i) => `${i + 1}. ${o.display}`).join("\n") +
  "\n\nTo exit, type 'exit'.\nAt any stage, type 'menu' to return to the main menu.\nFor any other question, just ask.";



/** In-memory per-user wizard state. */
const sessions = new Map<string, any>();

/* ─────────────────────────── 4. Lightweight JWT parse ───────────────────── */

async function parseJwt(req: Request, res: Response): Promise<string | undefined> {
  if (!req.headers.authorization?.startsWith("Bearer")) return undefined;
  await new Promise<void>((resolve) =>
    authMiddleware(req as AuthRequest, res, () => resolve())
  );
  return (req as AuthRequest).user?.userId;
}

/* ─────────────────────────── 5. Router handler ──────────────────────────── */

router.post("/", async (req, res) => {
  try {
    /* 5.1  Basic message retrieval */
    let text = String(req.body?.message ?? "").trim();
    if (!text) return res.json({ reply: numberedMenu(), menu: [] });

    /* 5.2  Identify user (optional) + current session */
    const uid = await parseJwt(req, res);
    const s   = uid ? sessions.get(uid) : undefined;

  /* 5.3  Global commands – valid at ANY point */
  const lower = text.toLowerCase();
  if (["menu", "main menu"].includes(lower)) {
    if (uid) sessions.delete(uid);
    return res.json({ reply: numberedMenu(), menu: [] });
  }
  if (lower === "exit") {
    if (uid) sessions.delete(uid);
    return res.json({ reply: "You have exited the menu. Type a number to begin.", menu: [] });
  }
  if (["help", "support", "assistance"].some((kw) => lower.includes(kw)))
    return res.json({ reply: numberedMenu(), menu: [] });

  /* ─────────────────────── 6. ACTIVE WIZARDS  ─────────────────────────── */

  /* ===== HISTORY WIZARD – Step choosePet ===== */
  if (s?.step === "choosePetForHistory") {
    const idx  = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
    const pets = s.pets as IPet[];
    if (idx < 0 || idx >= pets.length)
      return res.json({ reply: "Invalid number. Try again:", menu: [] });

    const pet  = pets[idx];
    const past = (await getAppointmentHistoryByPet(String(pet._id)))
                   .filter((a) => a.date < new Date());
    if (!past.length) {
      sessions.delete(uid!);
      return res.json({ reply: `No past appointments for ${pet.name}.`, menu: [] });
    }

    sessions.set(uid!, { step: "chooseAppointmentForDetails", appointments: past, pet });
    return res.json({
      reply:
        `Recent appointments for ${pet.name}:\n` +
        past
          .slice(0, 5)
          .map((a, i) => `${i + 1}. ${fmtDate(a.date)}: ${a.type} (${a.status})`)
          .join("\n") +
        "\n(Type the number for details)",
      menu: [],
    });
  }

  /* ===== HISTORY WIZARD – Step chooseAppointment ===== */
  if (s?.step === "chooseAppointmentForDetails") {
    const idx = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
    const { appointments, pet } = s as {
      appointments: Awaited<ReturnType<typeof getAppointmentHistoryByPet>>;
      pet: IPet;
    };
    if (idx < 0 || idx >= appointments.length)
      return res.json({ reply: "Invalid number. Try again:", menu: [] });

    const appt = appointments[idx];
    const vet  = await Staff.findById(appt.staffId);
    sessions.delete(uid!);

    return res.json({
      reply:
        `Appointment details for ${pet.name}:\n` +
        `Treating Vet: ${vet ? `${vet.firstName} ${vet.lastName}` : "Unknown"}\n` +
        `Visit Type:   ${appt.type}\n` +
        `Cost:        $${appt.cost ?? "-"}\n` +
        `Date:         ${fmtDate(appt.date)}\n` +
        `Description:  ${appt.description || "-"}\n` +
        `Notes:        ${appt.notes || "-"}`,
      menu: [],
    });
  }

  /* ─────────────────── 7. MAP MAIN-MENU NUMBERS (1-6) ──────────────────── */
  if (!s) {
    const n = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
    if (n >= 0 && n < MENU.length) text = MENU[n].label;
  }

  /* ────────────────── 8. One-shot informational commands ───────────────── */
  if (text === "Show clinic hours")
    return res.json({ reply: "Opening hours:\nSun-Thu 08:00–20:00\nFriday 08:00–13:00\nSaturday Closed", menu: [] });

  if (text === "Show contact details")
    return res.json({
      reply:
        "FurEver Friends – 51 Snunit St, Karmiel 🇮🇱\n" +
        "Phone: +972 4-123-4567\n" +
        "Email: info@fureverfriends.com"+ MENU_HINT,
      menu: [],
    });



  /* ────────────────────── 9. HISTORY ENTRY POINT ───────────────────────── */
  if (text === "Show history") {
    if (!uid) return res.json({ reply: "Please log in to view history.", menu: [] });

    const user = await User.findById(uid).populate<{ pets: IPet[] }>("pets");
    const pets = (user?.pets ?? []).filter(isPet).filter(pet => pet.isActive);
    if (!pets.length) return res.json({ reply: "You have no registered pets.", menu: [] });

    /* Single pet → skip choosePet step. */
    if (pets.length === 1) {
      const pet  = pets[0];
      const past = (await getAppointmentHistoryByPet(String(pet._id)))
                     .filter((a) => a.date < new Date());
      if (!past.length)
        return res.json({ reply: `No past appointments for ${pet.name}.`, menu: [] });

      sessions.set(uid, { step: "chooseAppointmentForDetails", appointments: past, pet });
      return res.json({
        reply:
          `Recent appointments for ${pet.name}:\n` +
          past
            .slice(0, 5)
            .map((a, i) => `${i + 1}. ${fmtDate(a.date)}: ${a.type} (${a.status})`)
            .join("\n") +
          "\n(Type the number for details)",
        menu: [],
      });
    }

    /* Multiple pets → ask user. */
    sessions.set(uid, { step: "choosePetForHistory", pets });
    return res.json({
      reply:
        "Which pet's history would you like?\n" +
        pets.map((p, i) => `${i + 1}. ${p.name}`).join("\n") +
        "\n(Type the number)",
      menu: [],
    });
  }

  /* ───────────────── 10. BOOK & CANCEL WIZARDS (FULL CODE) ─────────────── */

  /* ==========================  BOOK WIZARD  ========================== */
  if (text === "Book appointment") {
    if (!uid) return res.json({ reply: "Please log in to book an appointment.", menu: [] });

    const user = await User.findById(uid).populate<{ pets: IPet[] }>("pets");
    const pets = (user?.pets ?? []).filter(isPet).filter(pet => pet.isActive);
    if (!pets.length) return res.json({ reply: "You have no registered pets."+ MENU_HINT, menu: [] });

    /* one pet → skip choosePet */
    if (pets.length === 1) {
      const [pet] = pets;
      sessions.set(uid, { step: "chooseDate", petId: pet._id, petName: pet.name, pets });
      return res.json({
        reply: `Pet selected (${pet.name}). Enter a date (MM/DD or YYYY-MM-DD):`,
        menu: [],
      });
    }

    /* multiple pets */
    sessions.set(uid, { step: "choosePet", pets });
    return res.json({
      reply: "Choose a pet:\n" +
             pets.map((p, i) => `${i + 1}. ${p.name}`).join("\n") +
             "\n(Type the number)",
      menu: [],
    });
  }

  /* choosePet → chooseDate */
  if (s?.step === "choosePet") {
    const idx = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
    const pets: IPet[] = s.pets;
    if (idx < 0 || idx >= pets.length)
      return res.json({ reply: "Invalid number. Try again:", menu: [] });

    const pet = pets[idx];
    sessions.set(uid!, { step: "chooseDate", petId: pet._id, petName: pet.name, pets });
    return res.json({
      reply: `Great! You selected ${pet.name}. Please enter a date (MM/DD or YYYY-MM-DD):`,
      menu: [],
    });
  }

  /* chooseDate → chooseTime */
  if (s?.step === "chooseDate") {
    const pickedDate = parseUserDate(text);

  if (!pickedDate) {
    return res.json({
      reply: "Date format not recognised. Try MM/DD, DD/MM, or YYYY-MM-DD:",
      menu: [],
    });
  }
   const today = new Date();                     // now
  today.setHours(0, 0, 0, 0);                   // strip time
  if (pickedDate < today) {
    return res.json({
      reply: "Please choose a date from today onwards (no past dates).",
      menu: [],
    });
  }
    const taken = await getTakenTimesForDay(pickedDate);
    const all   = Array.from({ length: 24 }, (_, i) => {
      const hr = 8 + Math.floor(i / 2);         // 08-19
      const mn = i % 2 ? "30" : "00";
      const hh = hr % 12 === 0 ? 12 : hr % 12;
      const am = hr < 12 ? "AM" : "PM";
      return `${String(hh).padStart(2, "0")}:${mn} ${am}`;
    });
    const free = all.filter((t) => !taken.includes(t));
    if (!free.length)
      return res.json({ reply: "No available times that day. Choose another date:", menu: [] });

    sessions.set(uid!, { ...s, step: "chooseTime", date: pickedDate, freeSlots: free });
    return res.json({
      reply:
        `Available times on ${fmtDate(pickedDate)}:\n` +
        free.map((t, i) => `${i + 1}. ${t}`).join("\n") +
        "\n(Type the number)",
      menu: [],
    });
  }

  /* chooseTime → chooseVet */
  if (s?.step === "chooseTime") {
    const idx = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
    const { freeSlots, date, petId, petName, pets } = s;
    if (idx < 0 || idx >= freeSlots.length)
      return res.json({ reply: "Invalid number. Try again:", menu: [] });

    const time = freeSlots[idx];
    const vets = await getActiveVets();
    if (!vets.length) return res.json({ reply: "No veterinarians available."+ MENU_HINT, menu: [] });

    sessions.set(uid!, { step: "chooseVet", date, time, petId, petName, vets, pets });
    return res.json({
      reply:
        "Choose a veterinarian:\n" +
        vets.map((v: any, i: number) => `${i + 1}. ${v.firstName} ${v.lastName}`).join("\n") +
        "\n(Type the number)",
      menu: [],
    });
  }

  /* chooseVet → chooseReason */
  if (s?.step === "chooseVet") {
    const idx = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
    const { vets } = s;
    if (idx < 0 || idx >= vets.length)
      return res.json({ reply: "Invalid number. Try again:", menu: [] });

    const vet = vets[idx];
    sessions.set(uid!, { ...s, step: "chooseReason", vetId: vet._id });
    return res.json({ reply: "Briefly describe the reason for the visit:", menu: [] });
  }

  /* chooseReason → confirmBooking */
  if (s?.step === "chooseReason") {
    const reason = text.trim();
    if (!reason) return res.json({ reply: "Please enter a reason:", menu: [] });

    sessions.set(uid!, { ...s, step: "confirmBooking", description: reason });
    const { petName, date, time } = s;
    return res.json({
      reply:
        `You are about to book an appointment for ${petName} on ${fmtDate(date)} at ${time}.\n` +
        `Reason: ${reason}\nType 'accept' to confirm or 'exit' to cancel.`,
      menu: [],
    });
  }

  /* confirmBooking → create appointment */
  if (s?.step === "confirmBooking") {
    if (lower === "accept") {
      const { petId, vetId, date, time, description } = s;
      await createAppointment(uid!, petId, vetId, date, time, "wellness_exam", description);
      sessions.delete(uid!);
      return res.json({ reply: "✅ Appointment booked.", menu: [] });
    }
    if (lower === "exit") {
      sessions.delete(uid!);
      return res.json({ reply: "Booking process aborted."+ MENU_HINT, menu: [] });
    }
    return res.json({ reply: "Type 'accept' to confirm or 'exit' to cancel.", menu: [] });
  }
  /* ======================= EMERGENCY APPOINTMENT WIZARD ======================= */
/**
 * Step 1: Entry point – user selects "Emergency" from the menu.
 * Step 2: Choose pet (if multiple).
 * Step 3: Enter reason/description.
 * Step 4: Confirm the emergency appointment (cost $1000).
 * Step 5: Call backend /api/appointments/emergency and show result.
 */

if (text === "Emergency") {
  if (!uid) return res.json({ reply: "Please log in to book an emergency appointment.", menu: [] });

  const user = await User.findById(uid).populate<{ pets: IPet[] }>("pets");
  const pets = (user?.pets ?? []).filter(isPet).filter(pet => pet.isActive);
  if (!pets.length) return res.json({ reply: "You have no registered pets.", menu: [] });

  // One pet – skip selection
  if (pets.length === 1) {
    const [pet] = pets;
    sessions.set(uid, { step: "emergencyReason", petId: pet._id, petName: pet.name });
    return res.json({
      reply: `Pet selected (${pet.name}). Please describe the emergency:`,
      menu: [],
    });
  }
  // Multiple pets – ask user
  sessions.set(uid, { step: "emergencyChoosePet", pets });
  return res.json({
    reply:
      "Which pet is having an emergency?\n" +
      pets.map((p, i) => `${i + 1}. ${p.name}`).join("\n") +
      "\n(Type the number)",
    menu: [],
  });
}

// Step 2: User selects pet for emergency
if (s?.step === "emergencyChoosePet") {
  const idx = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
  const pets: IPet[] = s.pets;
  if (idx < 0 || idx >= pets.length)
    return res.json({ reply: "Invalid number. Try again:", menu: [] });

  const pet = pets[idx];
  sessions.set(uid!, { step: "emergencyReason", petId: pet._id, petName: pet.name });
  return res.json({
    reply: `Pet selected (${pet.name}). Please describe the emergency:`,
    menu: [],
  });
}

// Step 3: User enters reason/description for emergency
if (s?.step === "emergencyReason") {
  const reason = text.trim();
  if (!reason)
    return res.json({ reply: "Please describe the emergency:", menu: [] });

  // Save description and move to confirmation step
  sessions.set(uid!, { ...s, step: "emergencyConfirm", description: reason });
  return res.json({
    reply:
      `You are about to book an EMERGENCY appointment for ${s.petName}.\n` +
      `Reason: ${reason}\n` +
      "‼️ Cost: $1000\n" +
      "Type 'accept' to confirm or 'exit' to cancel.",
    menu: [],
  });
}

// Step 4: User confirms or cancels emergency
if (s?.step === "emergencyConfirm") {
  if (lower === "accept") {
    try {
      // Call the emergency backend API (as in your app)
      const axiosRes = await axios.post(
        `${process.env.SERVER_URL || "http://localhost:3000"}/api/appointments/emergency`,
        {
          userId: uid,
          petId: s.petId,
          description: s.description,
        }
      );
      sessions.delete(uid!);
      return res.json({
        reply:
          "✅ Emergency appointment booked! " +
          `Vet: ${axiosRes.data.vet.firstName} ${axiosRes.data.vet.lastName}\n` +
          "You will be contacted soon."+ MENU_HINT,
        menu: [],
      });
    } catch (err: any) {
      sessions.delete(uid!);
      const msg =
        err?.response?.data?.error ||
        "Failed to book emergency appointment. Please try again.";
      return res.json({ reply: msg, menu: [] });
    }
  }
  if (lower === "exit") {
    sessions.delete(uid!);
    return res.json({ reply: "Emergency appointment cancelled.", menu: [] });
  }
  return res.json({ reply: "Type 'accept' to confirm or 'exit' to cancel.", menu: [] });
}

  /* ======================== CANCEL WIZARD ========================= */

  /* entry-point */
  if (text === "Cancel appointment") {
    if (!uid) return res.json({ reply: "Please log in first.", menu: [] });

    const upcoming = await getFutureAppointments(uid);
    if (!upcoming.length)
      return res.json({ reply: "You have no upcoming appointments to cancel.", menu: [] });

    sessions.set(uid, { step: "chooseAppointmentToCancel", appts: upcoming });
    return res.json({
      reply:
        "Which appointment would you like to cancel?\n" +
        upcoming
          .map((a, i) => `${i + 1}. ${fmtDate(a.date)} at ${a.time}`)
          .join("\n") +
        "\n(Type the number)",
      menu: [],
    });
  }

  /* chooseAppointmentToCancel → confirmCancelAppointment */
  if (s?.step === "chooseAppointmentToCancel") {
    const idx = Number.isNaN(+text) ? -1 : parseInt(text) - 1;
    const { appts } = s;
    if (idx < 0 || idx >= appts.length)
      return res.json({ reply: "Invalid number. Try again:", menu: [] });

    const appt = appts[idx];
    sessions.set(uid!, { step: "confirmCancelAppointment", selectedAppt: appt });
    return res.json({
      reply:
        `You chose to cancel the appointment on ${fmtDate(appt.date)} at ${appt.time}.\n` +
        "Type 'accept' to confirm or 'exit' to abort.",
      menu: [],
    });
  }

  /* confirmCancelAppointment → update DB */
  if (s?.step === "confirmCancelAppointment") {
    if (lower === "accept") {
      const ok = await cancelAppointment(uid!, s.selectedAppt._id);
      sessions.delete(uid!);
      return res.json({ reply: ok ? "Appointment cancelled." + MENU_HINT : "Could not cancel.", menu: [] });
    }
    if (lower === "exit") {
      sessions.delete(uid!);
      return res.json({ reply: "Cancellation aborted.", menu: [] });
    }
    return res.json({ reply: "Type 'accept' to confirm or 'exit' to abort.", menu: [] });
  }
  /* ──────────────────────── 8b. Doctor Information Handler ────────────────────────
   Answers questions like "Who is Dr Smith?" or "Tell me about Dr Cohen".
   This uses the staff/search API to retrieve real-time doctor info from the DB.
   Only English names (A-Z) are supported for now.
------------------------------------------------------------------------------- */

const doctorRegex = /^(?:who\s+is|tell\s+me\s+about)\s+dr\.?\s+([a-z\s-]+)\??$/i;
const match = doctorRegex.exec(text);
if (match) {
  const name = match[1].trim();
  try {
    // Query the staff search endpoint
    const response = await axios.get(
      `${process.env.SERVER_URL || "http://localhost:3000"}/api/staff/search`,
      { params: { name } }
    );

    const doc = response.data;
    // In the bot response formatting:
    let reply =
      `👩‍⚕️ **Dr. ${doc.firstName} ${doc.lastName}**\n` +
      (doc.specialization && doc.specialization !== '-' && doc.specialization !== '0'
        ? `• Specialty: ${doc.specialization}\n`
        : (doc.role ? `• Role: ${doc.role}\n` : '')) +
      `• Experience: ${doc.yearsOfExperience} years\n` +
      (doc.description ? `• About: ${doc.description}\n` : "") +
      (doc.availableSlots && doc.availableSlots.length
        ? `• Usual hours: ${doc.availableSlots.join(", ")}`
        : "");


    return res.json({ reply, menu: [] });
  } catch (err) {
    // Doctor not found or error from the API
    return res.json({
      reply: `Sorry, I couldn't find a doctor named ${name}.`,
      menu: []
    });
  }
}
//* ───────────────── 8c. Specialty / Role Information Handler ─────────────── */
/**
 * Matches:
 *  • "Who is the cardiologist?"
 *  • "Which doctor is the surgeon?"
 *  • "Who is the receptionist?"
 *  • "who is the veterinary assistant"
 *  • "Who is the neurologist?"
 */
const specialtyRegex =
  /^(?:who\s+is\s+(?:the\s+)?|which\s+doctor\s+is\s+(?:the\s+)?)([a-z\s-]+)\??$/i;

const specMatch = specialtyRegex.exec(lower);

if (specMatch) {
  const phrase = (specMatch[1] || "").trim();
  if (!phrase) {
    return res.json({ reply: "I need a specialty or role to search for.", menu: [] });
  }

  // ** הנה התיקון החשוב: נרמל את המילה לפני החיפוש **
  const normalizedPhrase = normaliseSpecialty(phrase);
  
  console.log(`Original phrase: "${phrase}" -> Normalized: "${normalizedPhrase}"`); // לצרכי debug
  
  try {
    const { data: staffList } = await axios.get(
      `${process.env.SERVER_URL || "http://localhost:3000"}/api/staff/search/specialty`,
      { params: { specialization: normalizedPhrase } }
    );

    if (!staffList || staffList.length === 0) {
      return res.json({
        reply: `Sorry, there is currently no doctor with the specialty: ${phrase}.`,
        menu: []
      });
    }

    /* Friendly titles */
    const titles: Record<string, string> = {
      "Clinic Receptionist": "Clinic Receptionist",
      "Veterinary Assistant": "Veterinary Assistant", 
      "Surgery": "Surgeon",
    };

    const reply = staffList.map((doc: any) => {
      const isVet = /veterinarian/i.test(doc.role) || (doc.specialization && doc.specialization !== '-' && doc.specialization !== '0');
      const icon  = isVet ? "👩‍⚕️" : "💼";
      const title = isVet ? "Dr. " : "";

      /* Prefer specialisation; else role */
      const mainField = doc.specialization && doc.specialization.trim() && doc.specialization !== '-' && doc.specialization !== '0'
        ? `• Specialty: ${doc.specialization}\n`
        : `• Role: ${titles[doc.role] || doc.role}\n`;

      return (
        `${icon} **${title}${doc.firstName} ${doc.lastName}**\n` +
        mainField +
        (doc.yearsOfExperience ? `• Experience: ${doc.yearsOfExperience} years\n` : "") +
        (doc.description ? `• About: ${doc.description}\n` : "") +
        (doc.availableSlots?.length ? `• Usual hours: ${doc.availableSlots.join(", ")}` : "")
      );
    }).join("\n\n");

    return res.json({ reply, menu: [] });
  } catch (err: unknown) {
    console.error("Specialty lookup error:", err);
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return res.json({
        reply: `Sorry, there is currently no doctor with the specialty: ${phrase}.`,
        menu: []
      });
    }
    return res.json({
      reply: "There was a technical problem searching for the doctor by specialty.",
      menu: []
    });
  }
}

  /* ───────────────────────── 11. GEMINI FALLBACK ───────────────────────── */
  const ai = await askGemini(text);
  return res.json({ reply: ai, menu: [] });
  
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ 
      reply: "I'm experiencing technical difficulties. Please try again or contact support.",
      menu: [] 
    });
  }
});

export default router;
