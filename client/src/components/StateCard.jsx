import React from 'react'

function StateCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
      
      {/* Header with Icon */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#faf8f0]">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      
      {/* Main Value */}
      <div className="text-2xl font-black text-black">
        {value}
      </div>
      
      {/* Footer Trend */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold px-2 py-1 rounded-full text-[#93991f] bg-[#faf8f0]">
          {trend}
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
      
    </div>
  )
}

export default StateCard