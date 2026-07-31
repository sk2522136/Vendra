import { useState, useEffect } from 'react';
import { FaTimes, FaUndoAlt } from 'react-icons/fa';
import { processReturn } from '../../services/api';
import { toast } from 'react-toastify';

const ReturnModel = ({ isOpen, onClose, sale, onReturnSuccess }) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setSelectedItemIndex(0);
  }, [sale, isOpen]);

  if (!isOpen || !sale) return null;

  const itemsList = sale.items || [];
  const currentItem = itemsList[selectedItemIndex];

  const grossSubtotal = itemsList.reduce((acc, item) => {
    const rate = item.sellPrice || item.price || 0;
    const qty = item.quantity || 0;
    return acc + (rate * qty);
  }, 0);

  const discountRatio = grossSubtotal > 0 ? (sale.discount || 0) / grossSubtotal : 0;

  const targetProductId = 
    currentItem?.product?._id || 
    (typeof currentItem?.product === 'string' ? currentItem?.product : null) || 
    currentItem?.productId || 
    currentItem?.itemId;

  const targetProductName = 
    currentItem?.productName || 
    currentItem?.product?.name || 
    currentItem?.name ||
    'Selected Product';

  const maxAvailableQty = currentItem?.quantity || 0;
  const originalUnitPrice = currentItem ? (currentItem.sellPrice || currentItem.price || 0) : 0;
  
  const effectiveUnitPrice = originalUnitPrice * (1 - discountRatio);
  const refundAmount = effectiveUnitPrice * quantity;

  const handleReturn = async () => {
    if (!currentItem || !targetProductId) {
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
        
        {/* Header */}
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
          {itemsList.length > 0 ? (
            <div className="space-y-3 mb-6">
              {itemsList.length > 1 && (
                <div>
                  <label className="text-[8px] sm:text-[10px] font-black uppercase text-muted ml-1 mb-1 block">
                    Select Product To Return
                  </label>
                  <select 
                    value={selectedItemIndex}
                    onChange={(e) => {
                      setSelectedItemIndex(Number(e.target.value));
                      setQuantity(1);
                    }}
                    className="w-full bg-bg-body p-2 rounded-xl border border-border text-xs font-bold text-text mb-2"
                  >
                    {itemsList.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {item?.product?.name || item?.productName || `Item #${idx+1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 sm:p-4 bg-bg-body rounded-lg sm:rounded-2xl border border-border">
                <p className="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest mb-1">Product</p>
                <p className="text-text font-black text-sm sm:text-base truncate mb-2">{targetProductName}</p>
                
                <div className="flex justify-between items-center border-t border-border/60 pt-2 text-xs">
                  <span className="text-muted">Available Qty: <strong className="text-text">{maxAvailableQty}</strong></span>
                  <span className="text-muted">Orig. Rate: <strong className="text-text">Rs {originalUnitPrice.toLocaleString()}</strong></span>
                </div>

                {sale.discount > 0 && (
                  <div className="mt-2 text-[10px] text-amber-600 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-center font-bold">
                    Effective Rate (After Discount): Rs {effectiveUnitPrice.toFixed(2)}
                  </div>
                )}
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
              <h3 className="text-base sm:text-2xl font-black text-emerald-600 break-words">
                Rs {refundAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </h3>
            </div>

            <button 
              onClick={handleReturn}
              disabled={loading || !currentItem || !targetProductId}
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