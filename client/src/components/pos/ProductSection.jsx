import React from "react";
import { FiSearch, FiFilter, FiShoppingCart } from "react-icons/fi";

const ProductSection = ({ 
  products, searchTerm, setSearchTerm, 
  categories, selectedCategory, setSelectedCategory, addToCart 
}) => {
  return (
    <div className="flex-1 flex flex-col bg-bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm min-h-[500px] xl:min-h-0">
      {/* Upper Dashboard Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <FiShoppingCart className="text-bg-primary" /> POS 
          </h1>
          <p className="text-xs text-muted font-medium mt-0.5">Vendra POS System</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Barcode or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-body border border-border text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none font-medium focus:border-bg-primary transition-all"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto bg-bg-body border border-border text-sm rounded-xl pl-8 pr-8 py-2.5 outline-none appearance-none font-medium text-text focus:border-bg-primary cursor-pointer"
            >
              <option value="All">All Items</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Products Catalog Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
        {products.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted font-medium text-sm">No items found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
            {products.map((p) => (
              <div 
                key={p._id} 
                onClick={() => p.quantity > 0 && addToCart(p)}
                className={`bg-bg-card border rounded-xl p-2.5 flex flex-col justify-between transition-all select-none group relative ${p.quantity > 0 ? "border-border hover:shadow-md hover:border-bg-primary cursor-pointer" : "opacity-50 bg-gray-50 border-dashed cursor-not-allowed"}`}
              >
                {p.quantity <= 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider z-10">Out of Stock</span>
                )}
                <div className="w-full aspect-square bg-hover rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                  <img src={p.image?.url || "https://placehold.co/150"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-bold text-text text-xs uppercase line-clamp-2 min-h-[2rem] leading-tight mb-1">{p.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-bg-primary font-black text-sm">Rs {p.costPrice.toLocaleString()}</span>
                    <span className="text-[10px] bg-hover px-1.5 py-0.5 rounded font-bold text-muted">Stock: {p.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSection;