// Middleware/tenantMiddleware.js

import User from '../models/User.js'; 

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
    
    if (user.isSuperAdmin) {
      req.tenantId = null;  
      req.isSuperAdmin = true;
    } else {
      req.tenantId = user.tenantId;
      req.isSuperAdmin = false;
    }
    
    req.userRole = user.role;
    req.userId = user._id;
    let adminUser = user;
    
    if (user.role !== 'admin') {
      // Find the main Admin/Owner of this tenant
      adminUser = await User.findOne({ tenantId: user.tenantId, role: 'admin' });
    }

    if (!adminUser) {
      throw new ExpressError("Tenant admin not found", 404);
    }

    // Check Expiration
    const currentDate = new Date();
    const isPlanExpired = adminUser.planExpiresAt && new Date(adminUser.planExpiresAt) < currentDate;
    const isSubscribed = adminUser.isSubscribed && !isPlanExpired;

    // Req object me status inject kar dein
    req.subscription = {
      isSubscribed: isSubscribed,
      planExpiresAt: adminUser.planExpiresAt,
      isExpired: isPlanExpired,
      planName: adminUser.planName || 'Free'
    };
    
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export default tenantMiddleware