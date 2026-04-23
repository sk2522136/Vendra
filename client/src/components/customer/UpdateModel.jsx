import { useState } from 'react';
import { FaTimes, FaWallet, FaCheckCircle, FaUser, FaInfoCircle } from 'react-icons/fa';

const UpdateModel = () => {
  const [amount, setAmount] = useState("");


  

  return (
    <div className="fixed inset-y-0 left-0 right-0 z-[120] flex items-center justify-center p-6">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        // onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-150 max-w-xxl
        bg-white rounded-3xl shadow-2xl overflow-hidden border border-border  animate-in zoom-in-95 duration-200">
        
        {/* Header with Icon */}
        <div className="p-8 border-border border-b   bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green/20">
              <FaWallet size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-800  tracking-tight">Add Payment</h2>
            </div>
          </div>
          <button  className="p-2 text-muted hover:text-red-500 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-10">
          {/* Amount Summary Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-5 bg-white rounded-2xl border border-border shadow-sm relative overflow-hidden group">
              
              <p className="text-[10px] font-black text-muted uppercase mb-1 tracking-widest">Total Bill</p>
              <p className="text-lg font-black text-text ">Rs </p>
            </div>
            <div className="p-5  rounded-2xl border border-border shadow-sm">
              <p className="text-[10px] font-black text-red-400 uppercase mb-1 tracking-widest">Remaining</p>
              <p className="text-lg font-black text-red-600 ">Rs </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-muted ml-4 mb-3 block tracking-widest">
                Amount to Receive
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-hint text-2xl ">Rs</div>
                <input 
                  type="number"
                  // value={amount}
                //   onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-card border-2 border-border p-6 pl-16 rounded-3xl font-black text-3xl text-text focus:border-green/100 focus:bg-white  focus:ring-green/500 outline-none transition-all placeholder:text-hint"
                />
              </div>
            </div>

            {/* Action Button */}
            <button 
              className="w-full py-6 bg-green rounded-3xl hover:bg-green-dark text-black hover:text-white font-bold cursor-pointer  "
            >
              <span className="relative z-10">Confirm Payment</span>
            </button>
            
            <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              {/* Secured Transaction • {new Date().toLocaleDateString()} */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateModel;