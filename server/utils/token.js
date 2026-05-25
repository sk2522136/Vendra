import jwt from 'jsonwebtoken';
import ExpressError from './expressError.js';


export const generateAccessToken = (payload) =>{
    try {
            return jwt.sign(payload ,process.env.JWT_SECRET,{expiresIn : '15m'})

} catch (error) {
        console.log(error.message);
         throw new ExpressError("Token generation failed",500);
}   
} 

export const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  } catch (error) {
    console.log(error.message);
    throw new ExpressError("Refresh token generation failed", 500);
  }
};


export const verifyToken = (token) =>{
try {
    return jwt.verify(token , process.env.JWT_SECRET)
} catch (error) {
        console.log(error.message)
    throw new ExpressError("Invalid Token",401);
}   
} 