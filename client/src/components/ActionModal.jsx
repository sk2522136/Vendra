import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const ActionModal = ({ isOpen, onClose, title, children }) => {
  
  // 1. LIFECYCLE: Global layout lock to prevent body background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // FIX: Outer background wrapper now handles close triggers safely on backdrop target clicks
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      
      {/* MODAL BODY CARD SHELL CONTAINER 
        FIX: Added explicit flex column distribution matrices to retain structural positioning ratios
      */}
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] sm:max-h-[90vh] transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Safe shield block wrapper rule preventing event bubble leakage
      >
        
        {/* HEADER SECTION PANEL STRIP */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center gap-4 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-black text-black uppercase tracking-tight truncate">
              {title || "System Message Prompt"}
            </h2>
          </div>
          
          <button  
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-200/70 transition-all rounded-xl flex-shrink-0 flex items-center justify-center"
            aria-label="Terminate interface action sheet overlay window panel"
          >
            <FaTimes size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
        
        {/* SLOTTED DATA LAYOUT COMPONENT TERMINAL BODY 
          FIX: Appended explicit flex-1 execution properties to force layout container isolation
        */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar leading-relaxed text-sm text-gray-600">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default ActionModal;