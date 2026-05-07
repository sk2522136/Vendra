import { useState,useEffect } from 'react';
import { FaPlus, FaMoneyBillWave, FaListUl } from 'react-icons/fa';
import AddExpenseModal from '../components/Expense/AddExpenseModal';
import { getExpenses } from '../services/api'; 
import { toast } from 'react-toastify';

const ExpenseTracker = () => {
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalTransactions: 0,
    categoryWise: {}
  });

  const loadExpenses = async (month = selectedMonth, year = selectedYear) => {
    try {
      setLoading(true);
      const res = await getExpenses({ month, year }); 
      
      
      setExpenses(res.data.expenses);
      setStats({
        totalExpenses: res.data.totalExpenses,
        totalTransactions: res.data.totalExpenseCount,
        categoryWise: res.data.categoryWise
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load expenses";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleGetData = (e) => {
    e.preventDefault();
    loadExpenses(selectedMonth, selectedYear);
  };

  // Handle month/year change
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    setSelectedMonth(date.getMonth() + 1);
    setSelectedYear(date.getFullYear());
  };


  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen overflow-y-auto space-y-6 sm:space-y-8 bg-bg-mainCard rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm">
      
      {/* 1. Header & Description */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text">Expense Tracker</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Monitor your daily expenses and transaction history.</p>
        </div>
      </div>

      {/* 2. Stats Section - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
           <div className="p-3 sm:p-4 bg-gray-50 text-black rounded-lg sm:rounded-2xl flex-shrink-0"><FaMoneyBillWave size={16} className="sm:w-5 sm:h-5"/></div>
           <div className="min-w-0 flex-1">
               <p className="text-[9px] sm:text-[11px] font-extrabold text-black uppercase tracking-wider">Total Expenses</p>
               <h3 className="text-lg sm:text-2xl font-black text-text mt-1 break-words">Rs {stats.totalExpenses.toLocaleString()}</h3>
           </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
           <div className="p-3 sm:p-4 bg-gray-50 text-black rounded-lg sm:rounded-2xl flex-shrink-0"><FaListUl size={16} className="sm:w-5 sm:h-5"/></div>
           <div className="min-w-0 flex-1">
               <p className="text-[9px] sm:text-[11px] font-black text-black uppercase tracking-wider">Total Transactions</p>
               <h3 className="text-lg sm:text-2xl font-black text-black mt-1">
                 {stats.totalTransactions}
               </h3>
           </div>
        </div>
      </div>

      {/* 3. Filter Section - Responsive Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row gap-2 bg-gray-50 p-2 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto">
            <input 
              type="date"  
              onChange={handleDateChange} 
              className="p-2 sm:p-3 bg-transparent outline-none text-xs sm:text-sm font-bold text-text flex-1 sm:flex-initial" 
            />
            <button 
              onClick={handleGetData}
              className="bg-black text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all whitespace-nowrap"
            >
              {loading ? "Loading..." : "Get Data"}
            </button>        
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-black text-white px-4 sm:px-6 py-3 sm:py-3 rounded-lg sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
        >
            <FaPlus size={12} className="flex-shrink-0" /> <span>Add Expense</span>
        </button>
      </div>

      {/* 4. Table - Responsive with horizontal scroll on mobile */}
      <div className="bg-white border border-gray-100 rounded-lg sm:rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-full sm:min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-[9px] sm:text-[11px] text-black font-extrabold uppercase tracking-wider">
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Date</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4">Description</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Category</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Method</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Amount</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {loading ? (
                <tr>
                  <td colSpan="5" className="px-3 sm:px-6 py-4 text-center text-gray-400 text-xs sm:text-sm">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                  expenses.map((ex) => (
                      <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-text whitespace-nowrap">{new Date(ex.date).toLocaleDateString()}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-text break-words">
                            <div className="max-w-[120px] sm:max-w-none">{ex.description}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs text-text hidden md:table-cell">{ex.category}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-black text-black hidden lg:table-cell">{ex.paymentMethod}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-black text-text text-xs sm:text-sm whitespace-nowrap">Rs {ex.amount.toLocaleString()}</td>
                      </tr>

                  
                  ))
                ):(
                  <tr>
                  <td colSpan="5" className="px-3 sm:px-6 py-4 text-center text-gray-400 text-xs sm:text-sm">
                    No expenses found for this period
                  </td>
                </tr>
            )}
              </tbody>
          </table>
        </div>
      </div>

         <AddExpenseModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onExpenseAdded={() => loadExpenses(selectedMonth, selectedYear)} 
      />    
      </div>
  );
};

export default ExpenseTracker;