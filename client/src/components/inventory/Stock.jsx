import React from 'react';
import { getInventoryStatus } from "../../services/api";
import { useEffect , useState } from 'react';


const Stock = () => {

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [summary, setSummary] = useState({
    outOfStock: 0,
    critical: 0,
    low: 0,
    ok: 0
  });

const loadInventory = async () => {
    try {
      setLoading(true);

      const res = await getInventoryStatus();

      // backend data
      setProducts(res.data.inventory);
      setSummary(res.data.summary);

    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    loadInventory();
  }, []);


   const stats = {
    total: products.length,
    outOfStock: summary.outOfStock,
    critical: summary.critical,
    ok: summary.ok
  };


  
  return (
   <div className="space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[ 
      { label: "Total", val: stats.total },
      { label: "OK", val: stats.ok },
      { label: "Critical", val: stats.critical },
      { label: "Out of Stock", val: stats.outOfStock }
    ].map((s, i) => (
      <div key={i} className="bg-bg-card p-5 rounded-3xl border border-border shadow-sm text-center">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest">{s.label}</p>
        <h3 className="text-2xl font-black text-text mt-1">{s.val}</h3>
      </div>
    ))}
  </div>
  
  <div className="bg-bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left">
        <thead className="bg-bg-body">
          <tr className="text-[10px] text-muted uppercase tracking-wider">
            <th className="px-8 py-5">Product</th>
            <th className="px-6 py-5">Stock</th>
            <th className="px-6 py-5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan="3" className="text-center py-10 text-muted font-bold">Loading inventory...</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.productId} className="hover:bg-bg-body transition-colors">
                <td className="text-text px-8 py-4 font-bold text-sm">{p.productName}</td>
                <td className="text-text px-6 py-4 font-black text-sm">{p.currentStock}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    p.status === "OK" 
                      ? "bg-green-100 text-green-600" 
                      : p.status === "Critical" 
                      ? "bg-orange-100 text-orange-600" 
                      : "bg-red-100 text-red-600"
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
  );
};

export default Stock;