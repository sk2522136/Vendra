import React from 'react'

function StateCard({ title, value, icon, trend }) {
  return (
    <div className="bg-bg-card border border-gray-100 p-6 rounded-2xl flex flex-col gap-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      
      {/* Header with Icon */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-bg-body">
          {icon}
        </div>
        <span className="text-sm font-semibold text-black">{title}</span>
      </div>
      
      {/* Main Value */}
      <div className="text-2xl font-black text-black">
        {value}
      </div>
      
      {/* Footer Trend */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold px-2 py-1 rounded-full text-bg-primary bg-bg-body">
          {trend}
        </span>
        <span className="text-xs text-muted">vs last month</span>
      </div>
      
    </div>
  )
}

export default StateCard