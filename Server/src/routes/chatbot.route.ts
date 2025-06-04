/**
 * Chat-bot API – routes/chatbot.route.ts
 * -------------------------------------
 * Handles conversational requests from the front-end.
 *
 *  Flow:
 *   1. Detect simple menu commands (book / cancel / history / info).
 *   2. If none match, forward the prompt to Google Gemini.
 *      • Auto-retry up to 3× on HTTP 503 (model overloaded).
 *   3. Always respond   { reply: string, menu: string[] }
 */

import express from "express";
import axios from "axios";

import {
  createAppointment,
  cancelAppointment,
  getFutureAppointments,
} from "../services/appointmentService";

import { getPetHistory } from "../services/treatmentService";

const router = express.Router();

/* --- Gemini configuration --------------------------------------------- */
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();

/** Main quick-reply menu presented to the user */
const MAIN_MENU = [
  "Book appointment",
  "Cancel appointment",
  "Show history",
  "Show clinic hours",
  "Show contact details",
  "Emergency",
];
const NUMBERED_MENU = [
  { label: "Book appointment", display: "Book appointment" },
  { label: "Cancel appointment", display: "Cancel appointment" },
  { label: "Show history", display: "Show history" },
  { label: "Show clinic hours", display: "Show clinic hours" },
  { label: "Show contact details", display: "Show contact details" },
  { label: "Emergency", display: "Emergency" },
];

/* ---------------------------------------------------------------------- */
/* Helper: call Gemini with up-to-3 retries on 503 (“model overloaded”)   */
/* ---------------------------------------------------------------------- */
async function callGemini(prompt: string, retries = 3): Promise<string> {
  try {
    const { data } = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt + "\n\nPlease answer briefly and clearly, in up to 3 sentences." }] }] }
    );
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I didn't understand."
    );
  } catch (err: any) {
    /* Retry ONLY on 503 - everything else bubbles up */
    if (retries > 0 && err.response?.status === 503) {
      await new Promise((r) => setTimeout(r, 1000)); // wait 1 s
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



/* ====================================================================== */
/*  POST /api/chatbot  – single endpoint for all chat requests            */
/* ====================================================================== */
router.post("/", async (req, res) => {
  const {
    message,
    userId,
    petId,
    date,
    time,
    type,
    description,
  } = req.body;
  let normalizedMessage = message;
const idx = parseInt(message, 10) - 1;
if (!isNaN(idx) && idx >= 0 && idx < NUMBERED_MENU.length) {
  normalizedMessage = NUMBERED_MENU[idx].label;
}

// Exit command
if (normalizedMessage.toLowerCase() === "exit") {
  return res.json({
    reply: "You have exited the menu. To start over, type 'menu'.",
    menu: [],
  });
}

  /* ------------------------------------------------------------------ */
  /* 1.  Book appointment – initial step                                */
  /* ------------------------------------------------------------------ */
  if (normalizedMessage === "Book appointment") {
    if (!userId) {
      return res.json({
        reply: "Please log in to book an appointment.",
        menu: MAIN_MENU,
      });
    }
    return res.json({
      reply:
        "To book an appointment please provide:\n" +
        "1. Pet ID\n2. Date (YYYY-MM-DD)\n3. Time (e.g. 10:30 AM)\n4. Type (e.g. vaccination)",
      menu: [],
    });
  }

  /* 1b.  Book appointment – final step (all details supplied) */
  if (normalizedMessage=== "Book now" && userId && petId && date && time && type) {
    await createAppointment(
      userId,
      petId,
      "", // staffId not chosen yet → pass empty string
      date,
      time,
      type,
      description || ""
    );
    return res.json({
      reply: `Appointment booked for ${date} at ${time}.`,
      menu: MAIN_MENU,
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2.  Cancel appointment                                             */
  /* ------------------------------------------------------------------ */
  if (normalizedMessage === "Cancel appointment" && userId) {
    const appts = await getFutureAppointments(userId);

    if (!appts.length) {
      return res.json({
        reply: "You have no upcoming appointments to cancel.",
        menu: MAIN_MENU,
      });
    }
    const menu = appts.map(
      (a) => `${a._id} – ${a.date.toISOString().slice(0, 10)} ${a.time}`
    );
    return res.json({
      reply: "Which appointment do you want to cancel? Reply with the ID.",
      menu,
    });
  }

  /* 2b.  Cancel by ID */
  if (normalizedMessage.startsWith("Cancel ") && userId) {
    const id = normalizedMessage.replace("Cancel ", "");
    const ok = await cancelAppointment(userId, id);
    return res.json({
      reply: ok
        ? "Appointment cancelled."
        : "Could not cancel (check the ID).",
      menu: MAIN_MENU,
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3.  Show pet history                                               */
  /* ------------------------------------------------------------------ */
  if (normalizedMessage === "Show history") {
    if (!petId) {
      return res.json({
        reply: "Please provide your Pet ID.",
        menu: MAIN_MENU,
      });
    }
    const treatments = await getPetHistory(petId);
    if (!treatments.length) {
      return res.json({
        reply: "No treatment history found for this pet.",
        menu: MAIN_MENU,
      });
    }
    return res.json({
      reply: treatments
        .slice(0, 3)
        .map(
          (t) =>
            `${t.visitDate.toISOString().slice(0, 10)}: ` +
            `${t.treatmentType} – ${t.notes}`
        )
        .join("\n"),
      menu: MAIN_MENU,
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4.  Static answers (hours / contact / emergency)                   */
  /* ------------------------------------------------------------------ */
  if (normalizedMessage === "Show clinic hours") {
    return res.json({
      reply:
        "Opening hours:\n" +
        "Sun-Thu 08:00–20:00\n" +
        "Friday 08:00–13:00\n" +
        "Saturday Closed",
      menu: MAIN_MENU,
    });
  }

  if (normalizedMessage === "Show contact details") {
    return res.json({
      reply:
        "FurEver Friends – 51 Snonit St, Karmiel 🇮🇱\n" +
        "Phone: +972 4-123-4567\n" +
        "Email: info@fureverfriends.com",
      menu: MAIN_MENU,
    });
  }

  if (normalizedMessage === "Emergency") {
    return res.json({
      reply: "🚑  For emergencies call +972 4-123-4567 immediately!",
      menu: MAIN_MENU,
    });
  }

 if (normalizedMessage === "Main menu" || normalizedMessage === "menu") {
  return res.json({ reply: getNumberedMenuText(), menu: [] });
}


  /* ------------------------------------------------------------------ */
  /* 5.  Fallback → Gemini                                              */
  /* ------------------------------------------------------------------ */
  try {
    const aiReply = await callGemini(normalizedMessage);
    res.json({ reply: aiReply, menu: MAIN_MENU });
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
