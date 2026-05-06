import { useState,useEffect } from 'react';
import { FaUserPlus, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import StaffRegister from '../components/staff/StaffRegister.jsx';
import { getAllStaff } from '../services/api'; // 👈 Add یہ function
import { toast } from 'react-toastify';




const Staff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch staff list
  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await getAllStaff(); // 👈 API call
      setStaff(res.data.users || res.data);
    } catch (error) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const toggleStatus = (id) => {
    setStaff(staff.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <div className="p-6 h-[98vh] overflow-y-auto custom-scrollbar space-y-8 bg-bg-mainCard rounded-3xl border border-gray-100">
      
      {/* Title and Description */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-text">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members, roles, and account access permissions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <FaUserPlus /> Register Staff
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {/* min-w-full lg:min-w-0 ensures table takes full width but doesn't shrink dangerously */}
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-extrabold text-black uppercase">Name</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-black uppercase">Role</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-black uppercase">Status</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-black uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">Loading...</td>
                </tr>
              ) : staff.length > 0 ? (
              staff.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-text">{s.name}</p>
                    <p className="text-[10px] text-muted">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-text">{s.role}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${s.isActive ? 'bg-black/10 text-black ' : 'bg-red-50 text-red-500'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleStatus(s._id)} 
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {s.isActive ? <FaToggleOn className="text-black" /> : <FaToggleOff className="text-gray-300" />}
                    </button>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">No staff found</td>
                </tr>
              )}
              
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <StaffRegister onClose={() => setIsModalOpen(false)} onStaffAdded={loadStaff} />}
    </div>
  );
};

export default Staff;