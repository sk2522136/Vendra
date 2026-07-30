import User from '../models/User.js'; 
import ExpressError from '../utils/expressError.js';

const tenantMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    req.tenantId = user.tenantId;
    req.userRole = user.role;
    req.userId = user._id;

    let adminUser = user;
    
    if (user.role !== 'admin') {
      adminUser = await User.findOne({ tenantId: user.tenantId, role: 'admin' });
    }

    if (!adminUser) {
      throw new ExpressError("Tenant admin not found", 404);
    }

    // Check Subscription Expiration
    const currentDate = new Date();
    const isPlanExpired = adminUser.planExpiresAt && new Date(adminUser.planExpiresAt) < currentDate;
    const isSubscribed = adminUser.isSubscribed && !isPlanExpired;

    req.subscription = {
      isSubscribed: isSubscribed,
      planExpiresAt: adminUser.planExpiresAt,
      isExpired: isPlanExpired,
      planName: adminUser.planName || 'Free'
    };
    
    next();
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      error: error.message || 'Tenant verification failed'
    });
  }
};

export default tenantMiddleware;