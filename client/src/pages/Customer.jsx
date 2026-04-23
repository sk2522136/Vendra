import { useState } from 'react';
import { FaUserPlus, FaSearch, FaPhoneAlt, FaHistory, FaUserTag, FaChevronRight } from 'react-icons/fa';
import ViewModel from '../components/customer/ViewModel';

const Customer = () => {

      const [isModelOpen , setIsModelOpen]=useState(false)
  
  const [customers, setCustomers] = useState([
    { _id: '1', name: 'Sahil Kumar', phoneNumber: '9876543210', currentBalance: 4500, customerType: 'credit', lastPaymentDate: '2026-03-25' },
    { _id: '2', name: 'Vikram Singh', phoneNumber: '8877665544', currentBalance: 0, customerType: 'cash', lastPaymentDate: '2026-03-20' },
  ]);

  const handleViewBtn = () =>{
    setIsModelOpen(true)
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-muted text-xs font-bold uppercase">Total credit Customer </p>
          <h3 className="text-2xl font-black text-red-500 mt-1">Rs 1,24,000</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-muted text-xs font-bold uppercase">Credit Customers</p>
          <h3 className="text-2xl font-black text-text mt-1">{customers.filter(c => c.customerType === 'credit').length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <p className="text-muted text-xs font-bold uppercase">Total Outstanding Balance</p>
          <h3 className="text-2xl font-black text-green mt-1">1200000</h3>
        </div>
      </div>
 
      

      {/* Customers Table/Grid */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm ">
         <div  className=' p-4 border-b border-border '>
      <div className="relative flex gap-2 ">
        <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-muted" />
        <input 
          type="text" 
          placeholder="Search by name or phone number..." 
          className="w-90 pl-12 pr-4 py-2.5 rounded-xl border border-border outline-none focus:border-green transition-all bg-white gap-2"
        />
        </div>
        </div>
        <table className="w-full  text-left">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase">Customer Details</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase">Type</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase">Balance</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase">Last Payment</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green/10 text-green flex items-center justify-center font-bold">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-text">{c.name}</p>
                      <p className="text-xs text-muted flex items-center gap-1"><FaPhoneAlt size={10}/> {c.phoneNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    c.customerType === 'credit' ? 'bg-orange-100 text-orange-600' : 'bg-green/10 text-green'
                  }`}>
                    {c.customerType}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-sm">
                  <span className={c.currentBalance > 0 ? 'text-red-500' : 'text-text'}>
                    Rs {c.currentBalance.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted font-medium">
                  {c.lastPaymentDate || 'No payments yet'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                     onClick={handleViewBtn}
                    className="p-2 hover:bg-green hover:text-white rounded-lg transition-all text-muted inline-flex items-center gap-2 text-xs font-bold uppercase"
                    title="View History"
                  >
                    View <FaChevronRight size={10} />

                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
       <ViewModel
        isOpen={isModelOpen}
        onClose={() => setIsModelOpen(false)} 
        
      />
    </div>
  );
};

export default Customer;