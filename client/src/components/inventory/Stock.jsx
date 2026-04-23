import React from 'react';

const Stock = () => {
  const products = [
    { name: "Laptop", stock: 10, status: "OK" },
    { name: "Mouse", stock: 0, status: "Out of Stock" },
    { name: "Keyboard", stock: 2, status: "Critical" }
  ];

  // Stats calculate karna
  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.stock === 0).length,
    critical: products.filter(p => p.status === 'Critical').length,
    ok: products.filter(p => p.status === 'OK').length,
  };

  return (
    <div className="space-y-6">
      {/* 1. Stats Summary Cards (Responsive) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[ 
          { label: "Total", val: stats.total, color: "text-text" },
          { label: "OK", val: stats.ok, color: "text-green" },
          { label: "Critical", val: stats.critical, color: "text-red" },
          { label: "Out of Stock", val: stats.outOfStock, color: "text-red" }
        ].map((s, i) => (
          <div key={i} className="bg-card p-4 rounded-3xl border border-border text-center">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{s.label}</p>
            <h3 className={`text-xl font-black ${s.color}`}>{s.val}</h3>
          </div>
        ))}
      </div>

      {/* 2. Responsive Table Wrapper */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-100">
            <thead className="bg-sBack">
              <tr className="text-xs text-muted uppercase">
                <th className="px-8 py-4">Product</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p, i) => (
                <tr key={i} className="hover:bg-sBack/50 transition-colors">
                  <td className="px-8 py-4 font-bold text-text">{p.name}</td>
                  <td className="px-6 py-4 font-bold">{p.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold 
                      ${p.status === 'OK' ? 'bg-green-light text-green' : 
                        p.status === 'Critical' ? 'bg-amber-light text-amber' : 
                        'bg-red-light text-red'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;