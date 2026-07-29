import React, { useState, useEffect, useCallback } from 'react';
import { HiDownload, HiArrowUp, HiArrowDown, HiFilter } from 'react-icons/hi';
import { getRevenueAnalytics } from '../../services/api';

const RevenueAnalytics = () => {
  const [filterPlan, setFilterPlan] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ arr: '$0', successRate: '0%', activePaidStores: '0 Stores' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getRevenueAnalytics();
      const payload = res?.data || res;
      if (payload?.stats) setStats(payload.stats);
      if (Array.isArray(payload?.transactions)) setTransactions(payload.transactions);
    } catch (err) {
      console.error("Failed to load revenue data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const filteredTxns = transactions.filter(t => filterPlan === 'All' || t.status === filterPlan);

  return (
    <div className="space-y-6 font-mona animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Subscriptions & Revenue</h1>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">Annual Run Rate (ARR)</span>
          <div className="mt-2 text-3xl font-bold text-text">{stats.arr}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500 font-bold">
            <HiArrowUp /> +18.4% <span className="text-muted font-normal">vs last quarter</span>
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">Payment Success Rate</span>
          <div className="mt-2 text-3xl font-bold text-text">{stats.successRate}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-rose-500 font-bold">
            <HiArrowDown /> -0.8% <span className="text-muted font-normal font-sans">failed invoices</span>
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted tracking-wider uppercase">Active Paid Subscribers</span>
          <div className="mt-2 text-3xl font-bold text-text">{stats.activePaidStores}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500 font-bold">
            <HiArrowUp /> +5 new <span className="text-muted font-normal">in past 48 hours</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-text">
          <HiFilter className="text-muted" size={18} /> Filter Transactions:
        </div>
        <div className="flex gap-1.5">
          {['All', 'Successful', 'Failed', 'Refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterPlan(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterPlan === status 
                  ? 'bg-bg-primary text-white shadow-sm' 
                  : 'bg-bg-body text-muted hover:text-text border border-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-text text-base">Global Billing History</h3>
          <p className="text-xs text-muted mt-0.5">Real-time breakdown of internal application invoice trails.</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-bg-body border-b border-border text-muted text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Merchant / Store</th>
                <th className="p-4">Billing Type</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-muted">Loading transactions...</td></tr>
              ) : filteredTxns.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-muted">No transactions matching criteria.</td></tr>
              ) : (
                filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-bg-body/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-bg-primary text-xs">{txn.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-text">{txn.store}</div>
                      <div className="text-xs text-muted mt-0.5">{txn.owner}</div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-text/80">{txn.type}</td>
                    <td className="p-4 text-xs text-muted font-medium">{txn.date}</td>
                    <td className="p-4 font-bold text-text">{txn.amount}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md ${
                        txn.status === 'Successful' ? 'bg-emerald-500/10 text-emerald-500' :
                        txn.status === 'Failed' ? 'bg-rose-500/10 text-rose-500' :
                        txn.status === 'Refunded' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted/10 text-muted'
                      }`}>
                        {txn.status}
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

export default RevenueAnalytics;