import React from 'react';

const CategoryProductModal = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  // Dummy Products linked to category
  const products = [
    { name: "Smartphone" },
    { name: "Bluetooth Speaker" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm p-6 rounded-3xl border border-border shadow-xl">
        <h2 className="text-lg font-bold text-text mb-4">Products in {category?.name}</h2>
        <div className="space-y-2 max-h-75 overflow-y-auto">
          {products.map((p, i) => (
            <div key={i} className="p-3 bg-sBack rounded-xl text-text font-bold text-sm">
              {p.name}
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 bg-sBack text-text font-bold py-3 rounded-xl">Close</button>
      </div>
    </div>
  );
};

export default CategoryProductModal;