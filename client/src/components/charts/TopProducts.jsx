import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function TopProducts({ data }) {
  
  if (!data || !data.topProducts || data.topProducts.length === 0) {
    return <div className="text-center text-gray-500 py-8">No product data available</div>;
  }

  const chartData = data.topProducts.slice(0, 5).map(product => ({
    name: product.name.substring(0, 12), // Truncate long names
    quantity: product.quantity,
    revenue: product.revenue
  }));

  return (
    <div>
      <h2 className='text-lg font-bold mb-4 text-black'>Top 5 Selling Products</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            formatter={(value) => [value, 'Units']}
          />
          <Legend />
          <Bar dataKey="quantity" fill="#000" name="Units Sold" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopProducts;