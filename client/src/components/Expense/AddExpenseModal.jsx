import React from 'react';
import ActionModal from '../ActionModal';
const AddExpenseModal = ({ isOpen, onClose }) => {
  return (
    <ActionModal isOpen={isOpen} onClose={onClose} title="Add New Expense">
      <form className="space-y-4">
        <input type="number" placeholder="Amount (Rs)" className="w-full p-3 rounded-xl bg-sBack border border-border outline-none focus:border-green" />
        <input type="text" placeholder="Description" className="w-full p-3 rounded-xl bg-sBack border border-border outline-none focus:border-green" />
        
        <select className="w-full p-3 rounded-xl bg-sBack border border-border text-muted">
            <option>Category</option>
            <option>Food</option>
            <option>Bills</option>
            <option>Transport</option>
        </select>

        <input type="date" className="w-full p-3 rounded-xl bg-sBack border border-border text-muted" />

        <select className="w-full p-3 rounded-xl bg-sBack border border-border text-muted">
            <option>Payment Method</option>
            <option>Cash</option>
            <option>Bank Transfer</option>
            <option>Check</option>
        </select>

        <button className="w-full bg-green text-white font-bold py-3 rounded-xl hover:bg-green-dark transition-all">Save Expense</button>
      </form>
    </ActionModal>
  );
};

export default AddExpenseModal;