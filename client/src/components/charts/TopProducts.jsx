const TopProducts = () => {
  const products = [
    { name: "Organic Flour 10kg", sales: "120 Units", growth: "+15%" },
    { name: "Cooking Oil 5L", sales: "95 Units", growth: "+10%" },
    { name: "Basmati Rice 5kg", sales: "88 Units", growth: "+8%" },
    { name: "Sugar 2kg", sales: "70 Units", growth: "-2%" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
      <h3 className="text-lg font-bold text-text mb-4">Top Selling Products</h3>
      <div className="space-y-4">
        {products.map((p, index) => (
          <div key={index} className="flex justify-between items-center p-3 hover:bg-nomo-light rounded-xl transition-colors">
            <div>
              <p className="text-sm font-bold text-text">{p.name}</p>
              <p className="text-xs text-hint">{p.sales}</p>
            </div>
            <span className={`text-xs font-bold ${p.growth.includes('+') ? 'text-green' : 'text-red'}`}>
              {p.growth}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts