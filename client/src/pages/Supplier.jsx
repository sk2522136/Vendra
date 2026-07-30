import { useState,useEffect, use } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCartPlus, FaWallet, FaUserTie } from 'react-icons/fa';
import ActionModal from '../components/ActionModal';
import {createSupplier,getAllSuppliers,getSupplierById,updateSupplier,deleteSupplier,addPurchase,addPayment} from '../services/api';
import { toast } from 'react-toastify';

const Supplier = () => {
  const [suppliers,setSuppliers] = useState([]);
  const [modalType, setModalType] = useState(null); 
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
  name: '',
  contact: '',
  amount: ''
});
const [loading, setLoading] = useState(false);


useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getAllSuppliers();
      setSuppliers(res.data.suppliers);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

const openModal = (type, supplier = null) => {
  setModalType(type);
  setSelectedSupplier(supplier);
  
  if (type === 'add') {
    setFormData({ name: '', contact: '', amount: '' });
  } else if (type === 'edit') {
    setFormData({ 
      name: supplier?.name || '', 
      contact: supplier?.contact || '', 
      amount: '' 
    });
  } else {
    setFormData({ name: '', contact: '', amount: '' });
  }
};

const closeModal = () => {
  setModalType(null);
  setSelectedSupplier(null);
  setFormData({ name: '', contact: '', amount: '' });
};

const handleInputChange = (e) => {
  const {name , value} =e.target;
  setFormData(prev => ({...prev, [name]: value}));
}


const  handleAddSupplier = async (e) => {
  e.preventDefault();
  if(!formData.name.trim() || !formData.contact.trim()){
    toast.error('Name and Contact are required');
    return;
  }
  try {
     const res = await createSupplier({
      name: formData.name,
      contact: formData.contact
    });
     setSuppliers([res.data.supplier, ...suppliers]);
    toast.success('Supplier added!');
    closeModal();
     
  } catch (error) {
        toast.error(error.response?.data?.message);

  }
}

const handleEditSupplier = async (e) => {
  e.preventDefault();
  try {
    const res = await updateSupplier(selectedSupplier._id, {
      name: formData.name,
      contact: formData.contact
    });
    
    setSuppliers(suppliers.map(s => 
      s._id === selectedSupplier._id ? res.data.updatedSupplier : s
    ));
    toast.success('Supplier updated!');
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
}
 

const handleAddPurchase = async (e) => {
  e.preventDefault();
  
  const amount = parseFloat(formData.amount);
  if (!amount || amount <= 0) {
    toast.error('Enter valid amount');
    return;
  }

  try {
    const res = await addPurchase(selectedSupplier._id, { amount });
    
    setSuppliers(suppliers.map(s => 
      s._id === selectedSupplier._id ? res.data.supplier : s
    ));
    toast.success('Purchase recorded!');
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

const handleAddPayment = async (e) => {
  e.preventDefault();
  
  const amount = parseFloat(formData.amount);
  if (!amount || amount <= 0) {
    toast.error('Enter valid amount');
    return;
  }

  if (amount > selectedSupplier.unpaidAmount) {
    toast.error(`Cannot exceed unpaid: Rs ${selectedSupplier.unpaidAmount}`);
    return;
  }

  try {
    const res = await addPayment(selectedSupplier._id, { amount });
    
    setSuppliers(suppliers.map(s => 
      s._id === selectedSupplier._id ? res.data.supplier : s
    ));
    toast.success('Payment recorded!');
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};


const handleDeleteSupplier = async (supplierId) => {
  if (!window.confirm('Delete this supplier?')) {
    return;
  }

  try {
    await deleteSupplier(supplierId);
    setSuppliers(suppliers.filter(s => s._id !== supplierId));
    toast.success('Supplier deleted!');
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};

const handleFormSubmit = (e) => {
  if (modalType === 'add') {
    handleAddSupplier(e);
  } else if (modalType === 'edit') {
    handleEditSupplier(e);
  } else if (modalType === 'purchase') {
    handleAddPurchase(e);
  } else if (modalType === 'payment') {
    handleAddPayment(e);
  }
};


  return (
   <div className="h-full flex flex-col overflow-hidden p-3 space-y-4 sm:space-y-6 sm:p-4 md:p-6 bg-bg-body">
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text uppercase tracking-tight">Supplier Management</h1>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-bg-primary text-white px-4 sm:px-6 py-3 rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs shadow-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
        >
          <FaPlus size={12} /> <span>Add New Supplier</span>
        </button>
      </div>

      {loading && <p className="text-center text-muted text-sm">Loading...</p>}

      <div className="bg-bg-card border border-border rounded-lg sm:rounded-3xl overflow-hidden shadow-sm">
        {!loading && suppliers.length === 0 ? (
          <p className="text-center text-muted py-8 text-sm font-bold">No suppliers found</p>
        ) : (
          <>
            {/* MOBILE VIEW  */}
            <div className="md:hidden divide-y divide-border p-4 space-y-4">
              {suppliers.map((s) => (
                <div key={s._id || s.id} className="bg-bg-body p-4 rounded-2xl border border-border space-y-3">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bg-card rounded-xl flex items-center justify-center text-text flex-shrink-0 border border-border">
                      <FaUserTie size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text">{s.name}</h4>
                      <p className="text-xs text-muted font-medium">{s.contact || 'No contact'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-center">
                    <div className="bg-bg-card p-2 rounded-xl border border-border">
                      <p className="text-[9px] font-black text-muted uppercase">Total</p>
                      <p className="text-xs font-black text-text mt-0.5">Rs {s.totalPurchase?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-bg-card p-2 rounded-xl border border-border">
                      <p className="text-[9px] font-black text-muted uppercase">Paid</p>
                      <p className="text-xs font-black text-text mt-0.5">Rs {s.paidAmount?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-bg-card p-2 rounded-xl border border-border">
                      <p className="text-[9px] font-black text-muted uppercase">Unpaid</p>
                      <p className="text-xs font-black text-red-500 mt-0.5">Rs {s.unpaidAmount?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button 
                      onClick={() => openModal('purchase', s)} 
                      className="p-2 bg-bg-card text-text border border-border rounded-xl hover:bg-bg-primary hover:text-white transition-all"
                      title="Add Purchase"
                    >
                      <FaCartPlus size={14} />
                    </button>
                    <button 
                      onClick={() => openModal('payment', s)} 
                      className="p-2 bg-bg-card text-text border border-border rounded-xl hover:bg-bg-primary hover:text-white transition-all"
                      title="Add Payment"
                    >
                      <FaWallet size={14} />
                    </button>
                    <button 
                      onClick={() => openModal('edit', s)} 
                      className="p-2 bg-bg-card text-text border border-border rounded-xl hover:bg-bg-primary hover:text-white transition-all"
                      title="Edit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSupplier(s._id)} 
                      className="p-2 bg-bg-card text-red-500 border border-border rounded-xl hover:bg-red-600 hover:text-white transition-all"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW  */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-bg-body border-b border-border">
                  <tr className="text-[11px] text-text font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-5">Supplier</th>
                    <th className="px-6 py-5">Contact</th>
                    <th className="px-6 py-5 text-right">Total Purchase</th>
                    <th className="px-6 py-5 text-right">Paid</th>
                    <th className="px-6 py-5 text-right">Unpaid</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {suppliers.map((s) => (
                    <tr key={s._id || s.id} className="hover:bg-bg-body transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-bg-body rounded-xl flex items-center justify-center text-text flex-shrink-0 border border-border">
                          <FaUserTie size={16} />
                        </div>
                        <span className="font-bold text-text text-sm">{s.name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted font-medium text-xs">{s.contact}</td>
                      <td className="px-6 py-4 text-right font-black text-text text-sm whitespace-nowrap">
                        Rs {s.totalPurchase?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-text text-sm whitespace-nowrap">
                        Rs {s.paidAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-red-500 text-sm whitespace-nowrap">
                        Rs {s.unpaidAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openModal('purchase', s)} 
                            className="p-2.5 bg-bg-body text-text border border-border rounded-lg hover:bg-bg-primary hover:text-white transition-all"
                            title="Add Purchase"
                          >
                            <FaCartPlus size={14} />
                          </button>
                          <button 
                            onClick={() => openModal('payment', s)} 
                            className="p-2.5 bg-bg-body text-text border border-border rounded-lg hover:bg-bg-primary hover:text-white transition-all"
                            title="Add Payment"
                          >
                            <FaWallet size={14} />
                          </button>
                          <button 
                            onClick={() => openModal('edit', s)} 
                            className="p-2.5 bg-bg-body text-text border border-border rounded-lg hover:bg-bg-primary hover:text-white transition-all"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSupplier(s._id)} 
                            className="p-2.5 bg-bg-body text-red-500 border border-border rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ActionModal 
        isOpen={!!modalType} 
        onClose={closeModal} 
        title={`${modalType?.charAt(0).toUpperCase() + modalType?.slice(1)} ${selectedSupplier?.name || ''}`}
      >
        <form className="space-y-3 sm:space-y-4" onSubmit={handleFormSubmit}>
          {(modalType === 'add' || modalType === 'edit') && (
            <>
              <input 
                type="text" 
                name="name"
                placeholder="Name" 
                value={formData.name} 
                onChange={handleInputChange}
                className="w-full p-3 sm:p-4 text-text rounded-lg sm:rounded-2xl bg-bg-body border border-border focus:border-bg-primary outline-none font-bold text-sm" 
              />
              
              <input 
                type="text" 
                name="contact"
                placeholder="Contact" 
                value={formData.contact} 
                onChange={handleInputChange}
                className="w-full p-3 sm:p-4 text-text rounded-lg sm:rounded-2xl bg-bg-body border border-border focus:border-bg-primary outline-none font-bold text-sm" 
              />
            </>
          )}
          {(modalType === 'purchase' || modalType === 'payment') && (
            <input 
              type="number" 
              name="amount"
              placeholder="Enter Amount" 
              value={formData.amount} 
              onChange={handleInputChange}
              className="w-full p-3 sm:p-4 text-text rounded-lg sm:rounded-2xl bg-bg-body border border-border focus:border-bg-primary outline-none font-bold text-sm" 
            />
          )}
          <button
            type="submit"
            disabled={loading} 
            className="w-full bg-bg-primary font-black py-3 sm:py-4 text-white rounded-lg sm:rounded-2xl hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </form>
      </ActionModal>
    </div>
  );
};

export default Supplier;