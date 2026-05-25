import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SalesTrend({ data }) {
  
  if (!data || !data.daily) {
    return <div className="text-center text-muted py-8">Loading sales data...</div>;
  }

  const chartData = Object.entries(data.daily)
    .map(([day, count]) => ({
      day: `Day ${day}`,
      sales: count
    }))
    .slice(0, 15); // Last 15 days

  return (
    <div>
      <h2 className='text-lg font-black mb-6 text-black tracking-tight'>Sales Trend</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="day" fontSize={12} tick={{fill: '#000000'}} />
          <YAxis fontSize={12} tick={{fill: '#000000'}} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(value) => [`${value} sales`, 'Count']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#1a3a99" 
            dot={{ fill: '#1a3a99', r: 4 }}
            strokeWidth={2}
            name="Daily Sales"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesTrend;