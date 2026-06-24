import React from "react";
import { FiUser, FiPercent, FiFileText, FiDollarSign, FiCreditCard } from "react-icons/fi";
import { CardElement } from "@stripe/react-stripe-js";

const CheckoutForm = ({ 
  customerName, setCustomerName, customerPhone, setCustomerPhone, 
  discount, setDiscount, notes, setNotes, paymentMethod, setPaymentMethod, 
  subtotal, totalAmount, isProcessingPayment, completeSale 
}) => {
  
  return (
    <div className="p-3 sm:p-4 border-t border-border bg-bg-card space-y-3 shrink-0 pb-6 sm:pb-4 w-full rounded-b-2xl">
      {/* Customer Form Inputs */}
      <div className="bg-hover rounded-xl p-2.5 sm:p-3 space-y-2.5 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted uppercase tracking-wider pb-1.5 border-b border-border/40">
          <FiUser size={12} /> Customer Verification Ledger
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted uppercase">Customer Name *</label>
            <input
              type="text"
              placeholder="e.g. Sahil Kumar"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-bg-card border border-border text-xs rounded-lg px-2.5 py-2 outline-none font-medium focus:border-bg-primary focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted uppercase">Phone Number *</label>
            <input
              type="text"
              maxLength={11}
              placeholder="03001234567"
              value={customerPhone}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^0-9]/g, '');
                if (clean.length <= 11) setCustomerPhone(clean);
              }}
              className="w-full bg-bg-card border border-border text-xs rounded-lg px-2.5 py-2 outline-none font-medium focus:border-bg-primary focus:bg-white font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted uppercase flex items-center gap-1"><FiPercent size={10} /> Bill Discount</label>
            <input
              type="number"
              placeholder="Rs 0"
              value={discount || ""}
              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-bg-card border border-border text-xs rounded-lg px-2.5 py-2 outline-none font-medium focus:border-bg-primary focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted uppercase flex items-center gap-1"><FiFileText size={10} /> Sale Note</label>
            <input
              type="text"
              placeholder="Internal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-bg-card border border-border text-xs rounded-lg px-2.5 py-2 outline-none font-medium focus:border-bg-primary focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Methods Matrix */}
      <div className="grid grid-cols-3 gap-1.5">
        {['cash', 'credit', 'card'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setPaymentMethod(type)}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all capitalize ${paymentMethod === type ? "bg-gradient-to-r from-bg-primary to-bg-secondary text-white shadow-sm" : "bg-bg-body border border-border hover:bg-hover"}`}
          >
            {type === "cash" && <FiDollarSign size={13} />}
            {type === "credit" && <FiUser size={13} />}
            {type === "card" && <FiCreditCard size={13} />}
            {type}
          </button>
        ))}
      </div>

      
      {/* Financial Matrix Summary Totals */}
      <div className="bg-hover border border-border rounded-xl p-3 space-y-1.5 text-xs font-medium">
        <div className="flex justify-between items-center text-muted">
          <span>Subtotal Amount:</span>
          <span className="font-bold">Rs {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-red-500">
          <span>Applied Discount:</span>
          <span className="font-bold">- Rs {discount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border/60 text-black">
          <span className="font-bold uppercase text-[10px] tracking-wider text-muted">Net Payable</span>
          <span className="text-lg font-black text-bg-primary">Rs {totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Trigger Button */}
      <button
        onClick={completeSale}
        disabled={isProcessingPayment}
        className="w-full py-3.5 bg-gradient-to-r from-bg-primary to-bg-secondary text-white font-black rounded-xl text-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-40 shadow-md flex items-center justify-center relative z-20 cursor-pointer"
      >
        {isProcessingPayment ? "Processing POS Transaction..." : ` ${paymentMethod.toUpperCase()} Checkout`}
      </button>
    </div>
  );
};

export default CheckoutForm;