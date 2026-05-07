import React, { useState, useEffect } from 'react';
import StateCard from '../components/StateCard';
import { FiDollarSign, FiTrendingUp, FiClock, FiPackage, FiSearch } from "react-icons/fi";
import { getSaleChart, getTopSellProducts, getProfitChart, getPaymentMethod } from '../services/api.js';
import { toast } from 'react-toastify';
import SalesTrend from '../components/charts/SalesTrend.jsx';
import TopProducts from '../components/charts/TopProducts.jsx';
import InventoryStatus from '../components/charts/InventoryStatus.jsx';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [saleData, setSaleData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  
  //  Search aur Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [timeFrame]); 

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let month = now.getMonth() + 1;
      let year = now.getFullYear();

      //  Time frame ke hisaab se month/year change kar
      if (timeFrame === 'today') {
        // Today ka data (aaj ka month/year)
      } else if (timeFrame === 'week') {
        // This week (aaj ka month/year)
      } else if (timeFrame === 'month') {
        // This month (aaj ka month/year) - default
      }

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
       const errorMessage = 
      error.response?.data?.message || "Failed to load dashboard data";
     toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
    });
    
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='bg-bg-sidebar min-h-screen flex items-center justify-center'>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Sales",
      value: `Rs ${saleData?.monthly?.total || 0}`,
      icon: <FiDollarSign size={20} className="text-green-600" />,
      iconBg: "bg-green-100",
      trend: `${Math.round(saleData?.monthly?.average) || 0} avg/day`,
      trendColor: "text-green-600"
    },
    {
      title: "Revenue",
      value: `Rs ${paymentData?.totalRevenue?.toLocaleString() || 0}`,
      icon: <FiTrendingUp size={20} className="text-blue-600" />,
      iconBg: "bg-blue-100",
      trend: `${((paymentData?.totalPaid / (paymentData?.totalRevenue || 1)) * 100 || 0).toFixed(0)}% collected`,
      trendColor: "text-blue-600"
    },
    {
      title: "Pending Orders",
      value: `Rs ${paymentData?.totalPending?.toLocaleString() || 0}`,
      icon: <FiClock size={20} className="text-amber-600" />,
      iconBg: "bg-amber-100",
      trend: `${paymentData?.credit?.count || 0} credit sales`,
      trendColor: "text-amber-600"
    },
    {
      title: "Net Profit",
      value: `Rs ${profitData?.totalProfit?.toLocaleString() || 0}`,
      icon: <FiPackage size={20} className="text-purple-600" />,
      iconBg: "bg-purple-100",
      trend: `Rs ${profitData?.avgMonthlyProfit?.toLocaleString() || 0}/month`,
      trendColor: "text-purple-600"
    },
    {
      title: "Top Product Sales",
      value: `${topProducts?.topProducts?.[0]?.quantity || 0} units`,
      icon: <FiTrendingUp size={20} className="text-pink-600" />,
      iconBg: "bg-pink-100",
      trend: topProducts?.topProducts?.[0]?.name || "No data",
      trendColor: "text-pink-600"
    },
    {
      title: "Collection Rate",
      value: `${paymentData?.cash?.collectionRate || 0}%`,
      icon: <FiDollarSign size={20} className="text-indigo-600" />,
      iconBg: "bg-indigo-100",
      trend: "Cash collection",
      trendColor: "text-indigo-600"
    }
  ];

  return (
    <div className='bg-bg-sidebar min-h-screen transition-all'>
      
      <div className='bg-bg-mainCard rounded-2xl p-4 md:p-6 min-h-[98vh] w-full'>
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text">DASHBOARD</h1>
            <p className="text-sm text-gray-500 mt-1">
              {timeFrame === 'today' && "Today's Overview"}
              {timeFrame === 'week' && "This Week's Overview"}
              {timeFrame === 'month' && "This Month's Overview"}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg text-text border border-gray-200 outline-none transition-all focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
            
            {/* Time Frame Buttons */}
            <div className="flex text-text border border-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm bg-white"> 
              {['today', 'week', 'month'].map((frame) => (
                <button 
                  key={frame}
                  onClick={() => setTimeFrame(frame)}
                  className={`px-4 py-2.5 text-xs md:text-sm font-semibold transition-all capitalize ${
                    timeFrame === frame 
                      ? 'bg-black text-white' 
                      : 'border-r border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {frame === 'today' ? 'Today' : frame === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid - 6 Cards (2x3 layout) */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8'>
          {stats.map((stat, idx) => (
            <StateCard 
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBg={stat.iconBg}
              trend={stat.trend}
              trendColor={stat.trendColor}
            />
          ))}
        </div>
        
        {/* Charts Section - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Sales Trend */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <SalesTrend data={saleData} />
          </div>

          {/* Right: Top Products */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <TopProducts data={topProducts} />
          </div>

          {/* Full Width: Payment Method */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <InventoryStatus data={paymentData} />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Dashboard;