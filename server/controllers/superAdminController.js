import Organization from '../models/Organization.js';
import User from '../models/User.js';
import ExpressError from '../utils/expressError.js';

export const getAdminDashboardStats = async (req, res) => {
  const totalTenants = await Organization.countDocuments();
  const activeTenants = await Organization.countDocuments({ status: 'active' });
  const totalUsers = await User.countDocuments({ isSuperAdmin: false });

  const recentTenants = await Organization.find()
    .populate('ownerUserId', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(200).json({
    success: true,
    stats: {
      totalTenants,
      activeTenants,
      totalUsers,
    },
    recentTenants
  });
};

export const getAllTenants = async (req, res) => {
  const { search, plan } = req.query;
  let query = {};

  if (plan && plan !== 'All') {
    query.subscriptionPlan = plan.toLowerCase();
  }

  let tenants = await Organization.find(query)
    .populate('ownerUserId', 'name email')
    .sort({ createdAt: -1 });

  if (search) {
    const searchLower = search.toLowerCase();
    tenants = tenants.filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      (t.ownerUserId?.name && t.ownerUserId.name.toLowerCase().includes(searchLower)) ||
      (t.ownerUserId?.email && t.ownerUserId.email.toLowerCase().includes(searchLower))
    );
  }

  return res.status(200).json({
    success: true,
    tenants
  });
};

export const toggleTenantStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 

  if (!['active', 'suspended', 'inactive'].includes(status)) {
    throw new ExpressError("Invalid status value", 400);
  }

  const organization = await Organization.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!organization) {
    throw new ExpressError("Organization not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `Store account marked as ${status}`,
    organization
  });
};

export const updateTenantPlan = async (req, res) => {
  const { id } = req.params;
  const { subscriptionPlan } = req.body; 

  if (!['free', 'pro'].includes(subscriptionPlan)) {
    throw new ExpressError("Invalid plan level", 400);
  }

  const organization = await Organization.findByIdAndUpdate(
    id,
    { subscriptionPlan },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Subscription plan updated successfully",
    organization
  });
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const DEFAULT_PRO_PRICE_USD = 29; 

    const formatUSD = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(amount || 0);
    };

    const activeProTenantsCount = await Organization.countDocuments({
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active'
    });

    const arrAggregation = await Organization.aggregate([
      {
        $match: {
          subscriptionPlan: 'pro',
          subscriptionStatus: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalMonthlyRevenue: { $sum: '$subscriptionAmount' }
        }
      }
    ]);

    const aggregatedAmount = arrAggregation[0]?.totalMonthlyRevenue || 0;

    const monthlyTotal = aggregatedAmount > 0 
      ? aggregatedAmount 
      : (activeProTenantsCount * DEFAULT_PRO_PRICE_USD);


    const totalPaidAttempts = await Organization.countDocuments({ subscriptionPlan: 'pro' });
    const successRate = totalPaidAttempts > 0 
      ? ((activeProTenantsCount / totalPaidAttempts) * 100).toFixed(1) 
      : '100';

    const organizations = await Organization.find()
      .populate({
        path: 'ownerUserId',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedTransactions = organizations.map((org) => {
      const owner = org.ownerUserId || {};

      let statusDisplay = 'Successful';
      if (org.subscriptionStatus === 'cancelled' || org.subscriptionStatus === 'expired') {
        statusDisplay = 'Failed';
      }

      const rawAmount = org.subscriptionAmount > 0 
        ? org.subscriptionAmount 
        : (org.subscriptionPlan === 'pro' ? DEFAULT_PRO_PRICE_USD : 0);

      return {
        id: org.stripeSubscriptionId || `SUB-${org._id.toString().slice(-6).toUpperCase()}`,
        store: org.name || 'Unnamed Store',
        owner: owner.name || owner.email || 'N/A',
        amount: formatUSD(rawAmount), 
        date: org.subscriptionStartDate
          ? new Date(org.subscriptionStartDate).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : new Date(org.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
        status: statusDisplay,
        type: org.subscriptionPlan === 'pro' ? 'Monthly Pro' : 'Free Plan'
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        arr: formatUSD(monthlyTotal), 
        successRate: `${successRate}%`,
        activePaidStores: `${activeProTenantsCount} Stores`
      },
      transactions: formattedTransactions
    });

  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics.',
      error: error.message
    });
  }
};