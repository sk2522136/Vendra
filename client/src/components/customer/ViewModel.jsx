import { useState } from 'react';
import { FaTimes, FaEdit, FaShoppingBag, FaChartLine, FaDownload,FaTrash, FaExchangeAlt } from 'react-icons/fa';


const ViewModel = ({ isOpen, onClose, customerName = "Ali" }) => {
  const [dummyData] = useState({
    customerDetails: {
      name: customerName,
      phone: "03001234567",
      type: "CREDIT"
    },
    statistics: {
      totalSales: 12,
      totalPurchased: 460000,
      totalPaid: 450000,
      pending: 10000
    },
    sales: Array(15).fill({
      id: "SALE-102",
      date: "3/16/2026",
      time: "03:10 AM",
      item: "iPhone 13",
      itemCount: 1,
      total: 160000.00,
      paid: 150000.00,
      status: "Pending"
    })
  });

  
if (!isOpen) return null;
  return (
    <div className="fixed inset-0  z-50 flex items-center justify-center p-4 md:p-10">
      
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
       onClick={onClose}
      ></div>

      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[2.5rem] border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 flex justify-between items-center bg-gray-50/50 border-b border-border flex-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-green/20">
                {dummyData.customerDetails.name[0]}
            </div>
            <div>
                <h2 className="text-xl md:text-2xl font-black text-text tracking-tight flex items-center gap-2">
                {dummyData.customerDetails.name}'s Profile <FaChartLine size={18} className="text-green" />
                </h2>
                <p className="text-muted font-bold text-[10px] uppercase tracking-widest">
                {dummyData.customerDetails.phone} • <span className="text-green">{dummyData.customerDetails.type}</span>
                </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-muted hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-3xl border border-border bg-white shadow-sm">
              <p className="text-muted text-[9px] font-black uppercase tracking-widest mb-1">Orders</p>
              <h3 className="text-xl font-black text-text">{dummyData.statistics.totalSales}</h3>
            </div>
            <div className="p-5 rounded-3xl border border-border bg-white shadow-sm">
              <p className="text-muted text-[9px] font-black uppercase tracking-widest mb-1">Purchased</p>
              <h3 className="text-xl font-black text-text">Rs {dummyData.statistics.totalPurchased.toLocaleString()}</h3>
            </div>
            <div className="p-5 rounded-3xl border border-green/10 bg-green/5 shadow-sm">
              <p className="text-green text-[9px] font-black uppercase tracking-widest mb-1">Paid</p>
              <h3 className="text-xl font-black text-green">Rs {dummyData.statistics.totalPaid.toLocaleString()}</h3>
            </div>
            <div className="p-5 rounded-3xl border border-red-50 bg-red-50 shadow-sm">
              <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mb-1">Pending</p>
              <h3 className="text-xl font-black text-red-600">Rs {dummyData.statistics.pending.toLocaleString()}</h3>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-[1.5rem] border border-border overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-border sticky top-0 z-10">
                  <tr className="text-muted text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dummyData.sales.map((sale, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-text font-bold text-sm">{sale.date}</p>
                        <p className="text-muted text-[10px]">{sale.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaShoppingBag className="text-muted/40" size={12} />
                          <div>
                            <p className="text-text font-bold text-sm">{sale.item}</p>
                            <p className="text-muted text-[10px]">{sale.itemCount} Qty</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-sm text-text">
                        Rs {sale.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          sale.status === 'Paid' ? 'bg-green/10 text-green' : 'bg-red-50 text-red-500'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-between ">
                        <button className="w-8 h-8 bg-green text-white rounded-lg inline-flex items-center justify-center hover:bg-green-dark transition-all shadow-sm" title="Update Sale">
                          <FaEdit size={12} />
                         </button>
                         <button className=" w-8 h-8 bg-green text-white rounded-lg inline-flex items-center justify-center hover:bg-green-dark transition-all shadow-sm" title="return/exchange">
                          <FaExchangeAlt size={12} />
                         
                        </button>
                        <button className="w-8 h-8 bg-green text-white rounded-lg inline-flex items-center justify-center hover:bg-green-dark transition-all shadow-sm " title="Delete Sale">
                          <FaTrash size={12} />
                         
                        </button>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default ViewModel;