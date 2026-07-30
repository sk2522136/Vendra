import ExpressError from '../utils/expressError.js';
import User from '../models/User.js';

const superAdminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user || (!user.isSuperAdmin && user.role !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        message: "Only super admin can access this route" 
      });
    }

    req.isSuperAdmin = true;
    req.user = user;

    next();
  } catch (error) {
    return res.status(error.statusCode || 500).json({ 
      success: false,
      message: error.message || "Super Admin Authorization failed"
    });
  }
};

export default superAdminMiddleware;