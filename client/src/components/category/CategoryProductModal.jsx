import React, { use } from 'react';
import { FiX } from "react-icons/fi";
import { useState,useEffect } from 'react';
import { getProductsByCategory } from '../../services/api';
import { toast } from 'react-toastify';


const CategoryProductModal = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

const [products, setProducts] = useState([]);


 useEffect(() => {
  console.log("called");
    const fetchProducts = async () => {
      
      
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
  <div className="bg-bg-card w-full max-w-sm p-8 rounded-3xl border border-border shadow-2xl modal-shine-effect">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-black text-text uppercase tracking-tight">
        Products in {category?.name}
      </h2>
      <button 
        onClick={onClose} 
        className="p-2 hover:bg-bg-body text-text rounded-full transition-colors"
      >
        <FiX />
      </button>
    </div>
    
    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar mb-6 pr-2">
      {products.length > 0 ? (
        products.map((p, i) => (
          <div 
            key={i} 
            className="p-4 bg-bg-body rounded-2xl text-text font-bold text-sm border border-border"
          >
            {p.name}
          </div>
        ))
      ) : (
        <p className="text-center text-muted text-sm font-bold py-4">No products found</p>
      )}
    </div>

    <button 
      onClick={onClose} 
      className="w-full bg-bg-primary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-all"
    >
      Close
    </button>
  </div>
</div>
  );
};

export default CategoryProductModal;