import React, { useState } from 'react';
import { FaUserPlus, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import StaffRegister from '../components/staff/StaffRegister.jsx';

const Staff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staff, setStaff] = useState([
    { id: 1, name: "Sahil", email: "sahil@admin.com", role: "Admin", isActive: true },
    { id: 2, name: "Vikram", email: "vikram@staff.com", role: "Staff", isActive: false }
  ]);

  const toggleStatus = (id) => {
    setStaff(staff.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <div className="p-4 md:p-8"> {/* Padding adjust ki hai responsive ke liye */}
      
      {/* Header - Stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-2xl font-bold text-text">Staff List</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-green text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-dark transition-all"
        >
          <FaUserPlus /> Register New Staff
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto"> {/* Yeh table ko mobile par scrollable banayega */}
          <table className="w-full text-left min-w-150"> {/* Fixed width prevent squishing */}
            <thead className="bg-sBack uppercase text-[10px] text-muted">
              <tr>
                <th className="px-6 md:px-8 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-sBack/50">
                  <td className="px-6 md:px-8 py-4">
                    <p className="font-bold text-sm text-text">{s.name}</p>
                    <p className="text-[10px] text-muted">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">{s.role}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${s.isActive ? 'text-green' : 'text-red'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleStatus(s.id)} className="text-2xl hover:scale-110 transition-transform">
                      {s.isActive ? <FaToggleOn className="text-green" /> : <FaToggleOff className="text-red" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <StaffRegister onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Staff;