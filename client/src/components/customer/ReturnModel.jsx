import { useState } from 'react';
import { FaTimes, FaUndoAlt } from 'react-icons/fa';
import { processReturn } from '../../services/api';
import { toast } from 'react-toastify';

const ReturnModel = ({ isOpen, onClose, sale, onReturnSuccess }) => {
  if (!isOpen) return null;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !sale) return null;
  const firstItem = sale.items?.[0];
  const refundAmount = firstItem ? firstItem.sellPrice * quantity : 0;

  const handleReturn = async () => {
    if (!firstItem || quantity <= 0) {
      toast.error("Please select valid quantity");
      return;
    }

    if (quantity > firstItem.quantity) {
      toast.error(`Cannot return more than ${firstItem.quantity} items`);
      return;
    }

    try {
      setLoading(true);

      const res = await processReturn(sale.saleId, {
        saleId: sale.saleId,
        productId: firstItem.product,
        quantity: quantity
      });

      toast.success("Return processed successfully!");
      setQuantity(1); 
      onClose();
      onReturnSuccess(); 
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to process return";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        <div className="p-4 sm:p-6 flex justify-between items-center bg-gray-50 border-b border-gray-100 rounded-t-2xl sm:rounded-t-3xl gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FaUndoAlt size={14} className="sm:w-4 sm:h-4" />
            </div>
            <h2 className="text-sm sm:text-lg font-black text-black truncate">Return Items</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:bg-gray-200 rounded-full flex-shrink-0"
            aria-label="Close"
          >
            <FaTimes size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {firstItem && (
            <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-2xl border border-gray-100">
              <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Item</p>
              <p className="text-black font-black text-sm sm:text-base">Qty: {firstItem.quantity}</p>
              <p className="text-[8px] sm:text-[10px] text-gray-500 mt-1">Price: Rs {firstItem.sellPrice.toLocaleString()}</p>
            </div>
          )}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 ml-1 mb-3 block">Select Quantity</label>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg sm:rounded-2xl border border-gray-100 gap-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-xl shadow-sm font-black text-base sm:text-xl hover:bg-gray-100 transition-all flex-shrink-0"
                >
                  −
                </button>
                <span className="text-lg sm:text-2xl font-black text-black">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-lg sm:rounded-xl shadow-sm font-black text-base sm:text-xl hover:bg-gray-800 transition-all flex-shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-lg sm:rounded-2xl border border-gray-100 text-center bg-gray-50">
              <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Refund</p>
              <h3 className="text-base sm:text-2xl font-black text-black break-words">Rs {refundAmount.toLocaleString()}</h3>
            </div>

            <button 
              onClick={handleReturn}
              disabled={loading}
              className="w-full bg-black text-white p-3 sm:p-4 rounded-lg sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              {loading ? "Processing..." : "Confirm Return & Refund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModel;