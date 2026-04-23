import React, { useState } from 'react';
import { FiSearch, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCreditCard, FiDollarSign, FiFilter } from "react-icons/fi";

const Pos = () => {
  // 1. Dummy Data with Categories
  const [products] = useState([
    { id: 1, name: "Premium Basmati Rice", price: 450, stock: 45, category: "Grocery", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
    { id: 2, name: "Cooking Oil 5L", price: 1800, stock: 12, category: "Oil", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
    { id: 3, name: "Organic Wheat Flour", price: 550, stock: 20, category: "Grocery", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
    { id: 4, name: "Dairy Milk Chocolate", price: 100, stock: 100, category: "Snacks", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
    { id: 5, name: "Green Tea Pack", price: 320, stock: 15, category: "Beverages", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
    { id: 6, name: "Fresh Apple 1kg", price: 250, stock: 30, category: "Fruits", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
    { id: 7, name: "Coca Cola 1.5L", price: 150, stock: 50, category: "Beverages", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
    { id: 8, name: "Maggi Noodles", price: 60, stock: 80, category: "Snacks", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" } },
  ]);

  const [cart, setCart] = useState([
    { id: 1, name: "Premium Basmati Rice", price: 450, qty: 1 },
    { id: 4, name: "Dairy Milk Chocolate", price: 100, qty: 2 },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-screen lg:h-screen p-3 lg:p-6 overflow-x-hidden lg:overflow-hidden items-start">
      
      {/* Left Pane - Product Grid (Height matched with Cart) */}
      <div className="flex-1 w-full lg:h-[88%] flex flex-col bg-white border border-b border-gray-200 rounded-3xl p-4 lg:p-5 overflow-hidden shadow-sm">
        
        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row gap-3 lg:gap-4 mb-4 lg:mb-6 shrink-0">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 lg:py-3.5 focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-all text-sm"
            />
          </div>
          
          <div className="relative w-50 ">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-green" size={16} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 lg:py-3.5 appearance-none focus:outline-none focus:border-green font-bold text-sm cursor-pointer shadow-sm"
            >
              <option value="All">All Categories</option>
              <option value="Grocery">Grocery</option>
              <option value="Oil">Oil</option>
              <option value="Snacks">Snacks</option>
              <option value="Beverages">Beverages</option>
              <option value="Fruits">Fruits</option>
            </select>
          </div>
        </div>

        {/* Product Grid - Yeh section scroll karega */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 lg:pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {products.map(p => (
              <div 
                key={p.id} 
                className="bg-white border border-gray-200 rounded-2xl p-3 lg:p-4 cursor-pointer group active:scale-95 hover:border-green hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="h-20 lg:h-24 bg-gray-50 rounded-xl mb-3 flex items-center justify-center border border-gray-100 relative">
                   <img src={p.image.url} alt={p.name} className="w-full rounded-xl h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                   <span className="absolute top-1 right-1 lg:top-2 lg:right-2 text-[7px] lg:text-[8px] bg-white px-1.5 py-0.5 rounded-md border border-gray-200 font-black text-gray-400 uppercase tracking-tighter">{p.category}</span>
                </div>
                <h4 className="font-bold text-gray-800 truncate text-[10px] lg:text-xs uppercase tracking-tight">{p.name}</h4>
                <div className="mt-1 lg:mt-2 flex items-center justify-between">
                  <span className="text-green font-black text-xs lg:text-sm">Rs {p.price}</span>
                  <div className="w-6 h-6 lg:w-7 lg:h-7 bg-green/10 text-green rounded-lg flex items-center justify-center group-hover:bg-green group-hover:text-white transition-all">
                    <FiPlus size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Cart (Height 88%) */}
      <div className="w-full lg:w-85 flex flex-col shrink-0 lg:h-[88%]">
        <div className="flex flex-col h-125 lg:h-full bg-white border border-gray-200 rounded-4xl lg:rounded-[2.5rem] shadow-xl overflow-hidden w-full">
          
          {/* Cart Header */}
          <div className="p-4 lg:p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-green rounded-xl shadow-lg shadow-green/20">
              <FiShoppingCart className="text-white" size={18} />
            </div>
            <div>
              <h2 className="font-black text-gray-800 text-sm uppercase tracking-tighter leading-none">My Cart</h2>
              <p className="text-[9px] text-gray-400 font-bold">{cart.length} ITEMS SELECTED</p>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-5 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 lg:gap-3 bg-white p-3 rounded-2xl border border-gray-100 hover:border-green/30 transition-colors shadow-sm">
                <div className="flex-1 min-w-0">
                  <h5 className="text-gray-800 text-[10px] lg:text-[11px] font-black truncate uppercase leading-none">{item.name}</h5>
                  <p className="text-green font-bold text-[10px] lg:text-xs mt-1">Rs {item.price}</p>
                </div>
                
                <div className="flex items-center gap-1.5 lg:gap-2 bg-gray-50 rounded-lg border border-gray-200 p-1">
                  <button className="p-0.5 hover:text-red-500 transition-colors"><FiMinus size={10} /></button>
                  <span className="text-gray-800 font-black text-[10px] lg:text-xs w-3 text-center">{item.qty}</span>
                  <button className="p-0.5 hover:text-green transition-colors"><FiPlus size={10} /></button>
                </div>
                
                <button className="p-1 text-gray-300 hover:text-red-500 transition-all">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Details */}
          <div className="p-5 lg:p-6 border-t border-gray-100 bg-gray-50 rounded-t-[2.5rem] lg:rounded-t-[3rem] shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-3">
              <input type="text" placeholder="Name" className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[10px] lg:text-xs w-full focus:border-green outline-none shadow-sm" />
              <input type="text" placeholder="Phone" className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[10px] lg:text-xs w-full focus:border-green outline-none shadow-sm" />
            </div>

            <div className="flex gap-2 mb-3">
               <button className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border-2 border-green bg-green text-white shadow-md active:scale-95">
                  <FiDollarSign size={14} /> Cash
               </button>
               <button className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 active:scale-95">
                  <FiCreditCard size={14} /> Credit
               </button>
            </div>

            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-gray-400 text-[9px] font-black uppercase px-1">
                <span>Subtotal</span>
                <span>Rs {subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-gray-800 pt-1 border-t border-dashed border-gray-300 px-1">
                <span className="font-black text-[10px] uppercase tracking-widest">Total</span>
                <span className="text-xl lg:text-2xl font-black text-green tracking-tighter leading-none">Rs {subtotal}</span>
              </div>
            </div>

            <button className="w-full bg-green hover:bg-green-700 text-white py-3 lg:py-4 rounded-2xl text-[10px] lg:text-xs font-black shadow-lg shadow-green/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;