import React from 'react';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

 return (
    <div className="min-h-screen bg-bg-body flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full bg-bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        
        {/* Warning Icon with Project Touch */}
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        {/* Error Code & Message */}
        <h1 className="text-4xl sm:text-5xl font-black text-text tracking-tighter uppercase">404</h1>
        <p className="text-base sm:text-lg font-bold text-text mt-2">Page Not Found</p>
        <p className="text-xs sm:text-sm text-muted mt-1 mb-6">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Theme Styled Button */}
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center justify-center gap-2 w-full bg-bg-primary text-white px-6 py-3.5 rounded-xl font-bold uppercase hover:opacity-90 transition-all text-xs sm:text-sm shadow-sm"
        >
          <FiArrowLeft size={16} /> Go Home
        </button>

      </div>
    </div>
  );
};

export default ErrorPage;