import { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaShoppingBag, FaChartLine, FaTrash, FaExchangeAlt } from 'react-icons/fa';
import UpdateModel from '../customer/UpdateModel.jsx'; 
import ReturnModel from '../customer/ReturnModel.jsx'; 
import { getSaleByCustomer, deleteSale } from '../../services/api'; 
import { toast } from 'react-toastify';

const ViewModel = ({ isOpen, onClose, customerId }) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null); 

  const [customerData, setCustomerData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCustomerData = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const res = await getSaleByCustomer(customerId);

      setCustomerData(res.data.customerDetails);
      setStatistics(res.data.salesStatistics);
      setSalesData(res.data.data);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load customer data";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerData();
    }
  }, [isOpen, customerId]);

  const handleDelete = async (saleId) => {
    try {
      setLoading(true);
      
      await deleteSale(saleId);
      
      toast.success("Sale deleted successfully!");
      await loadCustomerData();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete sale";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
   <>
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-10">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

    <div className="relative w-full max-w-4xl max-h-[85vh] bg-bg-card rounded-xl sm:rounded-3xl md:rounded-[2.5rem] border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="p-4 sm:p-6 md:p-8 flex justify-between items-start sm:items-center gap-4 bg-bg-body border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bg-primary text-white rounded-lg sm:rounded-2xl flex items-center justify-center text-base sm:text-xl font-black flex-shrink-0">
            {customerData?.customerName?.[0] || 'N'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-black text-text truncate">{customerData?.customerName || "Customer"}'s Profile</h2>
            <p className="text-muted font-bold text-[8px] sm:text-[10px] uppercase tracking-widest truncate">
              {customerData?.phoneNumber || "N/A"} • <span className="text-text">{customerData?.customerType || "N/A"}</span>
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 sm:p-3 text-muted hover:bg-bg-card hover:text-text rounded-lg sm:rounded-2xl transition-all flex-shrink-0"
          aria-label="Close"
        >
          <FaTimes size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted font-bold text-sm">Loading customer data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: 'Orders', val: statistics?.totalSales || 0 },
                { label: 'Purchased', val: `Rs ${statistics?.totalPurchased?.toLocaleString() || 0}` },
                { label: 'Paid', val: `Rs ${statistics?.totalPaid?.toLocaleString() || 0}` },
                { label: 'Pending', val: `Rs ${statistics?.totalPending?.toLocaleString() || 0}` },
              ].map((s, i) => (
                <div key={i} className="p-3 sm:p-5 rounded-lg sm:rounded-3xl border border-border bg-bg-body">
                  <p className="text-muted text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <h3 className="text-sm sm:text-lg font-black text-text break-words">{s.val}</h3>
                </div>
              ))}
            </div>

            <div className="rounded-lg sm:rounded-[1.5rem] border border-border overflow-hidden bg-bg-body">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-full sm:min-w-[650px]">
                  <thead className="bg-bg-card border-b border-border">
                    <tr className="text-muted text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Transaction</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Items</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Total</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {salesData.length > 0 ? (
                      salesData.map((sale) => (
                        <tr key={sale.saleId} className="hover:bg-bg-card transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <p className="text-text font-bold text-xs sm:text-sm">
                              {new Date(sale.createdDate).toLocaleDateString()}
                            </p>
                            <p className="text-muted text-[8px] sm:text-[10px]">
                              {new Date(sale.createdDate).toLocaleTimeString()}
                            </p>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <FaShoppingBag className="text-muted" size={12} />
                              <p className="text-text font-bold text-xs sm:text-sm">{sale.itemCount} items</p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-black text-xs sm:text-sm text-text break-words">Rs {sale.totalAmount.toLocaleString()}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase whitespace-nowrap ${
                              sale.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setIsUpdateOpen(true);
                                }} 
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-bg-card text-text hover:text-white rounded-md sm:rounded-lg hover:bg-bg-primary flex items-center justify-center transition-all flex-shrink-0" 
                                title="Update Payment"
                              >
                                <FaEdit size={12} className="sm:w-3.5 sm:h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setIsReturnOpen(true);
                                }} 
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-bg-card text-text hover:text-white rounded-md sm:rounded-lg hover:bg-bg-primary flex items-center justify-center transition-all flex-shrink-0" 
                                title="Return/Exchange"
                              >
                                <FaExchangeAlt size={12} className="sm:w-3.5 sm:h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (!window.confirm("Are you sure you want to delete this sale?")) return;
                                  handleDelete(sale.saleId);
                                }} 
                                disabled={loading}
                                className="w-7 h-7 sm:w-8 sm:h-8 bg-bg-card text-red-500 rounded-md sm:rounded-lg hover:bg-red-500 hover:text-white flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-50" 
                                title="Delete"
                              >
                                <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-3 sm:px-6 py-4 text-center text-muted text-xs sm:text-sm">
                          No sales found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>

  <UpdateModel 
    isOpen={isUpdateOpen} 
    onClose={() => {
      setIsUpdateOpen(false);
      setSelectedSale(null);
    }}
    sale={selectedSale}
    onPaymentSuccess={loadCustomerData} 
  />
  <ReturnModel 
    isOpen={isReturnOpen} 
    onClose={() => {
      setIsReturnOpen(false);
      setSelectedSale(null);
    }}
    sale={selectedSale}
    onReturnSuccess={loadCustomerData} 
  />
</>
  );
};

export default ViewModel;