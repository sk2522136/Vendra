import React, { useState, useEffect } from 'react';
import StateCard from '../components/StateCard';
import { FiDollarSign, FiTrendingUp, FiClock, FiPackage, FiSearch } from "react-icons/fi";
import { getSaleChart, getTopSellProducts, getProfitChart, getPaymentMethod } from '../services/api.js';
import { toast } from 'react-toastify';
import socket from '../services/socket.js'
import SalesTrend from '../components/charts/SalesTrend.jsx'
import TopProducts from '../components/charts/TopProducts.jsx'
import InventoryStatus from '../components/charts/InventoryStatus.jsx'

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState('month');

  // Socket logic remains unchanged
  useEffect(() => {
    socket.on('lowStock', (data) => { toast.warning(data.message); });
    socket.on('outOfStock', (data) => { toast.error(data.message); });
    return () => {
      socket.off('lowStock');
      socket.off('outOfStock');  
    };
  }, []);

  useEffect(() => {
    socket.on("dashboard:refresh", () => { fetchDashboardData(); });
    return () => { socket.off("dashboard:refresh"); };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [timeFrame]); 

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let month = now.getMonth() + 1;
      let year = now.getFullYear();

      const [salesRes, profitRes, productsRes, paymentRes] = await Promise.all([
        getSaleChart(month, year),
        getProfitChart(year),
        getTopSellProducts(month, year, 10),
        getPaymentMethod(month, year)
      ]);

      setSaleData(salesRes.data);
      setProfitData(profitRes.data);
      setTopProducts(productsRes.data);
      setPaymentData(paymentRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='bg-bg-body min-h-screen flex items-center justify-center'>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-bg-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Total Sales", value: `Rs ${saleData?.monthly?.total || 0}`, icon: <FiDollarSign size={20} className="text-bg-primary" />, trend: `${Math.round(saleData?.monthly?.average) || 0} avg/day` },
    { title: "Revenue", value: `Rs ${paymentData?.totalRevenue?.toLocaleString() || 0}`, icon: <FiTrendingUp size={20} className="text-bg-primary" />, trend: `${((paymentData?.totalPaid / (paymentData?.totalRevenue || 1)) * 100 || 0).toFixed(0)}% collected` },
    { title: "Pending Orders", value: `Rs ${paymentData?.totalPending?.toLocaleString() || 0}`, icon: <FiClock size={20} className="text-bg-primary" />, trend: `${paymentData?.credit?.count || 0} credit sales` },
    { title: "Net Profit", value: `Rs ${profitData?.totalProfit?.toLocaleString() || 0}`, icon: <FiPackage size={20} className="text-bg-primary" />, trend: `Rs ${profitData?.avgMonthlyProfit?.toLocaleString() || 0}/month` },
    { title: "Top Product Sales", value: `${topProducts?.topProducts?.[0]?.quantity || 0} units`, icon: <FiTrendingUp size={20} className="text-bg-primary" />, trend: topProducts?.topProducts?.[0]?.name || "No data" },
    { title: "Collection Rate", value: `${paymentData?.cash?.collectionRate || 0}%`, icon: <FiDollarSign size={20} className="text-bg-primary" />, trend: "Cash collection" }
  ];

  return (
    <div className='bg-bg-body min-h-screen transition-all'>
      <div className='p-4 md:p-6 w-full'>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tighter">DASHBOARD</h1>
            <p className="text-sm text-muted mt-1 capitalize">{timeFrame} Overview</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3">
           
            
            <div className="flex border border-gray-100 rounded-xl overflow-hidden bg-bg-card shadow-sm"> 
              {['today', 'week', 'month'].map((frame) => (
                <button 
                  key={frame} onClick={() => setTimeFrame(frame)}
                  className={`px-4 py-2.5 text-xs md:text-sm font-bold transition-all capitalize ${
                    timeFrame === frame ? 'bg-bg-primary text-white' : 'text-muted hover:bg-bg-hover'
                  }`}
                >
                  {frame === 'today' ? 'Today' : frame === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {stats.map((stat, idx) => (
            <StateCard key={idx} {...stat} />
          ))}
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-card rounded-2xl p-4 shadow-sm border border-gray-100">
            <SalesTrend data={saleData} />
          </div>
          <div className="bg-bg-card rounded-2xl p-4 shadow-sm border border-gray-100">
            <TopProducts data={topProducts} />
          </div>
          <div className="lg:col-span-2 bg-bg-card rounded-2xl p-4 shadow-sm border border-gray-100">
            <InventoryStatus data={paymentData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;