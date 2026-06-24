import React from "react";
import { FiShoppingCart, FiSave, FiTrash2, FiMinus, FiPlus } from "react-icons/fi";

const CartSection = ({ cart, savedCarts, saveCart, loadSavedCart, deleteSavedCart, increaseQty, decreaseQty, removeFromCart }) => {
  return (
    <div className="flex flex-col flex-1 min-h-[200px] overflow-hidden">
      {/* Receipt Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-bg-primary to-bg-secondary flex justify-between items-center shrink-0 rounded-t-2xl">
        <div className="flex items-center gap-2.5 text-white">
          <FiShoppingCart size={18} />
          <div>
            <h2 className="font-black uppercase text-sm tracking-wide">cart</h2>
            <p className="text-[11px] opacity-80 font-medium">{cart.length} items</p>
          </div>
        </div>
        <button 
          onClick={saveCart}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1 shadow-sm"
        >
          <FiSave size={13} /> save bill
        </button>
      </div>

      {/* Hold Carts Slider */}
      {savedCarts.length > 0 && (
        <div className="px-3 py-2 border-b border-border bg-hover flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {savedCarts.map((sc) => (
            <div key={sc.id} className="bg-bg-card border border-border rounded-lg p-1.5 flex items-center gap-2 text-xs shadow-xs min-w-max">
              <span className="font-bold text-text">{sc.name}</span>
              <button onClick={() => loadSavedCart(sc)} className="text-[10px] font-bold text-bg-primary hover:underline">Apply</button>
              <button onClick={() => deleteSavedCart(sc.id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={11} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Items Logger Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2.5 bg-gray-50/50">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-12">
            <FiShoppingCart size={36} className="text-muted mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted">No items selected</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.productId} className="bg-bg-card border border-border rounded-xl p-3 shadow-xs flex items-center justify-between gap-2 transition-all hover:border-gray-300">
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-text uppercase truncate mb-0.5">{item.name}</h4>
                <p className="text-xs font-black text-bg-primary">Rs {item.price.toLocaleString()} <span className="text-[10px] text-muted font-normal">/ unit</span></p>
              </div>
              
              <div className="flex items-center gap-1.5 bg-hover rounded-lg p-1 shrink-0">
                <button onClick={() => decreaseQty(item.productId)} className="w-6 h-6 rounded-md bg-bg-card flex items-center justify-center border text-text"><FiMinus size={11} /></button>
                <span className="font-bold text-xs text-text w-5 text-center select-none">{item.qty}</span>
                <button onClick={() => increaseQty(item.productId)} className="w-6 h-6 rounded-md bg-bg-card flex items-center justify-center border text-text"><FiPlus size={11} /></button>
              </div>

              <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 p-1 shrink-0"><FiTrash2 size={14} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartSection;