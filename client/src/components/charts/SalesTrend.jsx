import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { day: 'Mon', sales: 4000 },
  { day: 'Tue', sales: 3000 },
  { day: 'Wed', sales: 5000 },
  { day: 'Thu', sales: 2780 },
  { day: 'Fri', sales: 1890 },
  { day: 'Sat', sales: 2390 },
  { day: 'Sun', sales: 3490 },
];

const SalesTrend = () => (
  <div className="bg-white p-6 rounded-2xl border border-border shadow-sm h-87.5">
    <h3 className="text-lg font-bold text-nomo-dark mb-4">Sales Revenue Trend</h3>
    <ResponsiveContainer width="100%" height="90%">
      <AreaChart data={salesData}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EDE9" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#5C7A62', fontSize: 12}} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#5C7A62', fontSize: 12}} />
        <Tooltip />
        <Area type="monotone" dataKey="sales" stroke="#1D9E75" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
export default SalesTrend