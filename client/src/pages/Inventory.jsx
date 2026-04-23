import React, { useState } from 'react';
import StockPage from '../components/inventory/Stock.jsx';
import LogPage from '../components/inventory/AddLog.jsx';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'log'

  return (
    <div className="p-4 md:p-8 min-h-screen bg-bg">
      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-8 bg-card p-2 rounded-2xl border border-border w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${activeTab === 'stock' ? 'bg-green text-white' : 'text-muted'}`}
        >
          Stock Status
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${activeTab === 'log' ? 'bg-green text-white' : 'text-muted'}`}
        >
          Inventory Log
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === 'stock' ? <StockPage /> : <LogPage />}
    </div>
  );
};

export default Inventory;