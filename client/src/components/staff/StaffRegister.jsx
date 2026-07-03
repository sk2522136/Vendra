import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { registerStaff } from '../../services/api'; 
import { toast } from 'react-toastify';

const StaffRegister = ({ onClose, onStaffAdded }) => {
  const [data, setData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'staff' 
  });
  const [loading, setLoading] = useState(false);

  const passwordCriteria = {
    hasLength: data.password.length >= 8,
    hasUpper: /[A-Z]/.test(data.password),
    hasLower: /[a-z]/.test(data.password),
    hasNumber: /\d/.test(data.password),
    hasSpecial: /[@$!%*?&]/.test(data.password),
  };

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password) {
      toast.error("Fill all fields");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("Please enter a valid password that meets all requirements.");
      return;
    }

    try {
      setLoading(true);
      
      // API call
      const res = await registerStaff({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      });

      toast.success("Staff registered successfully!");
      
      // Reset form
      setData({ name: '', email: '', password: '', role: 'staff' });
      onClose();
      onStaffAdded(); 

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to register";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      
  <div className="bg-bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
    
    <div className="p-6 border-b border-border bg-bg-body flex justify-between items-center">
      <h2 className="text-lg font-black text-text">Register Staff</h2>
      <button 
        onClick={onClose} 
        className="p-2 text-muted hover:bg-bg-card hover:text-text rounded-full transition-all"
      >
        <FaTimes />
      </button>
    </div>
    
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <div>
        <label className="text-[10px] font-black uppercase text-muted ml-1 mb-1 block">Full Name</label>
        <input 
          type="text" 
          placeholder="Enter name" 
          value={data.name}
          onChange={(e) => setData({...data, name: e.target.value})} 
          className="w-full p-4 rounded-2xl text-text bg-bg-body border border-border outline-none focus:border-bg-primary font-bold text-sm"
          required 
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase text-muted ml-1 mb-1 block">Email Address</label>
        <input 
          type="email" 
          placeholder="name@company.com" 
          value={data.email}
          className="w-full p-4 rounded-2xl bg-bg-body text-text border border-border outline-none focus:border-bg-primary font-bold text-sm" 
          required
          onChange={(e) => setData({...data, email: e.target.value})} 
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase text-muted ml-1 mb-1 block">Password</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          value={data.password}
          onChange={(e) => setData({...data, password: e.target.value})} 
          className="w-full p-4 rounded-2xl bg-bg-body border text-text border-border outline-none focus:border-bg-primary font-bold text-sm" 
          required
        />
      </div>

{/* validator */}
      {data.password.length > 0 && (
        <div className="p-3 bg-bg-body rounded-2xl border border-border text-[11px] font-bold space-y-1.5 animate-in fade-in duration-200">
          <p className="text-[10px] uppercase text-muted tracking-wider mb-1">Password Requirements:</p>
          <ul className="grid grid-cols-1 gap-1">
            <li className={passwordCriteria.hasLength ? "text-green-500 flex items-center gap-1.5" : "text-red-500 flex items-center gap-1.5"}>
              <span>{passwordCriteria.hasLength ? "✓" : "✗"}</span> At least 8 characters
            </li>
            <li className={passwordCriteria.hasUpper ? "text-green-500 flex items-center gap-1.5" : "text-red-500 flex items-center gap-1.5"}>
              <span>{passwordCriteria.hasUpper ? "✓" : "✗"}</span> One uppercase letter (A-Z)
            </li>
            <li className={passwordCriteria.hasLower ? "text-green-500 flex items-center gap-1.5" : "text-red-500 flex items-center gap-1.5"}>
              <span>{passwordCriteria.hasLower ? "✓" : "✗"}</span> One lowercase letter (a-z)
            </li>
            <li className={passwordCriteria.hasNumber ? "text-green-500 flex items-center gap-1.5" : "text-red-500 flex items-center gap-1.5"}>
              <span>{passwordCriteria.hasNumber ? "✓" : "✗"}</span> One number (0-9)
            </li>
            <li className={passwordCriteria.hasSpecial ? "text-green-500 flex items-center gap-1.5" : "text-red-500 flex items-center gap-1.5"}>
              <span>{passwordCriteria.hasSpecial ? "✓" : "✗"}</span> One special character (@$!%*?&)
            </li>
          </ul>
        </div>
      )}

      <div>
        <label className="text-[10px] font-black uppercase text-muted ml-1 mb-1 block">Role</label>
        <select 
          value={data.role}
          className="w-full p-4 rounded-2xl bg-bg-body border border-border text-text outline-none focus:border-bg-primary font-bold text-sm cursor-pointer" 
          onChange={(e) => setData({...data, role: e.target.value})}
        >
          <option value="staff">Staff</option>
        </select>
      </div>
      
      <button 
        type="submit"
        disabled={loading || (!isPasswordStrong && data.password.length > 0)}
        className={`w-full font-black uppercase text-xs tracking-widest py-4 rounded-2xl transition-all shadow-lg mt-4 active:scale-95 ${
          loading 
            ? "bg-muted text-white cursor-not-allowed"
            : !isPasswordStrong && data.password.length > 0
            ? "bg-border text-muted cursor-not-allowed"
            : "bg-bg-primary text-white hover:opacity-90"
        }`}
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </form>
  </div>
</div>
  );
};

export default StaffRegister;