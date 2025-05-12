/**
 * MessageBubble – renders one chat line.
 * role === "user"  → blue bubble on the right
 * role === "bot"   → gray bubble on the left
 */
import React from "react";

export interface MessageBubbleProps {
  role: "user" | "bot";
  text: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, text }) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[80%] px-4 py-2 text-sm rounded-lg
                    ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}
                    ${isUser ? "rounded-br-none self-end" : "rounded-bl-none self-start"}
                    ${isUser ? "mr-2" : "ml-2"}
                    dark:${isUser ? "bg-blue-600" : "bg-gray-700"}
                    `}
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;
