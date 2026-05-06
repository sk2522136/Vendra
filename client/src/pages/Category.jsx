import React, { useState,useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBox } from 'react-icons/fa';
import CategoryModal from '../components/category/CategoryModal';
import CategoryProductModal from '../components/category/CategoryProductModal';
import { getAllCategories,createCategory,updateCategory ,deleteCategory} from '../services/api';
import {toast} from 'react-toastify'

const Category = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data.categories);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  
  const handleDelete = async (id) => {
  try {
    await deleteCategory(id);
    setCategories(categories.filter(c => c._id !== id));

  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete category');
  }
  }


  

  const [selectedCat, setSelectedCat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  

  return (
    <div className='p-6 h-[98vh] overflow-y-auto custom-scrollbar space-y-8 bg-bg-mainCard rounded-3xl'>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className='text-3xl font-black text-black uppercase tracking-tight'>Product Categories</h1>
          <p className='text-gray-500 text-sm font-medium mt-1'>Organize your inventory by grouping items into logical categories.</p>
        </div>
        <button 
          onClick={() => { setSelectedCat(null); setIsModalOpen(true); }} 
          className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 text-sm transition-all"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      <div className='border border-gray-100 shadow-sm rounded-3xl shadow-sm overflow-hidden bg-white'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100 text-black font-extrabold'>
                <th className='py-4 px-6 text-[11px] font-black text-muted uppercase tracking-wider'>Category Name</th>
                <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider text-center">Products</th>
                <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border-gray-100 '>
              {categories.map((c) => (
                <tr key={c._id} className='hover:bg-gray-50 transition-colors group'>
                  <td className="px-6 py-4 font-bold text-black">{c.name}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => { setSelectedCat(c); setIsProductModalOpen(true); }} className="p-2 bg-gray-100 text-black rounded-lg hover:bg-black hover:text-white transition-all "><FaBox /></button>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button onClick={() => { setSelectedCat(c); setIsModalOpen(true); }} className="p-2 bg-gray-100 text-black rounded-lg hover:bg-black hover:text-white  transition-all "><FaEdit /></button>
                    <button onClick={() => handleDelete(c._id)} className="p-2 bg-gray-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all "><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} category={selectedCat}  reloadCategories={fetchCategories} />}
      {isProductModalOpen && <CategoryProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} category={selectedCat} />}
    </div>
  );
};

export default Category;