
import ExpressError from '../utils/expressError.js';

const superAdminMiddleware = (req, res, next) => {
  try {
    if (!req.isSuperAdmin) {
      throw new ExpressError("Only super admin can access this", 403);
    }
    
    next();
  } catch (error) {
    return res.status(error.statusCode || 403).json({ 
      success: false,
      message: error.message || "Access denied"
    });
  }
};

export default superAdminMiddleware;