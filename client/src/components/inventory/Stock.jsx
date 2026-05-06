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
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[ 
          { label: "Total", val: stats.total },
          { label: "OK", val: stats.ok },
          { label: "Critical", val: stats.critical },
          { label: "Out of Stock", val: stats.outOfStock }
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold text-black/70 uppercase tracking-wider">{s.label}</p>
            <h3 className="text-xl font-black text-black">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs text-black/70 uppercase">
                <th className="px-8 py-4">Product</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-gray-100">
                {loading ? (

                <tr>
                  <td colSpan="3" className="text-center py-6">
                    Loading...
                  </td>
                </tr>

              ) : (

                products.map((p) => (

                  <tr key={p.productId}
                      className="  hover:bg-gray-50">

                    <td className="text-black px-8 py-4 font-bold">
                      {p.productName}
                    </td>

                    <td className=" text-black px-6 py-4 font-bold">
                      {p.currentStock}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold 
                        ${
                          p.status === "OK"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Critical"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
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