// Server/src/routes/chatbot.route.ts

/**
 * Chatbot API Route
 * Receives user messages from the client and returns a reply.
 * Supports both menu-based actions and smart AI answers via Gemini API.
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

const GEMINI_API_URL ="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();



/**
 * POST /
 * Handles chatbot messages.
 * If the message matches a menu action, responds with a predefined answer.
 * Otherwise, forwards the message to Gemini API for a smart AI reply.
 */
router.post('/', async (req, res) => {
  const { message } = req.body;

  // Handle a predefined menu action
  if (message === "Book appointment") {
    return res.json({
      reply: "Sure! Please provide date and time.",
      menu: ["Show history", "Main menu"]
    });
  }

  // Forward other messages to Gemini API for smart AI reply
  try {
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      }
    );
    const aiReply = geminiRes.data.candidates[0]?.content?.parts[0]?.text ?? "Sorry, I didn't understand.";
    res.json({
      reply: aiReply,
      menu: ["Book appointment", "Show history", "Main menu"]
    });
  } catch (err: any) {
    console.error("Gemini API error:", err.response?.data || err.message || err);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

export default router;
