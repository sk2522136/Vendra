import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCartPlus, FaWallet, FaUserTie } from 'react-icons/fa';
import ActionModal from '../components/ActionModal';



const Supplier = () => {
  const [suppliers] = useState([
    { id: 1, name: "Ali Traders", contact: "0300-1234567", totalPurchase: 50000, paidAmount: 30000, unpaidAmount: 20000 },
    { id: 2, name: "Tech Solutions", contact: "0321-7654321", totalPurchase: 120000, paidAmount: 120000, unpaidAmount: 0 },
  ]);

  const [modalType, setModalType] = useState(null); 
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const openModal = (type, supplier = null) => {
    setSelectedSupplier(supplier);
    setModalType(type);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-text">Suppliers</h1>
        <button 
          onClick={() => openModal('add')}
          className="bg-green text-white px-6 py-3 rounded-2xl font-bold uppercase text-[12px] tracking-widest flex items-center gap-2 hover:bg-green-dark transition-all shadow-sm"
        >
          <FaPlus size={12} /> Add New Supplier
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-225">
            <thead className="bg-sBack border-b border-border">
              <tr className="text-[12px] font-bold text-muted uppercase tracking-wider">
                <th className="px-8 py-5">Supplier</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5 text-right">Total Purchase</th>
                <th className="px-6 py-5 text-right">Paid</th>
                <th className="px-6 py-5 text-right">Unpaid</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-sBack/50 transition-colors">
                  <td className="px-8 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-light rounded-xl flex items-center justify-center text-green"><FaUserTie /></div>
                    <span className="font-bold text-text text-sm">{s.name}</span>
                  </td>
                  <td className="px-6 py-4 text-muted font-medium text-xs">{s.contact}</td>
                  <td className="px-6 py-4 text-right font-bold text-text text-sm">Rs {s.totalPurchase.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-green text-sm">Rs {s.paidAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-red text-sm">Rs {s.unpaidAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal('purchase', s)} className="p-2.5 bg-green-light text-green rounded-lg hover:bg-green hover:text-white transition-all"><FaCartPlus size={14} /></button>
                      <button onClick={() => openModal('payment', s)} className="p-2.5 bg-green-light text-green rounded-lg hover:bg-green hover:text-white transition-all"><FaWallet size={14} /></button>
                      <button onClick={() => openModal('edit', s)} className="p-2.5 bg-amber-light text-amber-dark rounded-lg hover:bg-amber hover:text-white transition-all"><FaEdit size={14} /></button>
                      <button className="p-2.5 bg-red-light text-red rounded-lg hover:bg-red hover:text-white transition-all"><FaTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Logic */}
      <ActionModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        title={`${modalType?.charAt(0).toUpperCase() + modalType?.slice(1)} ${selectedSupplier?.name || ''}`}
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {(modalType === 'add' || modalType === 'edit') && (
            <>
              <input type="text" placeholder="Name" defaultValue={selectedSupplier?.name} className="w-full p-3 rounded-xl bg-sBack border border-border focus:border-green outline-none" />
              <input type="text" placeholder="Contact" defaultValue={selectedSupplier?.contact} className="w-full p-3 rounded-xl bg-sBack border border-border focus:border-green outline-none" />
            </>
          )}
          {(modalType === 'purchase' || modalType === 'payment') && (
            <input type="number" placeholder="Enter Amount" className="w-full p-3 rounded-xl bg-sBack border border-border focus:border-green outline-none" />
          )}
          <button className="w-full bg-green text-white font-bold py-3 rounded-xl hover:bg-green-dark transition-all">Confirm</button>
        </form>
      </ActionModal>
    </div>
  );
};

export default Supplier;