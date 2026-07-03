import { useState, useEffect } from 'react';
import { FaTimes, FaUndoAlt } from 'react-icons/fa';
import { processReturn } from '../../services/api';
import { toast } from 'react-toastify';

const ReturnModel = ({ isOpen, onClose, sale, onReturnSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sale) {
      
    }
  }, [isOpen, sale]);

  useEffect(() => {
    setQuantity(1);
  }, [sale]);

  if (!isOpen || !sale) return null;

  const firstItem = sale.items?.[0];
  
  const targetProductId = 
    firstItem?.product?._id || 
    (typeof firstItem?.product === 'string' ? firstItem?.product : null) || 
    firstItem?.productId || 
    firstItem?.itemId;

  const targetProductName = 
    firstItem?.productName || 
    firstItem?.product?.name || 
    firstItem?.name ||
    'Selected Product';

  const maxAvailableQty = firstItem?.quantity || 0;
  const refundAmount = firstItem ? (firstItem.sellPrice || firstItem.price || 0) * quantity : 0;

  const handleReturn = async () => {
    if (!firstItem || !targetProductId) {
      console.error(" Validation Failed. firstItem:", firstItem, "targetProductId:", targetProductId);
      toast.error("Product Reference Missing");
      return;
    }

    if (quantity <= 0) {
      toast.error("Please select a valid quantity");
      return;
    }

    if (quantity > maxAvailableQty) {
      toast.error(`Cannot return more than ${maxAvailableQty} items`);
      return;
    }

    try {
      setLoading(true);
      const finalSaleId = sale.saleId || sale._id;

      await processReturn(finalSaleId, {
        saleId: finalSaleId,
        productId: targetProductId, 
        quantity: Number(quantity)
      });

      toast.success("Return processed successfully!");
      setQuantity(1); 
      onClose();
      onReturnSuccess(); 
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to process return";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-bg-card rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-border">
        
        <div className="p-4 sm:p-6 flex justify-between items-center bg-bg-body border-b border-border rounded-t-2xl sm:rounded-t-3xl gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-bg-primary text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FaUndoAlt size={14} className="sm:w-4 sm:h-4" />
            </div>
            <h2 className="text-sm sm:text-lg font-black text-text truncate">Return Item</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-muted hover:bg-bg-card hover:text-text rounded-full flex-shrink-0 transition-all"
          >
            <FaTimes size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {firstItem ? (
            <div className="mb-6 p-3 sm:p-4 bg-bg-body rounded-lg sm:rounded-2xl border border-border">
              <p className="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest mb-1">Product</p>
              <p className="text-text font-black text-sm sm:text-base truncate mb-2">{targetProductName}</p>
              <div className="flex justify-between items-center border-t border-border/60 pt-2 text-xs">
                <span className="text-muted">Available Qty: <strong className="text-text">{maxAvailableQty}</strong></span>
                <span className="text-muted">Rate: <strong className="text-text">Rs {(firstItem.sellPrice || firstItem.price || 0).toLocaleString()}</strong></span>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-xs text-center font-bold">
              No items found inside this sale object!
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="text-[8px] sm:text-[10px] font-black uppercase text-muted ml-1 mb-2 block">
                Select Return Quantity
              </label>
              <div className="flex items-center justify-between bg-bg-body p-2 rounded-lg sm:rounded-2xl border border-border gap-2">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-bg-card rounded-lg sm:rounded-xl shadow-sm font-black text-text text-base sm:text-xl border border-border"
                >
                  −
                </button>
                <span className="text-lg sm:text-2xl font-black text-text">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAvailableQty || 1, quantity + 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-bg-primary text-white rounded-lg sm:rounded-xl shadow-sm font-black text-base sm:text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-lg sm:rounded-2xl border border-border text-center bg-bg-body">
              <p className="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest mb-1">Estimated Refund</p>
              <h3 className="text-base sm:text-2xl font-black text-emerald-600 break-words">Rs {refundAmount.toLocaleString()}</h3>
            </div>

            <button 
              onClick={handleReturn}
              disabled={loading || !firstItem || !targetProductId}
              className="w-full bg-bg-primary text-white p-3 sm:p-4 rounded-lg sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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