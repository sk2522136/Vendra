import { verifyToken } from "../utils/token.js"
import ExpressError from '../utils/expressError.js';
import mongoose from "mongoose";


const authMiddleware = async (req , res , next) => {
 
    try {
        const token = req.cookies.token
        
        if(!token){
        throw new ExpressError("No token provided", 401);        }
        const decodedToken = verifyToken(token)

        
        if (decodedToken.role && decodedToken.email) {
      req.user = {
        _id: decodedToken.id=== 'admin' ? new mongoose.Types.ObjectId() : decodedToken.id, 
        email: decodedToken.email,
        role: decodedToken.role
      };

      next();
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
     
    } catch (error) {
        console.error( error.message);
        return res.status(401).json({success : false , message : "Unauthorized"})
        
    }
}

export default authMiddleware;