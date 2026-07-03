import React, { useState,useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBox } from 'react-icons/fa';
import CategoryModal from '../components/category/CategoryModal';
import CategoryProductModal from '../components/category/CategoryProductModal';
import { getAllCategories,createCategory,updateCategory ,deleteCategory} from '../services/api';
import {toast} from 'react-toastify'

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);


  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      setCategories(res.data.categories);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
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
   <div className='p-6  overflow-y-auto custom-scrollbar space-y-8 bg-bg-body rounded-3xl'>
      
  <div className="flex justify-between items-start">
    <div>
      <h1 className='text-3xl font-black text-text uppercase tracking-tight'>Product Categories</h1>
    </div>
    <button 
      onClick={() => { setSelectedCat(null); setIsModalOpen(true); }} 
      className="flex items-center gap-2 px-6 py-3 bg-bg-primary text-white font-bold rounded-2xl hover:bg-bg-secondary shadow-sm  text-sm transition-all"
    >
      <FaPlus /> Add Category
    </button>
  </div>

 <div className='border border-border shadow-sm rounded-3xl overflow-hidden bg-bg-card'>

 {loading ? (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
      <p className="text-base font-bold text-text animate-pulse">Loading...</p>
    </div>
  ) : categories.length > 0 ? (
    
    <div className='overflow-x-auto custom-scrollbar'>
      <table className='w-full text-left'>
        <thead>
          <tr className='bg-bg-body border-b border-border text-text font-extrabold'>
            <th className='py-4 px-6 text-[11px] font-black text-muted uppercase tracking-wider'>Category Name</th>
            <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider text-center">Products</th>
            <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {categories.map((c) => (
            <tr key={c._id} className='hover:bg-bg-body transition-colors group'>
              <td className="px-6 py-4 font-bold text-text">{c.name}</td>
              <td className="px-6 py-4 text-center">
                <button 
                  onClick={() => { setSelectedCat(c); setIsProductModalOpen(true); }} 
                  className="p-2 bg-bg-body  text-bg-secondary rounded-lg hover:bg-bg-primary hover:text-white transition-all"
                >
                  <FaBox />
                </button>
              </td>
              <td className="px-6 py-4 flex justify-center gap-2">
                <button 
                  onClick={() => { setSelectedCat(c); setIsModalOpen(true); }} 
                  className="p-2 bg-bg-body  text-bg-secondary rounded-lg hover:bg-bg-primary hover:text-white transition-all"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete(c._id)} 
                  className="p-2 bg-bg-body text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
        <p className="text-base font-bold text-text">No data available</p>
        <p className="text-xs text-muted mt-1">No product categories have been created yet.</p>
      </div>
    )}
  </div>

  {isModalOpen && <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} category={selectedCat} reloadCategories={fetchCategories} />}
  {isProductModalOpen && <CategoryProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} category={selectedCat} />}
</div>
  );
};

export default Category;