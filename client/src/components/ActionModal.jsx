import React from 'react';

const ActionModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/20 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm p-6 rounded-3xl border border-border2 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-green transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ActionModal;