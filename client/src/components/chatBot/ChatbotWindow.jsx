import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse }  from "../../services/api.js";

const ChatbotWindow = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I assist you today?", sender: "bot" }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll logic to stick to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText("");

    setMessages((prev) => [...prev, { id: Date.now(), text: userMessage, sender: "user" }]);
    setLoading(true);

    try {
      const response = await getChatbotResponse({ message: userMessage });

      if (response.data && response.data.success) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: response.data.message, sender: "bot" }]);
      } else {
        throw new Error("Failed to process data.");
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || "Connection error";
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: `Error: ${errMsg}`, sender: "bot" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-[340px] h-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-[9999] overflow-hidden transition-all duration-300 transform scale-100">
      
      {/* ─── HEADER ─── */}
      <div className="bg-bg-primary text-white px-4 py-3 flex justify-between items-center font-semibold text-sm tracking-wide">
        <div className="flex items-center gap-2">
          <span>🤖</span> POS Assistant
        </div>
        <button 
          onClick={onClose} 
          className="text-white hover:text-gray-200 font-bold text-base transition-colors focus:outline-none"
        >
          X
        </button>
      </div>

      {/* ─── CHAT BODY ─── */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            {/* Message Bubble */}
            <div
              className={`px-3 py-2 rounded-2xl text-xs whitespace-pre-line shadow-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gray-200 text-gray-800 rounded-tr-none'
                  : 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            {/* Status / Seen Tag */}
            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {msg.sender === 'user' ? '✓ Sent' : '✓ Seen'}
            </span>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="self-start max-w-[80%] flex flex-col items-start">
            <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl rounded-tl-none text-xs italic animate-pulse">
              Typing response...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ─── INPUT FORM ─── */}
      <form onSubmit={handleSend} className="p-2 border-t border-gray-100 bg-white flex gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message..."
          disabled={loading}
          className="flex-1 bg-gray-100 text-xs px-3 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-bg-secondary transition-colors disabled:opacity-50 shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatbotWindow;