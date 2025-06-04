import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import MessageBubble, { MessageBubbleProps } from "./MessageBubble";

export interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
}

// Helper: Send a chat message to the backend API (adds JWT token + userId from localStorage)
async function sendChatMessage(message: string) {
  // Get the JWT token and user data from localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("client") || "{}");
  const userId = user._id;

  // Send both userId in the body and the token in the Authorization header
  const res = await fetch('http://localhost:3000/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Adds token if exists
    },
    body: JSON.stringify({ message, userId }),
  });
  return await res.json(); // { reply, menu }
}


// Function: Menu text for the bot's initial message
const getNumberedMenuText = () => (
  "Hi, welcome to FurEver Friends – Pet Clinic!\n\n" +
  "Please choose an option by typing the corresponding number:\n" +
  "1. Book appointment\n" +
  "2. Cancel appointment\n" +
  "3. Show history\n" +
  "4. Show clinic hours\n" +
  "5. Show contact details\n" +
  "6. Emergency\n\n" +
  "To exit, type 'exit'.\n" +
  "For any other question, just ask."
);


const ChatWindow: React.FC<ChatWindowProps> = ({ open, onClose }) => {
  // Chat state
  const [messages, setMessages] = useState<MessageBubbleProps[]>([
    { role: "bot", text: getNumberedMenuText() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Always scroll to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Handles sending a message (user input only)
  const handleSend = async (msg?: string) => {
    const text = msg ?? input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    try {
      const resp = await sendChatMessage(text);
      setMessages((prev) => [...prev, { role: "bot", text: resp.reply }]);
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
