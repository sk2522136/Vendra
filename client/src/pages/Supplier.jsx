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
    <div className="p-3 sm:p-4 md:p-6 min-h-screen overflow-y-auto space-y-6 sm:space-y-8 bg-white rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm">
      
      {/* Header - Title & Description */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Supplier Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">Track supplier purchases, payments, and outstanding balances.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-black text-white px-4 sm:px-6 py-3 rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs shadow-sm uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
        >
          <FaPlus size={12} /> <span>Add New Supplier</span>
        </button>
      </div>

      {loading && <p className="text-center text-gray-500 text-sm">Loading...</p>}
      
      {/* Table - Responsive */}
      <div className="bg-white border border-gray-100 rounded-lg sm:rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-full sm:min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-[9px] sm:text-[11px] text-black font-extrabold uppercase tracking-wider">
                <th className="px-3 sm:px-8 py-4 sm:py-5">Supplier</th>
                <th className="px-2 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">Contact</th>
                <th className="px-2 sm:px-6 py-4 sm:py-5 text-right hidden md:table-cell">Total Purchase</th>
                <th className="px-2 sm:px-6 py-4 sm:py-5 text-right hidden lg:table-cell">Paid</th>
                <th className="px-2 sm:px-6 py-4 sm:py-5 text-right">Unpaid</th>
                <th className="px-2 sm:px-6 py-4 sm:py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center text-black flex-shrink-0">
                      <FaUserTie size={14} className="sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-bold text-text text-xs sm:text-sm break-words">{s.name}</span>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 text-black font-medium text-xs hidden sm:table-cell break-words">{s.contact}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 text-right font-black text-text text-xs sm:text-sm hidden md:table-cell whitespace-nowrap">Rs {s.totalPurchase.toLocaleString()}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 text-right font-black text-black text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">Rs {s.paidAmount.toLocaleString()}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 text-right font-black text-red-500 text-xs sm:text-sm whitespace-nowrap">Rs {s.unpaidAmount.toLocaleString()}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button 
                        onClick={() => openModal('purchase', s)} 
                        className="p-1.5 sm:p-2.5 bg-gray-100 text-black rounded-md sm:rounded-lg hover:bg-black hover:text-white transition-all flex-shrink-0"
                        title="Add Purchase"
                      >
                        <FaCartPlus size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button 
                        onClick={() => openModal('payment', s)} 
                        className="p-1.5 sm:p-2.5 bg-gray-100 text-black rounded-md sm:rounded-lg hover:bg-black hover:text-white transition-all flex-shrink-0"
                        title="Add Payment"
                      >
                        <FaWallet size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button 
                        onClick={() => openModal('edit', s)} 
                        className="p-1.5 sm:p-2.5 bg-gray-100 text-black rounded-md sm:rounded-lg hover:bg-black hover:text-white transition-all flex-shrink-0"
                        title="Edit"
                      >
                        <FaEdit size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSupplier(s._id)} 
                        className="p-1.5 sm:p-2.5 bg-gray-100 text-red-500 rounded-md sm:rounded-lg hover:bg-red-600 hover:text-white transition-all flex-shrink-0"
                        title="Delete"
                      >
                        <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        

      {/* Empty State */}
      {!loading && suppliers.length === 0 && (
        <p className="text-center text-gray-500 py-8 text-sm">No suppliers found</p>
      )}

      {/* Modal Logic */}
      <ActionModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
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
                className="w-full p-3 sm:p-4 text-black rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 focus:border-black outline-none font-bold text-sm" 
              />
              
              <input 
                type="text" 
                name="contact"
                placeholder="Contact" 
                value={formData.contact} 
                onChange={handleInputChange}
                className="w-full p-3 sm:p-4 text-black rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 focus:border-black outline-none font-bold text-sm" 
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
              className="w-full p-3 sm:p-4 text-black rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 focus:border-black outline-none font-bold text-sm" 
            />
          )}
          <button
            type="submit"
            disabled={loading} 
            className="w-full bg-black font-black py-3 sm:py-4 text-white rounded-lg sm:rounded-2xl hover:bg-gray-800 transition-all uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </form>
      </ActionModal>
    </div>
  );
};

export default Supplier;