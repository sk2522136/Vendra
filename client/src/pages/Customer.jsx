import { useState,useEffect } from 'react';
import { FaUserPlus, FaSearch, FaPhoneAlt, FaHistory, FaUserTag, FaChevronRight } from 'react-icons/fa';
import ViewModel from '../components/customer/ViewModel';
import { getAllCustomers } from '../services/api';
import { toast } from 'react-toastify';

const Customer = () => {

  const [isModelOpen , setIsModelOpen]=useState(false)
 
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
  totalCreditAmount: 0,
  creditCustomersCount: 0,
  totalOutstandingBalance: 0
});

const loadCustomers = async () => {
  try {
    setLoading(true);
    const res = await getAllCustomers({ search, page, limit, sortBy, order });

    setCustomers(res.data.customers);
    setTotalPages(res.data.totalPages); 
    setPage(res.data.page);
    
    let creditTotal = 0;
    let creditCount = 0;
    let outstandingTotal = 0;

    res.data.customers.forEach(c => {
      if (c.customerType === 'credit') {
        creditCount++;
        outstandingTotal += c.currentBalance;
        creditTotal += c.currentBalance;
      }
    });

    setStats({
      totalCreditAmount: creditTotal,
      creditCustomersCount: creditCount,
      totalOutstandingBalance: outstandingTotal
    });

  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch products";
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
    });
  } finally {
    setLoading(false);
  }
};

    useEffect(()=>{
       loadCustomers();
     },[search, page, limit, sortBy, order])


  const handleViewBtn = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsModelOpen(true)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen overflow-y-auto space-y-6 sm:space-y-8 bg-bg-mainCard rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm">
      
      {/* Title and Description */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text">Customer Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Efficiently manage your customers, track their payment status, and review account balances.</p>
      </div>
      
      {/* Stats Summary Card - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold text-black uppercase tracking-wider">Total credit Customer</p>
          <h3 className="text-lg sm:text-2xl font-black text-red-500 mt-1 break-words">Rs {stats.totalCreditAmount.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold text-black uppercase tracking-wider">Credit Customers</p>
          <h3 className="text-lg sm:text-2xl font-black text-text mt-1">{stats.creditCustomersCount}</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
          <p className="text-[9px] sm:text-[11px] font-extrabold text-black uppercase tracking-wider">Total Outstanding Balance</p>
          <h3 className="text-lg sm:text-2xl font-black text-black mt-1 break-words">Rs {stats.totalOutstandingBalance.toLocaleString()}</h3>
        </div>
      </div>
     
      {/* Customers Table/Grid */}
      <div className="bg-white border border-gray-100 rounded-lg sm:rounded-3xl overflow-hidden custom-scrollbar shadow-sm">
        <div className='p-3 sm:p-6 border-b border-gray-100'>
          <div className="relative flex gap-2">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-black/50 flex-shrink-0" />
            <input 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); 
              }} 
              type="text" 
              placeholder="Search by name or phone..." 
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-2xl border text-black text-xs sm:text-sm border-gray-100 outline-none focus:border-black transition-all bg-gray-50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-full sm:min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-[9px] sm:text-[11px] font-extrabold text-black uppercase">
                <th className="px-3 sm:px-6 py-3 sm:py-4">Customer Details</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Type</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Balance</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Last Payment</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr className="hover:bg-gray-50 transition-colors group" key={c._id}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-black bg-icon/20 text-green flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text text-xs sm:text-sm truncate">{c.name}</p>
                        <p className="text-[8px] sm:text-[10px] text-black flex items-center gap-1 truncate"><FaPhoneAlt size={8}/> {c.phoneNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                      c.customerType === 'credit' ? 'bg-orange-100 text-orange-600' : 'bg-black/10 text-black'
                    }`}>
                      {c.customerType}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-xs sm:text-sm hidden md:table-cell">
                    <span className={c.currentBalance > 0 ? 'text-red-500' : 'text-text'}>
                      Rs {c.currentBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-black font-medium hidden lg:table-cell">
                    {c.lastPaymentDate || 'No payments yet'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <button 
                      onClick={() => handleViewBtn(c._id)}
                      className="p-1.5 sm:p-2 text-white bg-black hover:bg-gray-800 rounded-md sm:rounded-lg transition-all text-[8px] sm:text-[10px] font-bold uppercase inline-flex items-center gap-1 whitespace-nowrap"
                      title="View History"
                    >
                      View <FaChevronRight size={10} className="hidden sm:inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Responsive */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 overflow-x-auto pb-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200 bg-black rounded-lg sm:rounded-xl text-white hover:bg-white hover:text-black disabled:opacity-40 transition-all flex-shrink-0"
        >
          ‹
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          const isCurrentPage = page === pageNumber;
          const isNearby = Math.abs(pageNumber - page) <= 1;
          
          if (!isCurrentPage && !isNearby && totalPages > 5) return null;

          return (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
                isCurrentPage
                  ? "bg-black text-white border-black"
                  : "border-gray-200 text-black hover:bg-gray-50"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200 bg-black rounded-lg sm:rounded-xl text-white hover:bg-white hover:text-black disabled:opacity-40 transition-all flex-shrink-0"
        >
          ›
        </button>
      </div>
      
      <ViewModel
        isOpen={isModelOpen}
        onClose={() => setIsModelOpen(false)} 
        customerId={selectedCustomerId}
      />
    </div>
  );
};

export default Customer;