import { useState, useEffect } from 'react';
import { FaTimes, FaUndoAlt, FaBox } from 'react-icons/fa';

const ReturnModal = () => {
  const [quantity, setQuantity] = useState(1);
  const [refundAmount, setRefundAmount] = useState(0);

  


  return (
    <div className="fixed inset-y-0 left-0 right-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" ></div>
      
      <div className="relative w-100   bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        <div className="p-8 flex justify-between items-center bg-gray-50/50 border-b border-border">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green text-white rounded-xl flex items-center justify-center shadow-lg ">
                <FaUndoAlt size={14} />
             </div>
             <h2 className="text-xl font-black text-text italic">Return Items</h2>
          </div>
          <button  className="p-2 text-muted "><FaTimes /></button>
        </div>

        <div className="p-8">
         

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-muted ml-2 mb-3 block">Select Return Quantity</label>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-[2rem] border border-border">
                <button 
                //   onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 bg-white rounded-full shadow-md font-black text-xl hover:bg-gray-100 transition-all"
                >-</button>
                <span className="text-3xl font-black text-text"></span>
                <button 
                  onClick={() => setQuantity(Math.min(selectedSale.itemCount, quantity + 1))}
                  className="w-14 h-14 bg-green text-white rounded-full shadow-md font-black text-xl hover:bg-green-dark transition-all"
                >+</button>
              </div>
            </div>

            <div className="p-6 rounded-3xl  border border-orange-100 text-center">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Estimated Refund</p>
              <h3 className="text-2xl font-black">Rs </h3>
            </div>

            <button 
            //   onClick={handleReturn}
              className="w-full bg-green text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl  hover:bg-green-dark  hover:-translate-y-1 active:scale-95 transition-all"
            >
              Confirm Return & Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;