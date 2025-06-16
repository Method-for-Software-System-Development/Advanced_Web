/**
 * ChatWindow – floating panel that shows the conversation.
 * Props:
 *   open     – whether the window is visible
 *   onClose  – callback when the user clicks ✕
 *
 * State:
 *   messages    – array of { id, role, text }
 *   input       – current user input
 *   menuOptions – array of quick reply options for the current step
 *   isTyping    – whether "Kayo is typing..." is shown
 */

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import MessageBubble, { MessageBubbleProps } from "./MessageBubble";
import { API_URL } from "../../config/api";

export interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
}

// Helper: Send a chat message to the backend API (adds JWT + auto-retry on 401)
async function sendChatMessage(message: string, _retry = false): Promise<{ reply: string; menu: string[] }> {
  /* build headers */
  const token = sessionStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/chatbot`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message }),
  });

  /* ---------- success ---------- */
  if (res.ok) return res.json();

  /* ---------- 401 → remove token & retry once without it ---------- */
  if (res.status === 401 && ! _retry) {
    sessionStorage.removeItem("token");
    return sendChatMessage(message, true);          // second call – no token
  }

  /* ---------- other errors ---------- */
  let serverMsg = "Server error.";
  try {
    const err = await res.json();
    if (err.error) serverMsg = err.error;
  } catch { /* ignore */ }

  return { reply: `Sorry, I'm having trouble: ${serverMsg}`, menu: [] };
}


const ChatWindow: React.FC<ChatWindowProps> = ({ open, onClose }) => {
  // Chat state
  const [messages, setMessages] = useState<MessageBubbleProps[]>([]);
  const [input, setInput] = useState("");
  const [menuOptions, setMenuOptions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  /** Always scroll to bottom when messages update */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /**
   * When chat window opens, request the main menu from the server.
   * The server will reply with the full numbered menu and options.
   */
  useEffect(() => {
    if (open) {
      sendChatMessage("menu").then(resp => {
        setMessages([{ role: "bot", text: resp.reply }]);
        setMenuOptions(resp.menu || []);
      });
    }
  }, [open]);

  /**
   * Handles sending a message (either from input or from a quick-reply).
   * Adds the user message, shows "Kayo is typing...", waits for server,
   * then shows the bot's reply and updates quick-replies.
   */
  const handleSend = async (msg?: string) => {
    const text = msg ?? input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    try {
      const resp = await sendChatMessage(text);
      setMessages((prev) => [...prev, { role: "bot", text: resp.reply }]);
      setMenuOptions(resp.menu || []);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Server error!" },
      ]);
    }
    setIsTyping(false);
  };

  // Hide window if not open
  if (!open) return null;

  return (
    <div
      className="
        fixed
        bottom-24 right-6 w-96 h-[500px]
        bg-white dark:bg-darkMode
        rounded-xl shadow-xl flex flex-col z-50
        animate-fade-in dark:border-2 dark:border-white

        max-sm:left-1/2 max-sm:-translate-x-1/2
        max-sm:right-auto
        max-sm:w-[90vw]
        max-sm:h-[70vh]
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-[#664147] font-[Nunito] text-white px-4 py-2 rounded-t-xl">
        <span className="font-semibold">Virtual Assistant</span>
        <button aria-label="Close chat" onClick={onClose} className="cursor-pointer">
          <X size={20} />
        </button>
      </div>

      {/* Messages & "Kayo is typing..." */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2 flex flex-col">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} {...m} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-[#664147] font-semibold animate-pulse mt-2">
            <span role="img" aria-label="dog">🐶</span>
            Kayo is typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-[#3B3B3B]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 min-w-0 px-4 py-3 text-sm border border-[#3B3B3B] text-[#3B3B3B] rounded-l-md
                       focus:outline-none dark:text-white"
            disabled={isTyping}
          />
          <button
            type="submit"
            className="bg-[#664147] hover:bg-[#58383E] cursor-pointer text-white px-6 rounded-r-md"
            disabled={isTyping}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
