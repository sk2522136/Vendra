import React from 'react';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-mainCard flex items-center justify-center p-4">
      <div className="text-center">
        <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-black text-black mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-4">Page Not Found</p>
        <p className="text-sm text-gray-500 mb-6">Sorry, the page you're looking for doesn't exist.</p>
        
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-black uppercase mx-auto hover:opacity-90"
        >
          <FiArrowLeft size={14} /> Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;