import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function InventoryStatus({ data }) {
  
  if (!data) {
    return <div className="text-center text-muted py-8">Loading payment data...</div>;
  }

  const chartData = [
    { name: `Cash (${data.cash?.count || 0} sales)`, value: data.cash?.revenue || 0 },
    { name: `Credit (${data.credit?.count || 0} sales)`, value: data.credit?.revenue || 0 }
  ];

  const COLORS = ['#1a3a99', '#0f2463'];

  return (
    <div>
      <h2 className='text-lg font-black mb-6 text-black tracking-tight'>Payment Method Distribution</h2>
      
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name.split(' ')[0]}: Rs ${(value/1000).toFixed(0)}k`}
              outerRadius={90}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => `Rs ${value.toLocaleString()}`} 
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 lg:mt-0 lg:ml-6 space-y-4 w-full lg:w-72">
          <div className="p-4 bg-bg-body rounded-xl border border-gray-100">
            <p className="text-xs text-muted uppercase font-bold">Cash Sales</p>
            <p className="text-xl font-black text-black">Rs {(data.cash?.revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">Collection: {data.cash?.collectionRate}%</p>
          </div>

          <div className="p-4 bg-bg-body rounded-xl border border-gray-100">
            <p className="text-xs text-muted uppercase font-bold">Credit Sales</p>
            <p className="text-xl font-black text-black">Rs {(data.credit?.revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-1 font-medium">Pending: Rs {(data.credit?.pending || 0).toLocaleString()}</p>
          </div>

          <div className="p-4 bg-bg-body rounded-xl border border-gray-100">
            <p className="text-xs text-muted uppercase font-bold">Total Paid</p>
            <p className="text-xl font-black text-black">Rs {(data.totalPaid || 0).toLocaleString()}</p>
            <p className="text-xs text-bg-primary mt-1 font-medium">Overall: {((data.totalPaid / (data.totalRevenue || 1)) * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryStatus;