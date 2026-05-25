import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  
    keyGenerator: (req, res) => {
   if (req.body && req.body.email) {
      return req.body.email;
    }
    return ipKeyGenerator(req, res);
  },

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'This specific account has too many login attempts. Please try again after 15 minutes.'
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false,
});