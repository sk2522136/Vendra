import { useState,useEffect } from 'react';
import { FaUserPlus, FaToggleOn, FaToggleOff ,FaTrash } from 'react-icons/fa';
import StaffRegister from '../components/staff/StaffRegister.jsx';
import { getAllStaff,deleteStaff } from '../services/api'; 
import { toast } from 'react-toastify';




const Staff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);


  // handle delete staff

  const handleDelete =  async (id) =>{
    try{
       await deleteStaff(id);
        toast.success("Staff deleted successfully");
        loadStaff();
    }catch(error){
        
        toast.error("Failed to delete staff")
    }
  }

  // Fetch staff list
  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await getAllStaff(); 
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
   <div className="p-6  overflow-y-auto custom-scrollbar space-y-8 bg-bg-body rounded-3xl">
      
  {/* Title and Description */}
  <div className="flex justify-between items-end">
    <div>
      <h1 className="text-2xl font-black text-text uppercase">Staff Management</h1>
      <p className="text-sm text-muted mt-1">Manage team members, roles, and account access permissions.</p>
    </div>
    <button 
      onClick={() => setIsModalOpen(true)}
      className="bg-bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
    >
      <FaUserPlus /> Register Staff
    </button>
  </div>

  {/* Table Section */}
  <div className="bg-bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[600px]">
        <thead className="bg-bg-body border-b border-border">
          <tr>
            <th className="px-6 py-4 text-[11px] font-extrabold text-muted uppercase">Name</th>
            <th className="px-6 py-4 text-[11px] font-extrabold text-muted uppercase">Role</th>
            <th className="px-6 py-4 text-[11px] font-extrabold text-muted uppercase">Status</th>
            <th className="px-6 py-4 text-[11px] font-extrabold text-muted uppercase text-center">Actions</th>
            <th className="px-6 py-4 text-[11px] font-extrabold text-muted uppercase text-center">Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-muted">Loading...</td>
            </tr>
          ) : staff.length > 0 ? (
            staff.map((s) => (
              <tr key={s._id} className="hover:bg-bg-body transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-sm text-text">{s.name}</p>
                  <p className="text-[10px] text-muted">{s.email}</p>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-text">{s.role}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${s.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                   {/* Toggle Status */}
                   <button 
                      onClick={() => toggleStatus(s._id)} 
                      className="text-xl hover:scale-110 transition-transform"
                    >
                      {s.isActive ? <FaToggleOn className="text-bg-primary" /> : <FaToggleOff className="text-muted" />}
                    </button>
                </td>
                <td className="px-6 py-4 text-center">
                    {/* Delete Action */}
                    <button 
                      onClick={() => handleDelete(s._id)} 
                      className="text-muted hover:text-red-500 transition-colors text-xl"
                    >
                      <FaTrash size={16} />
                    </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-muted">No staff found</td>
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