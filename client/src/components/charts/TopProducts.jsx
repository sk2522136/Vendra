import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function TopProducts({ data }) {
  
  if (!data || !data.topProducts || data.topProducts.length === 0) {
    return <div className="text-center text-muted py-8">No product data available</div>;
  }

  const chartData = data.topProducts.slice(0, 5).map(product => ({
    name: product.name.substring(0, 12),
    quantity: product.quantity,
    revenue: product.revenue
  }));

  return (
    <div>
      <h2 className='text-lg font-black mb-6 text-black tracking-tight'>Top 5 Selling Products</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" fontSize={12} tick={{fill: '#000000'}} />
          <YAxis fontSize={12} tick={{fill: '#000000'}} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(value) => [value, 'Units']}
          />
          <Legend />
          <Bar 
            dataKey="quantity" 
            fill="#1a3a99" 
            name="Units Sold" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopProducts;