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

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    setSelectedMonth(date.getMonth() + 1);
    setSelectedYear(date.getFullYear());
  };


return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen overflow-y-auto custom-scrollbar space-y-6 sm:space-y-8 bg-bg-body rounded-2xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text uppercase tracking-tight">
            Expense Tracker
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-bg-card p-4 sm:p-6 rounded-3xl border border-border flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-bg-body text-text rounded-2xl flex-shrink-0">
            <FaMoneyBillWave size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-muted uppercase tracking-wider">Total Expenses</p>
            <h3 className="text-lg sm:text-2xl font-black text-text mt-1 break-words">
              Rs {stats.totalExpenses.toLocaleString()}
            </h3>
          </div>
        </div>
        
        <div className="bg-bg-card p-4 sm:p-6 rounded-3xl border border-border flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-bg-body text-text rounded-2xl flex-shrink-0">
            <FaListUl size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-muted uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-lg sm:text-2xl font-black text-text mt-1">{stats.totalTransactions}</h3>
          </div>
        </div>
      </div>

      {/* Controls & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row gap-2 bg-bg-card p-2 rounded-2xl border border-border w-full sm:w-auto">
          <input 
            type="date"  
            onChange={handleDateChange} 
            className="p-3 bg-transparent outline-none text-sm font-bold text-text flex-1" 
          />
          <button 
            onClick={handleGetData}
            className="bg-bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
          >
            {loading ? "Loading..." : "Get Data"}
          </button>        
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <FaPlus size={12} /> <span>Add Expense</span>
        </button>
      </div>

      {/* Data Container (Cards for Mobile / Table for Desktop) */}
      <div className="bg-bg-card border border-border rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted text-sm font-bold animate-pulse">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm font-bold">
            No expenses found for this period
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (Cards View) */}
            <div className="md:hidden divide-y divide-border p-4 space-y-4">
              {expenses.map((ex) => (
                <div key={ex.id} className="bg-bg-body p-4 rounded-2xl border border-border space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-text">{ex.description}</h4>
                      <p className="text-[11px] text-muted font-bold mt-0.5">
                        {new Date(ex.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-black text-text whitespace-nowrap bg-bg-card px-3 py-1 rounded-xl border border-border">
                      Rs {ex.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="font-bold text-text bg-bg-card px-2.5 py-1 rounded-lg border border-border/60">
                      {ex.category}
                    </span>
                    <span className="font-black text-text uppercase text-[11px] tracking-wider">
                      {ex.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW (Table View) */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-bg-body border-b border-border">
                  <tr className="text-[11px] text-muted font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((ex) => (
                    <tr key={ex.id} className="hover:bg-bg-body transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-text whitespace-nowrap">
                        {new Date(ex.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text">{ex.description}</td>
                      <td className="px-6 py-4 text-sm text-text">{ex.category}</td>
                      <td className="px-6 py-4 text-sm font-black text-text">{ex.paymentMethod}</td>
                      <td className="px-6 py-4 text-right font-black text-text text-sm whitespace-nowrap">
                        Rs {ex.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddExpenseModal
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onExpenseAdded={() => loadExpenses(selectedMonth, selectedYear)} 
        />
      )}
    </div>
  );
};

export default ExpenseTracker;