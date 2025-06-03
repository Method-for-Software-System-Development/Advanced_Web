import React from "react";

export interface MessageBubbleProps {
  role: "user" | "bot";
  text: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, text }) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[80%] px-4 py-2 text-sm rounded-lg
                    ${isUser ? "bg-[#F7C9D3] text-[#3B3B3B]" : "bg-gray-200 text-[#3B3B3B]"}
                    ${isUser ? "rounded-br-none self-end" : "rounded-bl-none self-start"}
                    ${isUser ? "mr-2" : "ml-2"}
                    dark:${isUser ? "bg-[#F7C9D3]" : "bg-gray-400"}`}
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;
