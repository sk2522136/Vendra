import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { registerStaff } from '../../services/api'; 
import { toast } from 'react-toastify';

const StaffRegister = ({ onClose ,onStaffAdded}) => {
 const [data, setData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'staff' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!data.name || !data.email || !data.password) {
      toast.error("Fill all fields");
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
      
      {/* Modal Card */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-black">Register Staff</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:bg-gray-200 hover:text-black rounded-full transition-all"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter name" 
              value={data.name}
              onChange={(e) => setData({...data, name: e.target.value})} 
             className="w-full p-4 rounded-2xl text-black bg-gray-50 border border-gray-200 outline-none focus:border-black font-bold text-sm"
              required 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={data.email}
              className="w-full p-4 rounded-2xl bg-gray-50 text-black border border-gray-200 outline-none focus:border-black font-bold text-sm" 
               required
              onChange={(e) => setData({...data, email: e.target.value})} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={data.password}
              onChange={(e) => setData({...data, password: e.target.value})} 
               className="w-full p-4 rounded-2xl bg-gray-50 border text-black border-gray-200 outline-none focus:border-black font-bold text-sm" 
                required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1 block">Role</label>
            <select 
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 text-black outline-none focus:border-black font-bold text-sm cursor-pointer" 
              onChange={(e) => setData({...data, role: e.target.value})}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl hover:bg-gray-800 disabled:opacity-50 active:scale-95 transition-all shadow-lg mt-4"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffRegister;