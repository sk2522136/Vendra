import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const ActionModal = ({ isOpen, onClose, title, children }) => {
  
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
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      
     
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] sm:max-h-[90vh] transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        
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
        
      
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar leading-relaxed text-sm text-gray-600">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default ActionModal;