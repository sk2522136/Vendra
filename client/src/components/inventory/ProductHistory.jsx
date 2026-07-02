import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInventoryHistory } from "../../services/api";
import { FiTrendingDown, FiTrendingUp, FiRotateCw } from "react-icons/fi";
import { toast } from "react-toastify";

const ProductHistory = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getInventoryHistory(id);
      console.log(res.data);

      setData(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [id]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-border font-bold text-sm sm:text-base">Loading...</p>
      </div>
    );
  }

  // ================= EMPTY =================
  if (!data) {
    return (
      <div className="text-center py-10 text-border font-bold text-sm sm:text-base">
        No Data Found
      </div>
    );
  }

  return (
   <div className="p-2 sm:p-3 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 bg-bg-body min-h-screen sm:h-auto lg:h-[98vh] rounded-2xl sm:rounded-3xl overflow-y-auto custom-scrollbar">
  {/* TITLE */}
  <div className="text-text px-1 sm:px-0">
    <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">Inventory history</h1>
  </div>

  {/* ================= PRODUCT INFO ================= */}
  <div className="bg-bg-card p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-sm">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-text uppercase tracking-tight truncate">
          {data.productName}
        </h2>
        
      </div>

      <div className="bg-bg-body px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-border text-center shrink-0">
        <p className="text-xs font-bold text-muted uppercase">Current Stock</p>
        <p className="text-xl sm:text-2xl font-black text-text">
          {data.currentStock}
        </p>
      </div>
    </div>
  </div>

  {/* ================= STATS ================= */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
    {/* IN */}
    <div className="bg-bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <FiTrendingUp size={16} className="text-green-600 sm:w-5 sm:h-5" />
        <p className="text-xs font-bold text-muted uppercase">Total In</p>
      </div>
      <p className="text-lg sm:text-xl font-black text-text">
        {data.history?.filter((h) => h.change > 0).reduce((a, b) => a + b.change, 0)}
      </p>
    </div>

    {/* OUT */}
    <div className="bg-bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <FiTrendingDown size={16} className="text-red-500 sm:w-5 sm:h-5" />
        <p className="text-xs font-bold text-muted uppercase">Total Out</p>
      </div>
      <p className="text-lg sm:text-xl font-black text-text">
        {Math.abs(
          data.history?.filter((h) => h.change < 0).reduce((a, b) => a + b.change, 0)
        )}
      </p>
    </div>

    {/* TRANSACTIONS */}
    <div className="bg-bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <FiRotateCw size={16} className="text-text sm:w-5 sm:h-5" />
        <p className="text-xs font-bold text-muted uppercase">Transactions</p>
      </div>
      <p className="text-lg sm:text-xl font-black text-text">
        {data.totalTransactions}
      </p>
    </div>
  </div>

  {/* ================= TABLE/LIST ================= */}
  <div className="bg-bg-card rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden">
    {/* DESKTOP TABLE */}
    <div className="hidden sm:block overflow-x-auto custom-scrollbar">
      <table className="w-full text-left">
        <thead className="bg-bg-body border-b border-border">
          <tr className="text-xs sm:text-sm font-black text-muted uppercase tracking-wider">
            <th className="px-3 sm:px-6 py-3 sm:py-4">Date</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4">Type</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Change</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Stock</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4">By</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {data.history.length > 0 ? (
            data.history.map((log, i) => (
              <tr key={i} className="hover:bg-bg-body transition-colors text-xs sm:text-sm">
                <td className="px-3 sm:px-6 py-2 sm:py-4 font-bold text-text">
                  {new Date(log.date).toLocaleDateString()}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 font-bold text-muted">
                  {log.type}
                </td>
                <td className={`px-3 sm:px-6 py-2 sm:py-4 text-right font-black ${
                  log.change > 0 ? "text-green-600" : "text-red-500"
                }`}>
                  {log.change > 0 ? "+" : ""}{log.change}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 text-right font-bold text-text">
                  {log.runningStock}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-muted">
                  {log.createdBy || "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-6 text-muted text-sm font-bold">
                No history available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* MOBILE CARD VIEW */}
    <div className="sm:hidden space-y-2">
      {data.history.length > 0 ? (
        data.history.map((log, i) => (
          <div key={i} className="p-3 border-b border-border last:border-b-0 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase">Date</span>
              <span className="text-sm font-bold text-text">
                {new Date(log.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase">Type</span>
              <span className="text-sm font-bold text-muted">{log.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase">Change</span>
              <span className={`text-sm font-black ${log.change > 0 ? "text-green-600" : "text-red-500"}`}>
                {log.change > 0 ? "+" : ""}{log.change}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase">Stock</span>
              <span className="text-sm font-bold text-text">{log.runningStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase">By</span>
              <span className="text-xs text-muted">{log.createdBy || "-"}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-muted text-sm font-bold">No history available</div>
      )}
    </div>
  </div>

  {/* ================= REFRESH ================= */}
  <div className="flex justify-end pb-2 sm:pb-0">
    <button
      onClick={loadHistory}
      className="flex items-center gap-2 px-3 sm:px-5 py-2 bg-bg-primary text-white rounded-lg sm:rounded-2xl font-bold text-xs sm:text-sm hover:opacity-90 transition"
    >
      <FiRotateCw size={14} className="sm:w-4 sm:h-4" />
      Refresh
    </button>
  </div>
</div>
  );
};

export default ProductHistory;