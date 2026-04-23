import React from 'react'
import StateCard from '../components/StateCard'
import { FiDollarSign, FiTrendingUp, FiClock, FiPackage } from "react-icons/fi";
import SalesTrend from '../components/charts/SalesTrend.jsx';
import InventoryStatus from '../components/charts/InventoryStatus.jsx';
import TopProducts from '../components/charts/TopProducts.jsx';


function Dashboard() {
  return (
    <div className='p-6 space-y-6'>
      <div className='grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6'>
     <StateCard 
          title="Total Sales" 
          value="Rs 84,200" 
          icon={<FiDollarSign size={20} className="text-green" />}
          iconBg="bg-nomo-light"
          trend="+12%"
          trendColor="bg-nomo-light text-nomo-green"
        />

        <StateCard 
          title="Revenue vs Target" 
          value="84%" 
          icon={<FiTrendingUp size={20} className="text-blue" />}
          iconBg="bg-blue-50"
          trend="Rs 16,000 left"
          trendColor="bg-blue-50 text-nomo-blue"
        />

        <StateCard 
          title="Pending Payments" 
          value="Rs 18,500" 
          icon={<FiClock size={20} className="text-amber" />}
          iconBg="bg-orange-50"
          trend="10 pending"
          trendColor="bg-orange-50 text-nomo-amber"
        />

        <StateCard 
          title="Avg Order Value" 
          value="Rs 1,003" 
          icon={<FiPackage  size={20} className="text--purple" />}
          iconBg="bg-purple-50"
          trend="+5%"
          trendColor="bg-purple-50 text-nomo-purple"
        />
    </div>
     
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <TopProducts />
        </div>
        <div className="lg:col-span-1">
           <InventoryStatus />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3"> 
           <SalesTrend />
        </div>
      </div>
      
  </div>

    )
}

export default Dashboard
