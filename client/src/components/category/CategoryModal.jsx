import React, { useState,useEffect, use } from 'react';
import { FiX } from "react-icons/fi";
import { createCategory, updateCategory } from '../../services/api';

const CategoryModal = ({ isOpen, onClose, category,reloadCategories }) => {
  const [name, setName] = useState(category ? category.name : '');

  const handleSave = async () => {
    try {
      if (category) {
        // UPDATE
        await updateCategory(category._id, { name });
      } else {
        // CREATE
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
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl border border-gray-100 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black">{category ? "Edit Category" : "New Category"}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 text-black rounded-full"><FiX /></button>
        </div>
        
        <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">Category Name</label>
        <input 
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electronics" 
          className="w-full px-4 py-3 rounded-2xl text-black bg-gray-50 border border-gray-100 mb-6 outline-none focus:border-black transition-all" 
        />
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-100 text-black font-bold text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-black text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-800">Save</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;