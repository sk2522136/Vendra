import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBox } from 'react-icons/fa';
import CategoryModal from '../components/category/CategoryModal';
import CategoryProductModal from '../components/category/CategoryProductModal';

const Category = () => {
  // Dummy Data
  const [categories, setCategories] = useState([
    { _id: 1, name: "Electronics" },
    { _id: 2, name: "Furniture" },
    { _id: 3, name: "Stationery" }
  ]);

  const [selectedCat, setSelectedCat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c._id !== id));
  };

  return (
    <div className="p-4 md:p-8 min-h-screen ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text">Categories</h1>
        <button 
          onClick={() => { setSelectedCat(null); setIsModalOpen(true); }} 
          className="bg-green text-white px-4 py-2 md:px-6 md:py-2 rounded-xl font-bold flex items-center gap-2 text-sm md:text-base hover:bg-green-dark transition-all"
        >
          <FaPlus /> Add
        </button>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-100">
            <thead className="bg-sBack">
              <tr className="text-xs text-muted uppercase">
                <th className="px-8 py-4">Name</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-sBack/50">
                  <td className="px-8 py-4 font-bold text-text">{c.name}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => { setSelectedCat(c); setIsProductModalOpen(true); }} className="text-muted hover:text-green"><FaBox /></button>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-4">
                    <button onClick={() => { setSelectedCat(c); setIsModalOpen(true); }} className="text-muted hover:text-amber"><FaEdit /></button>
                    <button onClick={() => handleDelete(c._id)} className="text-muted hover:text-red"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} category={selectedCat} />
      )}
      {isProductModalOpen && (
        <CategoryProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} category={selectedCat} />
      )}
    </div>
  );
};

export default Category;