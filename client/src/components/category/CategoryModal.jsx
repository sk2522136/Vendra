import React, { useState } from 'react';

const CategoryModal = ({ isOpen, onClose, category }) => {
  const [name, setName] = useState(category ? category.name : '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm p-6 rounded-3xl border border-border shadow-xl">
        <h2 className="text-lg font-bold text-text mb-4">{category ? "Edit Category" : "New Category"}</h2>
        <input 
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Category Name" 
          className="w-full p-3 rounded-xl bg-sBack border border-border mb-6 outline-none focus:border-green" 
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 text-muted font-bold">Cancel</button>
          <button onClick={onClose} className="flex-1 bg-green text-white font-bold py-3 rounded-xl hover:bg-green-dark">Save</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;