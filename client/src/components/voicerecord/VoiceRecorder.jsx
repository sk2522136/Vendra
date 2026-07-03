import React, { useState, useRef, useEffect } from "react";
import { FiMic, FiMicOff, FiVolume2, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import {parseVoiceCommand} from "../../services/api.js";

const VoiceRecorder = ({ onCommand, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support voice input!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US"; 
    recognition.continuous = false;
    recognition.interimResults = true;

    setIsListening(true);
    setTranscript("");

    recognition.onstart = () => {
      console.log("Listening started...");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text + " ";
        } else {
          interim += text;
        }
      }

      const fullTranscript = (final || interim).trim();
      setTranscript(fullTranscript);

      if (final) {
        handleTranscript(fullTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      toast.error("Error recognizing speech");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleTranscript = async (text) => {
    try {
      setIsListening(false);

      const response = await parseVoiceCommand({ transcript: text });


         const data =  response?.data || res;
      if (data && data.action && data.confidence > 0.5) {
        onCommand(data);

        speakResponse(
          `${data.action === "ADD_TO_CART" ? "Added" : "Processing"} ${data.product || data.paymentMethod || "command"}`
        );

        setTimeout(() => setTranscript(""), 2000);
      } else {
        toast.warning("Command not recognized, please speak clearly");
        speakResponse("Sorry, I didn't understand that");
      }
    } catch (error) {
      console.error("Error parsing command:", error);
      toast.error("Error processing voice command");
    }
  };

  const speakResponse = (message) => {
    setIsSpeaking(true);
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    const voices = synth.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0];
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    synth.speak(utterance);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[99999] bg-white border-2 border-bg-primary rounded-2xl shadow-2xl p-4 w-80 flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
        <h3 className="font-bold text-bg-primary text-sm">🎤 Voice Assistant (English Only)</h3>
        <button onClick={onClose} className="text-muted hover:text-text transition-all cursor-pointer">
          <FiX size={18} />
        </button>
      </div>

      {/* Mic Button */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isSpeaking}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-gradient-to-r from-bg-primary to-bg-secondary text-white hover:scale-110"
          } disabled:opacity-50`}
        >
          {isListening ? <FiMicOff size={32} /> : <FiMic size={32} />}
        </button>

        <p className="text-sm text-muted font-bold text-center">
          {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Click to speak"}
        </p>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="bg-hover rounded-xl p-3 mb-3">
          <p className="text-xs text-muted font-bold mb-1">You said:</p>
          <p className="text-text font-medium text-sm break-words">
            {transcript}
          </p>
        </div>
      )}

      {/* Speaker Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-2 bg-green-50 rounded-xl p-2 mb-3">
          <FiVolume2 className="text-green-600 animate-pulse" size={16} />
          <p className="text-xs text-green-800 font-bold">Bot is speaking...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;