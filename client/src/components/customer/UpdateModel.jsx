import { useState } from 'react';
import { FaTimes, FaWallet } from 'react-icons/fa';
import { updateSale } from '../../services/api'; 
import { toast } from 'react-toastify';

const UpdateModel = ({ isOpen, onClose, sale, onPaymentSuccess }) => {
  if (!isOpen) return null;
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const remainingBalance = sale.totalAmount - sale.paidAmount;

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > remainingBalance) {
      toast.error(`Cannot pay more than remaining balance: Rs ${remainingBalance}`);
      return;
    }

    try {
      setLoading(true);
      
      const res = await updateSale(sale.saleId, {
        amountToPay: parseFloat(amount)
      });

      toast.success("Payment recorded successfully!");
      setAmount(""); 
      onClose(); 
      onPaymentSuccess();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to process payment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
  <div className="w-full max-w-sm bg-bg-card rounded-2xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
    
    <div className="p-4 sm:p-6 border-b border-border bg-bg-body flex justify-between items-center rounded-t-2xl sm:rounded-t-3xl gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-bg-primary text-white rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
          <FaWallet size={14} className="sm:w-4 sm:h-4" />
        </div>
        <h2 className="text-sm sm:text-lg font-black text-text truncate">Add Payment</h2>
      </div>
      <button 
        onClick={onClose} 
        className="p-2 hover:bg-bg-card rounded-full transition-all text-muted flex-shrink-0"
        aria-label="Close"
      >
        <FaTimes size={16} className="sm:w-5 sm:h-5" />
      </button>
    </div>

    <div className="p-4 sm:p-6 overflow-y-auto flex-1">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="p-3 sm:p-4 bg-bg-body rounded-lg sm:rounded-2xl border border-border">
          <p className="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total Bill</p>
          <p className="text-base sm:text-lg font-black text-text break-words">Rs {sale.totalAmount.toLocaleString()}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-lg sm:rounded-2xl border border-border bg-red-500/10">
          <p className="text-[8px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Remaining</p>
          <p className="text-base sm:text-lg font-black text-red-500 break-words">Rs {remainingBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="text-[8px] sm:text-[10px] font-black uppercase text-muted ml-1 mb-2 block tracking-widest">
            Amount to Receive
          </label>
          <div className="relative">
            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-black text-muted text-base sm:text-lg">Rs</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              max={remainingBalance}
              disabled={loading}
              className="w-full bg-bg-body border border-border p-3 sm:p-4 pl-10 sm:pl-12 rounded-lg sm:rounded-2xl font-black text-base sm:text-xl text-text focus:border-bg-primary outline-none transition-all placeholder:text-muted"
            />
          </div>
          {amount && parseFloat(amount) <= remainingBalance && (
            <p className="text-[8px] sm:text-[10px] text-green-500 mt-2 ml-1">✓ Valid amount</p>
          )}
        </div>

        <button 
          onClick={handlePayment}
          disabled={loading || !amount}
          className="w-full py-3 sm:py-4 bg-bg-primary text-white rounded-lg sm:rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all active:scale-95 shadow-xl"
        >
          {loading ? "Processing..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default UpdateModel;