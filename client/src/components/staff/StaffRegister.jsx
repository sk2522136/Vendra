import React, { useState } from 'react';

const StaffRegister = ({ onClose }) => {
  const [data, setData] = useState({ name: '', email: '', password: '', role: 'Staff' });

  return (
    // Fixed overlay with full height, adding overflow handling for mobile
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm">
      
      {/* Container: Max height limits modal if keyboard opens */}
      <div className="bg-card w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-border shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Register New Staff</h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-text rounded-full hover:bg-sBack">✕</button>
        </div>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full p-3.5 rounded-xl bg-sBack border border-border outline-none focus:border-green" 
            onChange={(e) => setData({...data, name: e.target.value})} 
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3.5 rounded-xl bg-sBack border border-border outline-none focus:border-green" 
            onChange={(e) => setData({...data, email: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3.5 rounded-xl bg-sBack border border-border outline-none focus:border-green" 
            onChange={(e) => setData({...data, password: e.target.value})} 
          />
          <select 
            className="w-full p-3.5 rounded-xl bg-sBack border border-border outline-none focus:border-green" 
            onChange={(e) => setData({...data, role: e.target.value})}
          >
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
          
          <button className="w-full bg-green text-white font-bold py-3.5 rounded-xl hover:bg-green-dark transition-all">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffRegister;