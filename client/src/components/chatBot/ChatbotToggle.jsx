import React, { useState } from 'react';
import ChatbotWindow from './ChatbotWindow.jsx';

const ChatbotToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className=" fixed  bottom-6 right-6 w-14 h-14 bg-bg-primary hover:bg-bg-secondary text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 transform hover:scale-105 z-[9999] focus:outline-none"
        title="POS ASSISTANT"
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <span className="text-2xl font-extrabold">💬</span>
        )}
      </button>

      <ChatbotWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default ChatbotToggle;