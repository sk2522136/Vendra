import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  
 let isApiCalled = false;

  useEffect(() => {
    const verifyAccount = async () => {
      
      if (isApiCalled) return;

      isApiCalled = true;

      try {
        // Backend hit (Apna sahi URL check kar lein agar port alag ho)
        const response = await axios.get(`http://localhost:4000/api/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification link is invalid or expired.');
      }
    };

    if (token) {
      verifyAccount();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-body font-mona antialiased px-4">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black tracking-tight text-text uppercase">
          Vendra<span className="text-bg-primary">.</span>
        </h1>
        <p className="text-[10px] text-muted font-semibold tracking-widest uppercase mt-0.5">
          Inventory & POS System
        </p>
      </div>

      {/* Main Card with Premium Borders and Smooth Curves */}
      <div className="max-w-md w-full bg-bg-card p-10 rounded-3xl border border-border shadow-sm text-center transition-all duration-300">
        
        {/* 1. LOADING STATE */}
        {status === 'loading' && (
          <div className="flex flex-col items-center py-6">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-border"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-bg-primary animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-text tracking-tight mb-2">Verifying Account</h2>
            <p className="text-muted text-xs max-w-xs leading-relaxed">
              Checking your activation token with the central secure database...
            </p>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {status === 'success' && (
          <div className="animate-fadeIn">
            {/* Modern Icon Box */}
            <div className="w-16 h-16 bg-bg-primary/10 text-bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-bg-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-text tracking-tight mb-2">Email Verified!</h2>
            <p className="text-muted text-xs mb-8 px-2 leading-relaxed">{message}</p>
            
            <Link 
              to="/login" 
              className="group flex items-center justify-center w-full bg-gradient-to-r from-bg-primary to-bg-secondary hover:opacity-90 text-white py-3 px-4 rounded-xl font-medium active:scale-[0.99] transition-all duration-200 text-xs shadow-sm"
            >
              <span>Proceed to Login</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* 3. ERROR STATE */}
        {status === 'error' && (
          <div className="animate-fadeIn">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-text tracking-tight mb-2">Verification Failed</h2>
            <p className="text-red-600 bg-red-50/50 border border-red-100/30 rounded-xl p-3 text-xs mb-8 max-w-sm mx-auto leading-relaxed">
              {message}
            </p>
            
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center w-full bg-bg-card border border-border text-text py-3 px-4 rounded-xl font-medium hover:bg-hover active:scale-[0.99] transition-all duration-200 text-xs"
            >
              Return to Login Portal
            </Link>
          </div>
        )}

      </div>

      <p className="mt-8 text-[11px] text-muted">© 2026 Vendra POS. All rights reserved.</p>
    </div>
  );
}

export default VerifyEmail;