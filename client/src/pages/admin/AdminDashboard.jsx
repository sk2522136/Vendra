import { useState, useEffect } from 'react';
import { HiTrendingUp, HiOfficeBuilding, HiUsers, HiArrowSmRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { getSuperAdminStats } from "../../services/api";

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: null, recentTenants: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await getSuperAdminStats();
        setData({
          stats: response?.data?.stats || null,
          recentTenants: response?.data?.recentTenants || []
        });
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted font-bold">
        Loading  Dashboard...
      </div>
    );
  }

  const { stats, recentTenants } = data;

  const statsList = [
    { 
      name: 'Active Stores (Tenants)', 
      value: stats?.activeTenants || 0, 
      change: '+12%', 
      isPositive: true, 
      icon: <HiOfficeBuilding size={24} /> 
    },
    { 
      name: 'Total Registered Stores', 
      value: stats?.totalTenants || 0, 
      change: '+18%', 
      isPositive: true, 
      icon: <HiTrendingUp size={24} /> 
    },
    { 
      name: 'Total Platform Users', 
      value: stats?.totalUsers || 0, 
      change: '+8%', 
      isPositive: true, 
      icon: <HiUsers size={24} /> 
    },
  ];

  return (
    <div className="space-y-6 font-mona animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Welcome back, Sahil!</h1>
        <p className="text-sm text-muted">Here is what's happening across Vendra platform today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsList.map((item, index) => (
          <div 
            key={index} 
            className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-bg-primary/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted tracking-wider uppercase">{item.name}</span>
              <div className="p-2.5 rounded-xl bg-bg-body text-bg-primary border border-border shadow-inner">
                {item.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-text">{item.value}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                item.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-bg-card border border-border rounded-2xl shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between bg-bg-card">
            <div>
              <h3 className="font-bold text-text text-base">Recent Merchant Signups</h3>
              <p className="text-xs text-muted mt-0.5">Latest stores onboarding onto the ecosystem</p>
            </div>
            <Link to="/super-admin/tenants" className="text-xs font-bold text-bg-primary hover:text-bg-secondary flex items-center gap-1 transition-colors">
              View All <HiArrowSmRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-bg-body border-b border-border text-muted text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Store / Owner</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentTenants && recentTenants.length > 0 ? (
                  recentTenants.map((tenant) => (
                    <tr key={tenant._id || tenant.id} className="hover:bg-bg-body/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-text">{tenant.name || tenant.storeName || 'Unnamed Store'}</div>
                        <div className="text-xs text-muted mt-0.5">
                          {tenant.owner || tenant.ownerName || 'N/A'} • {tenant.email || 'No Email'}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-text/80">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          tenant.plan === 'Growth Pro' 
                            ? 'bg-bg-primary/10 text-bg-primary border border-bg-primary/20' 
                            : 'bg-muted/10 text-muted'
                        }`}>
                          {tenant.plan || 'Free Trial'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted font-medium">
                        {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : (tenant.date || 'N/A')}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md ${
                          tenant.status === 'Active' || tenant.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {tenant.status || (tenant.isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-xs text-muted font-semibold">
                      No recent store signups found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-text text-base">Plan Distribution</h3>
              <p className="text-xs text-muted mt-0.5">How users are split across tiers</p>
            </div>
            
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text/80">Growth Pro Tiers</span>
                <span className="text-bg-primary">64%</span>
              </div>
              <div className="w-full bg-bg-body rounded-full h-2 overflow-hidden border border-border">
                <div className="bg-bg-primary h-full rounded-full transition-all duration-500" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text/80">Free Trial Tier</span>
                <span className="text-muted">36%</span>
              </div>
              <div className="w-full bg-bg-body rounded-full h-2 overflow-hidden border border-border">
                <div className="bg-muted h-full rounded-full transition-all duration-500" style={{ width: '36%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-bg-body border border-border/60 text-xs text-muted leading-relaxed">
            💡 <strong className="text-text font-semibold">Pro-tip:</strong> Growth Pro users have increased by <span className="text-emerald-500 font-bold">14%</span> this week.
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;