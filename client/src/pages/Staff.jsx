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
  <div className="p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-6 md:space-y-8 bg-bg-body rounded-2xl sm:rounded-3xl h-full flex flex-col">
    
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-text uppercase tracking-tight">Staff Management</h1>
      </div>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
      >
        <FaUserPlus /> <span>Register Staff</span>
      </button>
    </div>

    {/* Content Container */}
    <div className="bg-bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm flex-1">
      {loading ? (
        <div className="p-8 text-center text-muted font-bold animate-pulse text-sm">
          Loading...
        </div>
      ) : staff.length === 0 ? (
        <div className="p-8 text-center text-muted font-bold text-sm">
          No staff found
        </div>
      ) : (
        <>
          {/* MOBILE VIEW (Cards) */}
          <div className="md:hidden divide-y divide-border p-3 space-y-3">
            {staff.map((s) => (
              <div key={s._id} className="bg-bg-body p-4 rounded-xl border border-border space-y-3">
                
                {/* Staff Main Info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-text">{s.name}</p>
                    <p className="text-xs text-muted font-medium">{s.email}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${s.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                  <span className="text-muted font-semibold">Role:</span>
                  <span className="font-bold text-text uppercase text-[11px] bg-bg-card px-2.5 py-1 rounded-lg border border-border">
                    {s.role}
                  </span>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted font-semibold">Status Toggle:</span>
                    <button 
                      onClick={() => toggleStatus(s._id)} 
                      className="text-2xl hover:scale-110 transition-transform flex items-center"
                      title="Toggle Status"
                    >
                      {s.isActive ? <FaToggleOn className="text-bg-primary" /> : <FaToggleOff className="text-muted" />}
                    </button>
                  </div>

                  <button 
                    onClick={() => handleDelete(s._id)} 
                    className="p-2 bg-bg-card text-muted hover:text-red-500 border border-border rounded-lg transition-colors"
                    title="Delete Staff"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* DESKTOP VIEW (Table) */}
          <div className="hidden md:block overflow-x-auto">
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
                {staff.map((s) => (
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
                      <button 
                        onClick={() => toggleStatus(s._id)} 
                        className="text-xl hover:scale-110 transition-transform"
                      >
                        {s.isActive ? <FaToggleOn className="text-bg-primary" /> : <FaToggleOff className="text-muted" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(s._id)} 
                        className="text-muted hover:text-red-500 transition-colors text-xl"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>

    {isModalOpen && <StaffRegister onClose={() => setIsModalOpen(false)} onStaffAdded={loadStaff} />}
  </div>
)
}

export default Staff