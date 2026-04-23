import React, { useState } from 'react';

const AddLog = () => {
  const [logs, setLogs] = useState([
    { product: "Laptop", quantityChange: 5, type: "Purchase", createdBy: "Sahil", sale: "N/A" }
  ]);

  const [formData, setFormData] = useState({
    product: '', quantityChange: '', type: 'Sale', createdBy: '', sale: 'N/A'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddLog = () => {
    setLogs([...logs, formData]);
    setFormData({ product: '', quantityChange: '', type: 'type', createdBy: '', sale: 'N/A' });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Add Audit Form (Responsive) */}
      <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4">Add Audit Log</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input name="product" value={formData.product} onChange={handleInputChange} placeholder="Product Name" className="p-3 rounded-xl bg-sBack border border-border outline-none focus:border-green" />
          <input name="quantityChange" type="number" value={formData.quantityChange} onChange={handleInputChange} placeholder="Qty Change" className="p-3 rounded-xl bg-sBack border border-border outline-none focus:border-green" />
          
          <select name="type" value={formData.type} onChange={handleInputChange} className="p-3 rounded-xl bg-sBack border border-border text-muted">
            <option>Sale</option>
            <option>Purchase</option>
            <option>Return</option>
            <option>Sale Cancellation</option>
            <option>Adjustment</option>
          </select>

          <input name="createdBy" value={formData.createdBy} onChange={handleInputChange} placeholder="Created By" className="p-3 rounded-xl bg-sBack border border-border" />
          <input name="sale" value={formData.sale} onChange={handleInputChange} placeholder="Sale ID/Ref" className="p-3 rounded-xl bg-sBack border border-border" />
          
          <button onClick={handleAddLog} className="md:col-span-2 lg:col-span-1 bg-green text-white font-bold py-3 rounded-xl hover:bg-green-dark">Save Log</button>
        </div>
      </div>

      {/* 2. Log Table (Responsive with overflow-x-auto) */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-150">
            <thead className="bg-sBack">
              <tr className="text-xs text-muted uppercase">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Change</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">By</th>
                <th className="px-6 py-4">Sale Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-sBack/50">
                  <td className="px-6 py-4 font-bold text-text">{log.product}</td>
                  <td className={`px-6 py-4 font-bold ${log.quantityChange > 0 ? 'text-green' : 'text-red'}`}>{log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}</td>
                  <td className="px-6 py-4 text-xs font-bold text-muted">{log.type}</td>
                  <td className="px-6 py-4 text-xs text-muted">{log.createdBy}</td>
                  <td className="px-6 py-4 text-xs text-muted">{log.sale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddLog;