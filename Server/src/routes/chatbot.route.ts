import express from "express";
import axios from "axios";
import { authMiddleware, AuthRequest } from "../services/authMiddleware";
import {
  createAppointment,
  cancelAppointment,
  getFutureAppointments,
} from "../services/appointmentService";
import { getPetHistory } from "../services/treatmentService";

const router = express.Router();

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();

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

/**
 * Chatbot main endpoint.
 * Supports both guests and logged-in users (JWT optional).
 * Some actions (appointments/history) require authentication; others don't.
 */
router.post("/", async (req, res, next) => {
  // Parse menu numbers
  let { message, petId, date, time, type, description } = req.body;
  let normalizedMessage = message;
  const idx = parseInt(message, 10) - 1;
  if (!isNaN(idx) && idx >= 0 && idx < NUMBERED_MENU.length) {
    normalizedMessage = NUMBERED_MENU[idx].label;
    
  }
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
    menu: MAIN_MENU,
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
        menu: MAIN_MENU,
      });
    }

    // Book appointment – step 1
    if (normalizedMessage === "Book appointment") {
      return res.json({
        reply:
          "To book an appointment please provide:\n" +
          "1. Pet ID\n2. Date (YYYY-MM-DD)\n3. Time (e.g. 10:30 AM)\n4. Type (e.g. vaccination)",
        menu: [],
      });
    }

    // Book now – final step
    if (normalizedMessage === "Book now" && petId && date && time && type) {
      await createAppointment(
        userId,
        petId,
        "",
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

    // Cancel appointment
    if (normalizedMessage === "Cancel appointment") {
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

    // Cancel by ID
    if (normalizedMessage.startsWith("Cancel ")) {
      const id = normalizedMessage.replace("Cancel ", "");
      const ok = await cancelAppointment(userId, id);
      return res.json({
        reply: ok
          ? "Appointment cancelled."
          : "Could not cancel (check the ID).",
        menu: MAIN_MENU,
      });
    }

    // Show pet history
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
  }

  // ================== Actions open for all ==================
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

  // ================== Fallback to Gemini AI ==================
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
