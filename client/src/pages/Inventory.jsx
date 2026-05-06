import React, { useState } from 'react';
import StockPage from '../components/inventory/Stock.jsx';
import ProductCards from '../components/inventory/ProductCards.jsx';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock');

  return (
    <div className="p-4 md:p-8 h-[98vh] rounded-2xl bg-bg-mainCard overflow-y-auto">
      
      {/* Page Title & Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-black uppercase tracking-tight">Inventory Management</h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Monitor real-time stock status and review your transaction logs.</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-100 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${activeTab === 'stock' ? 'bg-bg-sidebar text-white' : 'text-text hover:bg-gray-50'}`}
        >
          Stock Status
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${activeTab === 'log' ? 'bg-bg-sidebar text-white' : 'text-text hover:bg-gray-50'}`}
        >
          Inventory Log
        </button>
      </div>

      {/* Content */}
      <div className="h-full">
{activeTab === 'stock' ? <StockPage /> : <ProductCards />}      </div>
    </div>
  );
};

export default Inventory;