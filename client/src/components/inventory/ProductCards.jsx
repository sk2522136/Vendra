import React, { useEffect, useState } from "react";
import { fetchProduct } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FiPackage, FiTrendingUp } from "react-icons/fi";
import { toast } from "react-toastify";

const ProductCards = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchProduct({ page: 1, limit: 50 });
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted font-bold text-sm sm:text-base">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-bg-card rounded-2xl sm:rounded-3xl border border-border">
        <FiPackage size={40} className="text-muted mb-4 sm:mb-6" />
        <p className="text-muted font-bold text-sm sm:text-base">No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 ">
    

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {products.map((p) => (
          <div
            key={p._id}
            onClick={() => navigate(`/inventory/${p._id}`)}
            className="cursor-pointer bg-bg-card p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl border border-border shadow-sm hover:shadow-lg hover:border-bg-primary transition-all duration-300 group active:scale-95"
          >
            {/* HEADER WITH ICON */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bg-body rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-bg-primary group-hover:text-white transition-all">
                <FiPackage size={18} className="text-text group-hover:text-white sm:text-xl" />
              </div>

              {/* STOCK BADGE */}
              <div
                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-black uppercase transition-all ${
                  p.quantity > 20
                    ? "bg-green-100 text-green-700"
                    : p.quantity > 0
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {p.quantity > 20 ? "In Stock" : p.quantity > 0 ? "Low Stock" : "Out"}
              </div>
            </div>

            {/* PRODUCT NAME */}
            <h3 className="text-sm sm:text-base md:text-lg font-black text-text uppercase tracking-tight line-clamp-2">
              {p.name}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-xs text-muted mt-1 sm:mt-2 line-clamp-2">
              {p.description || "No description available"}
            </p>

            {/* STOCK INFO WITH PROGRESS BAR */}
            <div className="mt-3 sm:mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text uppercase">Stock Level</span>
                <span className="text-xs sm:text-sm font-black text-text">{p.quantity} units</span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 bg-bg-body rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    p.quantity > 20
                      ? "bg-green-500"
                      : p.quantity > 0
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min((p.quantity / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* CATEGORY AND PRICE */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-bold text-muted uppercase">Category</p>
                <p className="text-xs sm:text-sm font-bold text-text truncate">{p.category.name || "N/A"}</p>
              </div>

              {p.price && (
                <div className="text-right">
                  <p className="text-xs font-bold text-muted uppercase">Price</p>
                  <p className="text-xs sm:text-sm font-black text-text">Rs {p.price}</p>
                </div>
              )}
            </div>

            {/* VIEW DETAILS INDICATOR */}
            <div className="mt-3 sm:mt-4 flex items-center justify-between text-muted group-hover:text-text transition-colors">
              <span className="text-xs font-bold uppercase">View Details</span>
              <FiTrendingUp size={14} className="group-hover:translate-x-1 transition-transform sm:w-4 sm:h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCards;