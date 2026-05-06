import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

function InventoryStatus({ data }) {
  
  if (!data) {
    return <div className="text-center text-gray-500 py-8">Loading payment data...</div>;
  }

  const chartData = [
    {
      name: `Cash (${data.cash?.count || 0} sales)`,
      value: data.cash?.revenue || 0
    },
    {
      name: `Credit (${data.credit?.count || 0} sales)`,
      value: data.credit?.revenue || 0
    }
  ];

  const COLORS = ['#000000', '#808080'];

  return (
    <div>
      <h2 className='text-lg font-bold mb-4 text-black'>Payment Method Distribution</h2>
      
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: Rs ${(value/1000).toFixed(0)}k`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>

        {/* Stats Sidebar */}
        <div className="mt-6 lg:mt-0 lg:ml-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Cash Sales</p>
            <p className="text-xl font-bold text-black">Rs {(data.cash?.revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">Collection: {data.cash?.collectionRate}%</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Credit Sales</p>
            <p className="text-xl font-bold text-black">Rs {(data.credit?.revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-1">Pending: Rs {(data.credit?.pending || 0).toLocaleString()}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-xl font-bold text-black">Rs {(data.totalPaid || 0).toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">Overall: {((data.totalPaid / (data.totalRevenue || 1)) * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryStatus;