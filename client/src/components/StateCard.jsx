import React from 'react'

function StateCard({title , value ,icon ,trend , trendColor,iconBg }) {
  return (
    <div className='border border-border p-5 rounded-2xl shadow-sm flex flex-col gap-3'>
        <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-lg  ${iconBg}`}>{icon}</div>
            <span className='text-text text-sm font-medium'>{title}</span>
        </div>
        <div className='text-2xl font-extrabold text-text'>{value}</div>
        <div className='flex items-center gap-3'>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full${trendColor}`}>{trend}</span>
            <span className='text-text text-xs'>Va last month</span>
        </div>
        
    </div>
  )
}

export default StateCard
