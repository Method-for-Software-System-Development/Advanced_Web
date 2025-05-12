/**
 * ChatWindow – floating panel that shows the conversation.
 * Props:
 *   open     – whether the window is visible
 *   onClose  – callback when the user clicks ✕
 *
 * State:
 *   messages – array of { id, role, text }
 *              simple echo bot for now.
 */
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import MessageBubble, { MessageBubbleProps } from "./MessageBubble";

export interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<MessageBubbleProps[]>([
    { role: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  /** Scroll to bottom whenever messages change */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /** Send message + echo reply */
  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: MessageBubbleProps = { role: "user", text: input };
    const botMsg: MessageBubbleProps = { role: "bot", text: `Echo: ${input}` };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  if (!open) return null; // window hidden

  return (
    <div
      className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-900
                 rounded-xl shadow-xl flex flex-col z-50
                 animate-fade-in"
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-xl">
        <span className="font-semibold">Virtual Assistant</span>
        <button aria-label="Close chat" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2 flex flex-col">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} {...m} />
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
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
            className="flex-1 px-4 py-3 text-sm border rounded-l-md
                       focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-md"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
