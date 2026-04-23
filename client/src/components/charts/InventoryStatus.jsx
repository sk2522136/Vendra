import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';

const statusData = [
  { name: 'Available', value: 65, fill: '#1D9E75' }, // Green
  { name: 'Low Stock', value: 25, fill: '#EF9F27' }, // Amber
  { name: 'Out of Stock', value: 10, fill: '#E24B4A' }, // Red
];

const InventoryStatus = () => (
  <div className="bg-white p-6 rounded-2xl border border-border shadow-sm h-95">
    <h3 className="text-lg font-bold text-text mb-2">Inventory Status</h3>
    <ResponsiveContainer width="100%" height="80%">
      <PieChart>
        <Pie 
          data={statusData} 
          innerRadius={60} 
          outerRadius={85} 
          paddingAngle={5} 
          dataKey="value"
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '10px', 
            border: 'none',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }} 
        />
      </PieChart>
    </ResponsiveContainer>
    <div className="flex justify-between mt-2 text-xs font-medium">
      <span className="text-nomo-green">Available: 65%</span>
      <span className="text-nomo-amber">Low: 25%</span>
      <span className="text-nomo-red">Out: 10%</span>
    </div>
  </div>
);

export default InventoryStatus;