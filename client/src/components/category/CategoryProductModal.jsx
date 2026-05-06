import React, { use } from 'react';
import { FiX } from "react-icons/fi";
import { useState,useEffect } from 'react';
import { getProductsByCategory } from '../../services/api';
import { toast } from 'react-toastify';


const CategoryProductModal = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

const [products, setProducts] = useState([]);


 useEffect(() => {
    const fetchProducts = async () => {
      // Pehle check karo category available hai ya nahi
      if (!category?._id) {
        setProducts([]);
        return;
      }

      try {
        const res = await getProductsByCategory(category._id);
        setProducts(res.data.products);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch products');
        setProducts([]);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl border border-gray-100 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-black">Products in {category?.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><FiX /></button>
        </div>
        
        <div className="space-y-2 max-h-75 overflow-y-auto mb-6">
          {products.map((p, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl text-black font-bold text-sm border border-gray-100">
              {p.name}
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full bg-black text-white font-bold py-3 rounded-2xl hover:bg-gray-800">Close</button>
      </div>
    </div>
  );
};

export default CategoryProductModal;