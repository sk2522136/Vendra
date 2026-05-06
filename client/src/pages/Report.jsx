import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Package, CreditCard } from 'lucide-react';
import { getSaleChart, getTopSellProducts, getProfitChart, getPaymentMethod } from '../services/api.js';

const THEME = {
  green: '#1D9E75',
  black: '#000000',
  red: '#E24B4A',
  blue: '#3B82F6',
  purple: '#3C3489',
  gray: '#F9FAFB'
};

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // ✅ All data from API
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [profitData, setProfitData] = useState({});
  const [paymentData, setPaymentData] = useState(null);

  // ✅ Fetch all data on mount & when period changes
  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Parallel API calls
      const [saleRes, productsRes, profitRes, paymentRes] = await Promise.all([
        getSaleChart(period.month, period.year),
        getTopSellProducts(period.month, period.year, 5),
        getProfitChart(period.year),
        getPaymentMethod(period.month, period.year)
      ]);

      // 1️⃣ Process Sales Data
      if (saleRes.data.success) {
        const dailyArray = Object.entries(saleRes.data.daily).map(([day, sales]) => ({
          day: parseInt(day),
          sales: sales
        }));

        const weeklyArray = Object.entries(saleRes.data.weekly).map(([week, count]) => ({
          week: `Week ${week}`,
          count: count
        }));

        setSalesData({
          daily: dailyArray,
          weekly: weeklyArray,
          monthly: saleRes.data.monthly
        });
      }

      // 2️⃣ Process Top Products
      if (productsRes.data.success) {
        setTopProducts(productsRes.data.topProducts);
      }

      // 3️⃣ Process Profit Data
      if (profitRes.data.success) {
        const monthlyObj = {};
        Object.entries(profitRes.data.monthlyProfitData).forEach(([month, data]) => {
          monthlyObj[data.month] = {
            revenue: data.revenue,
            cogs: data.cogs,
            netProfit: data.netProfit
          };
        });
        setProfitData(monthlyObj);
      }

      // 4️⃣ Process Payment Data
      if (paymentRes.data.success) {
        setPaymentData({
          cash: paymentRes.data.cash,
          credit: paymentRes.data.credit
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data');
      console.error('Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalRevenue = paymentData 
    ? paymentData.cash.revenue + paymentData.credit.revenue 
    : 0;

  const totalProfit = Object.values(profitData).reduce(
    (sum, month) => sum + (month.netProfit || 0),
    0
  );

  const totalCollected = paymentData
    ? paymentData.cash.paid + paymentData.credit.paid
    : 0;

  const totalProductsSold = topProducts.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  const formatCurrency = (value) =>
    `$${(value || 0).toLocaleString('en-US')}`;

  const formatPercent = (value) => {
  // If it's already a string, return as-is
  if (typeof value === 'string') {
    return `${value}%`;
  }
  // If it's a number, format it
  return `${(value || 0).toFixed(2)}%`;
};
  // ✅ Loading state
  if (loading && !salesData) {
    return (
      <div className="p-6 md:p-8 h-[98vh] flex items-center justify-center bg-bg-mainCard rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error && !salesData) {
    return (
      <div className="p-6 md:p-8 h-[98vh] flex items-center justify-center bg-bg-mainCard rounded-2xl">
        <div className="text-center">
          <p className="text-red-600 font-bold">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 h-[98vh] overflow-y-auto custom-scrollbar rounded-2xl bg-bg-mainCard">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 font-medium">
            Real-time business performance metrics
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Revenue",
              val: formatCurrency(totalRevenue),
              icon: DollarSign,
              color: "text-black"
            },
            {
              title: "Net Profit",
              val: formatCurrency(totalProfit),
              icon: TrendingUp,
              color: "text-green-600"
            },
            {
              title: "Total Collections",
              val: formatCurrency(totalCollected),
              icon: CreditCard,
              color: "text-blue-600"
            },
            {
              title: "Products Sold",
              val: totalProductsSold,
              icon: Package,
              color: "text-black"
            }
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {card.title}
                </p>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h3 className="text-2xl font-black text-black">
                {card.val}
              </h3>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="flex items-center m-2 mb-4 gap-2 bg-white text-black p-2 rounded-2xl border border-gray-100 w-fit">
          <select
            className="bg-transparent px-4 py-2 text-sm font-bold outline-none"
            onChange={(e) => {
              const [month, year] = e.target.value.split('-');
              setPeriod({ month: parseInt(month), year: parseInt(year) });
            }}
          >
            <option value={`${period.month}-${period.year}`}>
              {new Date(period.year, period.month - 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </option>
          </select>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Update Data'}
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Daily Sales */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase">
              Daily Sales
            </h3>
            {salesData?.daily && salesData.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesData.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke={THEME.green}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-12">No sales data</p>
            )}
          </div>

          {/* Profit */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase">
              Profit Analysis
            </h3>
            {Object.keys(profitData).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={Object.entries(profitData).map(([month, data]) => ({
                    month,
                    ...data
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill={THEME.blue} />
                  <Bar dataKey="cogs" fill={THEME.green} />
                  <Bar dataKey="netProfit" fill={THEME.red} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-12">No profit data</p>
            )}
          </div>

          {/* Weekly */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase">
              Weekly Distribution
            </h3>
            {salesData?.weekly && salesData.weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesData.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={THEME.green} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-12">No weekly data</p>
            )}
          </div>

          {/* Payment Pie */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase">
              Payment Methods
            </h3>
            {paymentData ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Cash', value: paymentData.cash.revenue },
                      { name: 'Credit', value: paymentData.credit.revenue }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill={THEME.red} />
                    <Cell fill={THEME.green} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-12">No payment data</p>
            )}
          </div>

        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Cash Sales */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase">
              Cash Sales
            </h3>
            {paymentData ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Revenue</span>
                  <span className="font-bold">
                    {formatCurrency(paymentData.cash.revenue)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(paymentData.cash.paid)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-bold">
                    {formatCurrency(paymentData.cash.pending)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Collection Rate</span>
                  <span className="font-bold text-blue-600">
                    {formatPercent(paymentData.cash.collectionRate)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Loading...</p>
            )}
          </div>

          {/* Credit Sales */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase">
              Credit Sales
            </h3>
            {paymentData ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Total Revenue</span>
                  <span className="font-bold">
                    {formatCurrency(paymentData.credit.revenue)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(paymentData.credit.paid)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-bold text-red-500">
                    {formatCurrency(paymentData.credit.pending)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Collection Rate</span>
                  <span className="font-bold text-blue-600">
                    {formatPercent(paymentData.credit.collectionRate)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Loading...</p>
            )}
          </div>

        </div>

        {/* Top Products Table */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-black text-black uppercase">
              Top Selling Products
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Avg Price
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.length > 0 ? (
                  topProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-black">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">
                        {formatCurrency(product.avgPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-black text-right">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      No products data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;