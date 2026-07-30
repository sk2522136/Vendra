import React, { useState, useEffect, useCallback } from 'react';
import { HiSearch, HiBan, HiCheckCircle } from 'react-icons/hi';
import { getAllTenants, toggleTenantStatus, updateTenantPlan } from '../../services/api';

const TenantDirectory = () => {
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('All');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllTenants({
        search: debouncedSearch,
        plan: selectedPlanFilter,
      });

      const payload = res?.data || res;
      let fetchedTenants = [];

      if (Array.isArray(payload)) {
        fetchedTenants = payload;
      } else if (Array.isArray(payload?.tenants)) {
        fetchedTenants = payload.tenants;
      } else if (Array.isArray(payload?.data)) {
        fetchedTenants = payload.data;
      }

      setTenants(fetchedTenants);
    } catch (err) {
      console.error("Failed to load tenants:", err);
      setTenants([]);
    }  finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedPlanFilter]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleToggleStatus = async (tenant) => {
    try {
      const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
      await toggleTenantStatus(tenant._id, newStatus);
      setActiveModal(null);
      fetchTenants();
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update tenant status");
    }
  };

  const handleChangePlan = async (tenant, newPlanKey) => {
    try {
      await updateTenantPlan(tenant._id, newPlanKey);
      setActiveModal(null);
      fetchTenants();
    } catch (error) {
      console.error("Plan update error:", error);
      alert("Failed to update subscription plan");
    }
  };

  return (
    <div className="space-y-6 font-mona animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Tenant Directory</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search store name, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-body border border-border rounded-xl text-sm focus:outline-none text-text"
          />
        </div>
        <select 
          value={selectedPlanFilter}
          onChange={(e) => setSelectedPlanFilter(e.target.value)}
          className="px-4 py-2.5 bg-bg-body border border-border rounded-xl text-sm font-semibold text-text"
        >
          <option value="All">All Plans</option>
          <option value="Pro">Pro Tier</option>
          <option value="Free">Free Tier</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center text-muted shadow-sm">
          Loading tenants...
        </div>
      ) : (!Array.isArray(tenants) || tenants.length === 0) ? (
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center text-muted shadow-sm">
          No tenants found matching your criteria.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {tenants.map((tenant) => (
              <div 
                key={tenant._id} 
                className="bg-bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-text text-base">{tenant.name}</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {tenant.ownerUserId?.name} • {tenant.ownerUserId?.email}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md ${
                    tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {tenant.status === 'active' ? <HiCheckCircle /> : <HiBan />}
                    {tenant.status}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs">
                  <span className="text-muted font-medium">Subscription:</span>
                  <span className="font-bold uppercase text-text">{tenant.subscriptionPlan}</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => { setSelectedTenant(tenant); setActiveModal('plan'); }}
                    className="flex-1 py-2 text-xs font-bold text-bg-primary bg-bg-primary/5 hover:bg-bg-primary/10 rounded-lg border border-bg-primary/20 text-center"
                  >
                    Change Plan
                  </button>
                  <button 
                    onClick={() => { setSelectedTenant(tenant); setActiveModal('status'); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center ${
                      tenant.status === 'active' 
                        ? 'text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10' 
                        : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                    }`}
                  >
                    {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-bg-body border-b border-border text-muted text-xs font-bold uppercase">
                    <th className="p-4">Store Profile</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {tenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-bg-body/40">
                      <td className="p-4">
                        <div className="font-bold text-text text-base">{tenant.name}</div>
                        <div className="text-xs text-muted mt-0.5">
                          {tenant.ownerUserId?.name} • {tenant.ownerUserId?.email}
                        </div>
                      </td>
                      <td className="p-4 font-bold uppercase text-xs">{tenant.subscriptionPlan}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md ${
                          tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {tenant.status === 'active' ? <HiCheckCircle /> : <HiBan />}
                          {tenant.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => { setSelectedTenant(tenant); setActiveModal('plan'); }}
                          className="px-3 py-1.5 text-xs font-bold text-bg-primary hover:bg-bg-primary/10 rounded-lg border border-bg-primary/20"
                        >
                          Change Plan
                        </button>
                        <button 
                          onClick={() => { setSelectedTenant(tenant); setActiveModal('status'); }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                            tenant.status === 'active' 
                              ? 'text-rose-500 border-rose-500/20 hover:bg-rose-500/10' 
                              : 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10'
                          }`}
                        >
                          {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative w-full max-w-md bg-bg-card border border-border rounded-2xl p-6 shadow-2xl">
            {activeModal === 'status' && (
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-bold text-text">
                  {selectedTenant.status === 'active' ? 'Suspend Store Account?' : 'Activate Store Account?'}
                </h3>
                <p className="text-sm text-muted">
                  Are you sure you want to change status for <strong>{selectedTenant.name}</strong>?
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="flex-1 py-2.5 bg-bg-body border border-border rounded-xl text-sm font-semibold text-text"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(selectedTenant)}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-bg-primary rounded-xl shadow-md"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'plan' && (
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-bold text-text">Change Plan Tier</h3>
                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => handleChangePlan(selectedTenant, 'free')}
                    className="w-full p-4 rounded-xl border border-border text-left hover:bg-bg-body font-bold text-text"
                  >
                    Free Tier
                  </button>
                  <button 
                    onClick={() => handleChangePlan(selectedTenant, 'pro')}
                    className="w-full p-4 rounded-xl border border-border text-left hover:bg-bg-body font-bold text-text"
                  >
                    Pro Tier
                  </button>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-full py-2 bg-bg-body border border-border rounded-xl text-sm font-semibold text-text mt-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDirectory;