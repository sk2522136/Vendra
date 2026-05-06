import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SalesTrend({ data }) {
  
  if (!data || !data.daily) {
    return <div className="text-center text-gray-500 py-8">Loading sales data...</div>;
  }

  const chartData = Object.entries(data.daily)
    .map(([day, count]) => ({
      day: `Day ${day}`,
      sales: count
    }))
    .slice(0, 15); // Last 15 days

  return (
    <div>
      <h2 className='text-lg font-bold mb-4 text-black'>Sales Trend</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            formatter={(value) => [`${value} sales`, 'Count']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#000" 
            dot={{ fill: '#000', r: 4 }}
            strokeWidth={2}
            name="Daily Sales"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesTrend;