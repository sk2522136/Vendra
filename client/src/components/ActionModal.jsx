import { FaTimes } from 'react-icons/fa';

const ActionModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Fixed overlay with backdrop blur - responsive
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
      
      {/* Modal Card - Responsive sizing */}
      <div className="bg-white w-full max-w-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header - Responsive padding */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center rounded-t-2xl sm:rounded-t-3xl gap-3">
          <h2 className="text-base sm:text-lg font-black text-black truncate flex-1">{title}</h2>
          <button  
            onClick={onClose} 
            className="p-2 text-black hover:text-black transition-all rounded-full hover:bg-gray-200 flex-shrink-0"
            aria-label="Close modal"
          >
            <FaTimes size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        {/* Body Content - Responsive scrolling */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default ActionModal;