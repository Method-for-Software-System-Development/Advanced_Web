/**
 * ChatButton – floating circular button that toggles the chatbot window.
 * Sits bottom-right, grows on hover, slight colour shift on click.
 *
 * Props:
 *   onClick : () => void   – callback to open / close the chat window
 */

import React from "react";
import { MessageCircle } from "lucide-react";   // icon set →  npm i lucide-react

export interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => (
  <button
    aria-label="Open chat"
    onClick={onClick}
    className="
      fixed bottom-6 right-6 z-50
      flex items-center justify-center
      w-14 h-14 rounded-full
      bg-blue-600 text-white shadow-lg
      hover:bg-blue-700 active:bg-blue-800
      hover:scale-110 transition duration-300 ease-out
    "
  >
    {/* Lucide chat icon */}
    <MessageCircle size={28} strokeWidth={2} />
  </button>
);

export default ChatButton;
