import React, { useState } from 'react';
import StockPage from '../components/inventory/Stock.jsx';
import ProductCards from '../components/inventory/ProductCards.jsx';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock');

  return (
    <div className="p-4 md:p-6 rounded-3xl bg-bg-body overflow-y-auto custom-scrollbar">
            <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-bg-primary to-bg-secondary shadow-lg">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Inventory Management</h1>
      </div>
      <div className="flex gap-2 mb-8 bg-bg-card p-1.5 rounded-2xl border border-border w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${activeTab === 'stock' ? 'bg-bg-primary text-white' : 'text-text hover:bg-hover'}`}
        >
          Stock Status
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${activeTab === 'log' ? 'bg-bg-primary text-white' : 'text-text hover:bg-hover'}`}
        >
          Inventory Log
        </button>
      </div>
      <div className="h-full">
        {activeTab === 'stock' ? <StockPage /> : <ProductCards />}
      </div>
    </div>
  );
};

export default Inventory;