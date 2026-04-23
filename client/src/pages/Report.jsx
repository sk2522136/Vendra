import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Package, CreditCard } from 'lucide-react';

// Theme Colors
const THEME = {
  green: '#1D9E75',
  greenLight: '#E1F5EE',
  greenDark: '#0F6E56',
  greenMid: '#5DCAA5',
  red: '#E24B4A',
  redLight: '#FCEBEB',
  amber: '#EF9F27',
  amberLight: '#FAEEDA',
  amberDark: '#854F0B',
  blue: '#185FA5',
  blueLight: '#E6F1FB',
  purple: '#3C3489',
  purpleLight: '#EEEDFE',
  bg: '#F4F7F5',
  card: '#FFFFFF',
  border: '#E8EDE9',
  border2: '#D4DDD5',
  text: '#1A2E1E',
  muted: '#5C7A62',
  hint: '#9DB5A1',
  sBack: '#F0F7F2'
};

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [year, setYear] = useState(new Date().getFullYear());

  // Dummy data - Replace with API calls
  const [salesData, setSalesData] = useState({
    daily: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, sales: Math.floor(Math.random() * 50) })),
    weekly: [
      { week: 'Week 1', count: 45 },
      { week: 'Week 2', count: 38 },
      { week: 'Week 3', count: 52 },
      { week: 'Week 4', count: 41 }
    ],
    monthly: { total: 176, average: 5.87 }
  });

  const [profitData, setProfitData] = useState({
    Jan: { revenue: 45000, cogs: 28000, expenses: 8000, netProfit: 9000 },
    Feb: { revenue: 52000, cogs: 31000, expenses: 9000, netProfit: 12000 },
    Mar: { revenue: 48000, cogs: 29000, expenses: 8500, netProfit: 10500 },
    Apr: { revenue: 56000, cogs: 33000, expenses: 9500, netProfit: 13500 },
    May: { revenue: 61000, cogs: 36000, expenses: 10000, netProfit: 15000 },
  });

  const [topProducts, setTopProducts] = useState([
    { id: 1, name: 'MacBook Pro', quantity: 45, revenue: 67500, avgPrice: 1500 },
    { id: 2, name: 'iPhone 15', quantity: 120, revenue: 84000, avgPrice: 700 },
    { id: 3, name: 'iPad Air', quantity: 68, revenue: 40800, avgPrice: 600 },
    { id: 4, name: 'Apple Watch', quantity: 92, revenue: 27600, avgPrice: 300 },
    { id: 5, name: 'AirPods Pro', quantity: 156, revenue: 18720, avgPrice: 120 },
  ]);

  const [paymentData, setPaymentData] = useState({
    cash: { count: 45, revenue: 45000, paid: 45000, pending: 0, collectionRate: 100 },
    credit: { count: 78, revenue: 85000, paid: 68000, pending: 17000, collectionRate: 80 }
  });

  // API Call functions (uncomment when backend is ready)
  const fetchSalesChart = async () => {
    try {
      setLoading(true);
      // const res = await fetch(`/api/analytics/sales?month=${period.month}&year=${period.year}`);
      // const data = await res.json();
      // setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitChart = async () => {
    try {
      setLoading(true);
      // const res = await fetch(`/api/analytics/profit?year=${year}`);
      // const data = await res.json();
      // setProfitData(data.monthlyProfitData);
    } catch (error) {
      console.error('Error fetching profit:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      // const res = await fetch(`/api/analytics/products?month=${period.month}&year=${period.year}&limit=10`);
      // const data = await res.json();
      // setTopProducts(data.topProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethod = async () => {
    try {
      setLoading(true);
      // const res = await fetch(`/api/analytics/payment-method?month=${period.month}&year=${period.year}`);
      // const data = await res.json();
      // setPaymentData({ cash: data.cash, credit: data.credit });
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => `$${(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const formatPercent = (value) => `${(value || 0).toFixed(2)}%`;

  // Calculate KPIs
  const totalRevenue = paymentData.cash.revenue + paymentData.credit.revenue;
  const totalProfit = Object.values(profitData).reduce((sum, month) => sum + (month.netProfit || 0), 0);
  const totalCollected = paymentData.cash.paid + paymentData.credit.paid;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh' }} className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ color: THEME.text }} className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p style={{ color: THEME.muted }}>Real-time business performance metrics</p>
        </div>

        {/* Period Selector */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <select 
              value={period.month} 
              onChange={(e) => setPeriod({...period, month: parseInt(e.target.value)})}
              style={{ 
                backgroundColor: THEME.card,
                borderColor: THEME.border,
                color: THEME.text
              }}
              className="px-4 py-2 rounded-lg border hover:border-[--color-border2] focus:outline-none focus:ring-2"
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${THEME.blueLight}`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{new Date(2024, m-1).toLocaleString('default', {month: 'long'})}</option>
              ))}
            </select>
            <select 
              value={period.year} 
              onChange={(e) => setPeriod({...period, year: parseInt(e.target.value)})}
              style={{ 
                backgroundColor: THEME.card,
                borderColor: THEME.border,
                color: THEME.text
              }}
              className="px-4 py-2 rounded-lg border hover:border-[--color-border2] focus:outline-none focus:ring-2"
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${THEME.blueLight}`}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchSalesChart}
            style={{ 
              backgroundColor: THEME.green,
              color: 'white'
            }}
            className="px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Load Data
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: THEME.muted }} className="text-sm font-medium">Total Revenue</p>
              <DollarSign style={{ color: THEME.green }} className="w-5 h-5" />
            </div>
            <h3 style={{ color: THEME.text }} className="text-3xl font-bold">{formatCurrency(totalRevenue)}</h3>
            <p style={{ color: THEME.hint }} className="text-xs mt-2">From all payment methods</p>
          </div>

          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: THEME.muted }} className="text-sm font-medium">Net Profit</p>
              <TrendingUp style={{ color: THEME.green }} className="w-5 h-5" />
            </div>
            <h3 style={{ color: THEME.text }} className="text-3xl font-bold">{formatCurrency(totalProfit)}</h3>
            <p style={{ color: THEME.hint }} className="text-xs mt-2">After all expenses</p>
          </div>

          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: THEME.muted }} className="text-sm font-medium">Total Collections</p>
              <CreditCard style={{ color: THEME.blue }} className="w-5 h-5" />
            </div>
            <h3 style={{ color: THEME.text }} className="text-3xl font-bold">{formatCurrency(totalCollected)}</h3>
            <p style={{ color: THEME.hint }} className="text-xs mt-2">Cash & credit received</p>
          </div>

          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: THEME.muted }} className="text-sm font-medium">Products Sold</p>
              <Package style={{ color: THEME.amber }} className="w-5 h-5" />
            </div>
            <h3 style={{ color: THEME.text }} className="text-3xl font-bold">{topProducts.reduce((sum, p) => sum + p.quantity, 0)}</h3>
            <p style={{ color: THEME.hint }} className="text-xs mt-2">{topProducts.length} unique products</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Sales Chart */}
          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6">
            <h3 style={{ color: THEME.text }} className="text-lg font-bold mb-4">Daily Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                <XAxis dataKey="day" stroke={THEME.muted} />
                <YAxis stroke={THEME.muted} />
                <Tooltip 
                  contentStyle={{backgroundColor: THEME.text, border: 'none', borderRadius: '8px', color: THEME.card}}
                  formatter={(value) => [`${value} sales`, 'Daily']}
                />
                <Line type="monotone" dataKey="sales" stroke={THEME.green} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Profit vs COGS Chart */}
          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6">
            <h3 style={{ color: THEME.text }} className="text-lg font-bold mb-4">Profit Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(profitData).map(([month, data]) => ({ month, ...data }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                <XAxis dataKey="month" stroke={THEME.muted} />
                <YAxis stroke={THEME.muted} />
                <Tooltip 
                  contentStyle={{backgroundColor: THEME.text, border: 'none', borderRadius: '8px', color: THEME.card}}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill={THEME.blue} radius={[8, 8, 0, 0]} />
                <Bar dataKey="cogs" fill={THEME.red} radius={[8, 8, 0, 0]} />
                <Bar dataKey="netProfit" fill={THEME.green} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Sales Chart */}
          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6">
            <h3 style={{ color: THEME.text }} className="text-lg font-bold mb-4">Weekly Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                <XAxis dataKey="week" stroke={THEME.muted} />
                <YAxis stroke={THEME.muted} />
                <Tooltip 
                  contentStyle={{backgroundColor: THEME.text, border: 'none', borderRadius: '8px', color: THEME.card}}
                  formatter={(value) => [`${value} sales`, 'Weekly']}
                />
                <Bar dataKey="count" fill={THEME.purple} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Method Distribution */}
          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6">
            <h3 style={{ color: THEME.text }} className="text-lg font-bold mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cash', value: paymentData.cash.revenue },
                    { name: 'Credit', value: paymentData.credit.revenue }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill={THEME.blue} />
                  <Cell fill={THEME.green} />
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6">
            <h3 style={{ color: THEME.text }} className="text-lg font-bold mb-4">Cash Sales</h3>
            <div className="space-y-3">
              <div style={{ borderColor: THEME.border }} className="flex justify-between items-center py-2 border-b">
                <span style={{ color: THEME.muted }} className="text-sm">Total Revenue</span>
                <span style={{ color: THEME.text }} className="font-semibold">{formatCurrency(paymentData.cash.revenue)}</span>
              </div>
              <div style={{ borderColor: THEME.border }} className="flex justify-between items-center py-2 border-b">
                <span style={{ color: THEME.muted }} className="text-sm">Amount Paid</span>
                <span style={{ color: THEME.green }} className="font-semibold">{formatCurrency(paymentData.cash.paid)}</span>
              </div>
              <div style={{ borderColor: THEME.border }} className="flex justify-between items-center py-2 border-b">
                <span style={{ color: THEME.muted }} className="text-sm">Pending</span>
                <span style={{ color: THEME.text }} className="font-semibold">{formatCurrency(paymentData.cash.pending)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span style={{ color: THEME.muted }} className="text-sm">Collection Rate</span>
                <span style={{ color: THEME.blue }} className="font-semibold">{formatPercent(paymentData.cash.collectionRate)}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border p-6">
            <h3 style={{ color: THEME.text }} className="text-lg font-bold mb-4">Credit Sales</h3>
            <div className="space-y-3">
              <div style={{ borderColor: THEME.border }} className="flex justify-between items-center py-2 border-b">
                <span style={{ color: THEME.muted }} className="text-sm">Total Revenue</span>
                <span style={{ color: THEME.text }} className="font-semibold">{formatCurrency(paymentData.credit.revenue)}</span>
              </div>
              <div style={{ borderColor: THEME.border }} className="flex justify-between items-center py-2 border-b">
                <span style={{ color: THEME.muted }} className="text-sm">Amount Paid</span>
                <span style={{ color: THEME.green }} className="font-semibold">{formatCurrency(paymentData.credit.paid)}</span>
              </div>
              <div style={{ borderColor: THEME.border }} className="flex justify-between items-center py-2 border-b">
                <span style={{ color: THEME.muted }} className="text-sm">Pending</span>
                <span style={{ color: THEME.red }} className="font-semibold">{formatCurrency(paymentData.credit.pending)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span style={{ color: THEME.muted }} className="text-sm">Collection Rate</span>
                <span style={{ color: THEME.blue }} className="font-semibold">{formatPercent(paymentData.credit.collectionRate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div style={{ backgroundColor: THEME.card, borderColor: THEME.border }} className="rounded-lg shadow-sm border overflow-hidden">
          <div style={{ backgroundColor: THEME.sBack, borderColor: THEME.border }} className="p-6 border-b">
            <h3 style={{ color: THEME.text }} className="text-lg font-bold">Top Selling Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: THEME.sBack, borderColor: THEME.border }} className="border-b">
                  <th style={{ color: THEME.text }} className="px-6 py-3 text-left text-sm font-semibold">Product Name</th>
                  <th style={{ color: THEME.text }} className="px-6 py-3 text-right text-sm font-semibold">Quantity</th>
                  <th style={{ color: THEME.text }} className="px-6 py-3 text-right text-sm font-semibold">Avg Price</th>
                  <th style={{ color: THEME.text }} className="px-6 py-3 text-right text-sm font-semibold">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => (
                  <tr 
                    key={product.id} 
                    style={{ 
                      backgroundColor: idx % 2 === 0 ? THEME.card : THEME.sBack,
                      borderColor: THEME.border
                    }}
                    className="border-b"
                  >
                    <td style={{ color: THEME.text }} className="px-6 py-4 text-sm font-medium">{product.name}</td>
                    <td style={{ color: THEME.muted }} className="px-6 py-4 text-sm text-right">{product.quantity}</td>
                    <td style={{ color: THEME.muted }} className="px-6 py-4 text-sm text-right">{formatCurrency(product.avgPrice)}</td>
                    <td style={{ color: THEME.text }} className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ color: THEME.hint }} className="mt-8 text-center text-sm">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-2">Uncomment API calls in component when backend is ready</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;