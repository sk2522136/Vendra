import { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaPhoneAlt, FaHistory, FaUserTag, FaChevronRight } from 'react-icons/fa';
import ViewModel from '../components/customer/ViewModel';
import { getAllCustomers } from '../services/api';
import { toast } from 'react-toastify';

const Customer = () => {

  const [isModelOpen, setIsModelOpen] = useState(false);
 
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

  useEffect(() => {
    loadCustomers();
  }, [search, page, limit, sortBy, order]);

  const handleViewBtn = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsModelOpen(true);
  };

  return (
    // 'overflow-y-auto' kiya taake screen standard height le sake aur desktop par narrow feel na ho
    <div className="min-h-screen flex flex-col p-3 space-y-4 sm:space-y-6 sm:p-4 md:p-6 bg-bg-body overflow-y-auto">
        
      {/* Title and Description */}
      <div className="flex-shrink-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text uppercase">Customer Management</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">Efficiently manage your customers, track their payment status, and review account balances.</p>
      </div>
      
      {/* Stats Summary Card */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-bg-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold text-muted uppercase tracking-wider">Total credit Customer</p>
          <h3 className="text-lg sm:text-2xl font-black text-red-500 mt-1 break-words">Rs {stats.totalCreditAmount.toLocaleString()}</h3>
        </div>
        <div className="bg-bg-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-sm">
          <p className="text-[9px] sm:text-[11px] font-extrabold text-muted uppercase tracking-wider">Credit Customers</p>
          <h3 className="text-lg sm:text-2xl font-black text-text mt-1">{stats.creditCustomersCount}</h3>
        </div>
        <div className="bg-bg-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
          <p className="text-[9px] sm:text-[11px] font-extrabold text-muted uppercase tracking-wider">Total Outstanding Balance</p>
          <h3 className="text-lg sm:text-2xl font-black text-text mt-1 break-words">Rs {stats.totalOutstandingBalance.toLocaleString()}</h3>
        </div>
      </div>
     
      {/* Customers Table/Grid Container - Isme 'min-h-[450px]' add kiya hai taake table default me bada dikhe */}
      <div className="w-full bg-bg-card border border-border rounded-lg sm:rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[450px]">
        <div className='flex-shrink-0 p-3 sm:p-6 border-b border-border'>
          <div className="relative flex gap-2">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-muted flex-shrink-0" />
            <input 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); 
              }} 
              type="text" 
              placeholder="Search by name or phone..." 
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg sm:rounded-2xl border text-text text-xs sm:text-sm border-border outline-none focus:border-bg-primary transition-all bg-bg-body"
            />
          </div>
        </div>

        {customers.length === 0 ? (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
      <div className="text-4xl mb-2">👥</div>
      <p className="text-base font-bold text-text">No data available</p>
    </div>
  ) : (
    <>

        {/* MOBILE VIEW - CARD LAYOUT */}
        <div className="block md:hidden p-3 sm:p-4 space-y-3">
          {customers.map((c) => (
            <div key={c._id} className="bg-bg-body border border-border rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full text-text bg-bg-card border border-border flex items-center justify-center font-bold text-sm">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text text-sm truncate">{c.name}</p>
                  <p className="text-[10px] text-muted flex items-center gap-1"><FaPhoneAlt size={8}/> {c.phoneNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                <div>
                  <p className="text-muted font-bold">Type</p>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase inline-block ${
                    c.customerType === 'credit' ? 'bg-orange-500/10 text-orange-500' : 'bg-bg-card text-text'
                  }`}>
                    {c.customerType}
                  </span>
                </div>
                <div>
                  <p className="text-muted font-bold">Balance</p>
                  <p className={`font-bold ${c.currentBalance > 0 ? 'text-red-500' : 'text-text'}`}>
                    Rs {c.currentBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                    <p className="text-[9px] text-muted mb-2">
                      Last Payment: {c.lastPaymentDate ? new Date(c.lastPaymentDate).toLocaleDateString('en-PK') : 'No payments'}
                    </p>                
                    <button 
                  onClick={() => handleViewBtn(c._id)}
                  className="w-full p-2 text-white bg-bg-primary hover:opacity-90 rounded-lg transition-all text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                >
                  View <FaChevronRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW - TABLE LAYOUT (Isme automatic clean spaces di hain) */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-bg-body border-b border-border">
              <tr className="text-[11px] font-extrabold text-muted uppercase">
                <th className="px-6 py-4.5">Customer Details</th>
                <th className="px-6 py-4.5">Type</th>
                <th className="px-6 py-4.5">Balance</th>
                <th className="px-6 py-4.5">Last Payment</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr className="hover:bg-bg-body/50 transition-colors" key={c._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full text-text bg-bg-body border border-border flex items-center justify-center font-bold text-sm">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-text text-sm truncate">{c.name}</p>
                        <p className="text-[10px] text-muted flex items-center gap-1"><FaPhoneAlt size={8}/> {c.phoneNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap inline-block ${
                      c.customerType === 'credit' ? 'bg-orange-500/10 text-orange-500' : 'bg-bg-body text-text'
                    }`}>
                      {c.customerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    <span className={c.currentBalance > 0 ? 'text-red-500' : 'text-text'}>
                      Rs {c.currentBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text">
                    {c.lastPaymentDate ? new Date(c.lastPaymentDate).toLocaleDateString('en-PK') : 'No payments yet'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleViewBtn(c._id)}
                      className="px-3 py-2 text-white bg-bg-primary hover:opacity-90 rounded-lg transition-all text-[10px] font-bold uppercase inline-flex items-center gap-1"
                    >
                      View <FaChevronRight size={10} />
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

      {/* Pagination */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pt-2 pb-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-border bg-bg-card rounded-lg sm:rounded-xl text-text hover:bg-bg-primary hover:text-white disabled:opacity-40 transition-all flex-shrink-0"
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
                  ? "bg-bg-primary text-white border-bg-primary"
                  : "border-border bg-bg-card text-text hover:bg-bg-body"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-border bg-bg-card rounded-lg sm:rounded-xl text-text hover:bg-bg-primary hover:text-white disabled:opacity-40 transition-all flex-shrink-0"
        >
          ›
        </button>
      </div>
      
      <ViewModel
        isOpen={isModelOpen}
        onClose={() => {
          setIsModelOpen(false);
          loadCustomers();
        }}
        customerId={selectedCustomerId}
      />
    </div>  
   
      
  );
};

export default Customer;