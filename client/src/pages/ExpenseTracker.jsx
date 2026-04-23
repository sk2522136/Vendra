import React, { useState } from 'react';
import { FaPlus, FaFilter, FaMoneyBillWave, FaListUl } from 'react-icons/fa';
import AddExpenseModal from '../components/Expense/AddExpenseModal';

const ExpenseTracker = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses] = useState([
    { id: 1, date: "2026-04-22", desc: "Grocery", cat: "Food", pay: "Cash", amt: 5500 },
  ]);

  return (
    <div className="p-6 md:p-8 min-h-screen ">
      {/* 1. Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-3xl border border-border flex items-center gap-4">
           <div className="p-4 bg-green-light text-green rounded-2xl"><FaMoneyBillWave size={24}/></div>
           <div>
               <p className="text-muted text-xs font-bold uppercase">Total Expenses</p>
               <h2 className="text-2xl font-black text-text">Rs 125,400</h2>
           </div>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border flex items-center gap-4">
           <div className="p-4 bg-green-light text-green rounded-2xl"><FaListUl size={24}/></div>
           <div>
               <p className="text-muted text-xs font-bold uppercase">Total Transactions</p>
               <h2 className="text-2xl font-black text-text">48</h2>
           </div>
        </div>
      </div>

      {/* 2. Filter Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 bg-card p-2 rounded-2xl border border-border">
            <input type="date" className="p-2 bg-transparent outline-none text-sm text-text" />
            <button className="bg-green text-white px-4 py-2 rounded-xl text-xs font-bold">GET DATA</button>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-green text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-green-dark">
            <FaPlus /> Add Expense
        </button>
      </div>

      {/* 3. Table */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-sBack border-b border-border">
                <tr className="text-[12px] font-bold text-muted uppercase">
                    <th className="px-8 py-5">Date</th>
                    <th className="px-6 py-5">Description</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Method</th>
                    <th className="px-6 py-5 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {expenses.map((ex) => (
                    <tr key={ex.id} className="hover:bg-sBack/50">
                        <td className="px-8 py-4 text-xs font-bold text-text">{ex.date}</td>
                        <td className="px-6 py-4 text-sm font-bold text-text">{ex.desc}</td>
                        <td className="px-6 py-4 text-xs text-muted">{ex.cat}</td>
                        <td className="px-6 py-4 text-xs font-bold text-green">{ex.pay}</td>
                        <td className="px-6 py-4 text-right font-black text-text">Rs {ex.amt.toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ExpenseTracker;