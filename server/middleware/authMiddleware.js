import { verifyToken } from "../utils/token.js"
import ExpressError from '../utils/expressError.js';
import User from '../models/User.js'; 

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
        if (!token) {
      throw new ExpressError("No token provided", 401);
    }
    const decodedToken = verifyToken(token);

    if (decodedToken && decodedToken.id) {
      const user = await User.findById(decodedToken.id).select('-password');
      
      if (!user) {
        throw new ExpressError("User no longer exists", 401);
      }
      if (!user.isActive) {
        throw new ExpressError("Your account is deactivated", 403);
      }
      req.user = user;
      return next();
    } else {
      throw new ExpressError("Unauthorized", 401);
    }
     
  } catch (error) {
    if (error.statusCode !== 401) {
      console.error("Auth Middleware Error:", error.message);
    }
      return res.status(error.statusCode || 401).json({
      success: false, 
      message: error.message || "Unauthorized"
    });
  }
}

export default authMiddleware;