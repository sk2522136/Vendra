import React, { useState,useEffect, use } from 'react';
import { FiX } from "react-icons/fi";
import { createCategory, updateCategory } from '../../services/api';

const CategoryModal = ({ isOpen, onClose, category,reloadCategories }) => {
  const [name, setName] = useState(category ? category.name : '');

  const handleSave = async () => {
    try {
      if (category) {
        await updateCategory(category._id, { name });
      } else {
        await createCategory({ name });
      }

    await reloadCategories(); 
    onClose();

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');}
  };

  useEffect(() => {
  setName(category ? category.name : '');
}, [category]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
  <div className="bg-bg-card w-full max-w-sm p-8 rounded-3xl border border-border shadow-2xl modal-shine-effect">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-black text-text uppercase tracking-tight">
        {category ? "Edit Category" : "New Category"}
      </h2>
      <button 
        onClick={onClose} 
        className="p-2 hover:bg-bg-body text-text rounded-full transition-colors"
      >
        <FiX />
      </button>
    </div>
    
    <label className="block text-[10px] font-black text-muted uppercase mb-1.5 ml-1">
      Category Name
    </label>
    <input 
      value={name} 
      onChange={(e) => setName(e.target.value)}
      placeholder="e.g. Electronics" 
      className="w-full px-4 py-3 rounded-2xl text-text bg-bg-body border border-border mb-6 outline-none focus:border-bg-primary transition-all" 
    />
    
    <div className="flex gap-3">
      <button 
        onClick={onClose} 
        className="flex-1 py-3 rounded-2xl border border-border text-text font-bold text-sm hover:bg-bg-body transition-all"
      >
        Cancel
      </button>
      <button 
        onClick={handleSave} 
        className="flex-1 bg-bg-primary text-white font-bold py-3 rounded-2xl text-sm hover:opacity-90 transition-all"
      >
        Save
      </button>
    </div>
  </div>
</div>
  );
};

export default CategoryModal;