import User from '../models/User.js'
import Organization from '../models/Organization.js'
import { generateAccessToken, generateRefreshToken,verifyToken} from '../utils/token.js';
import bcrypt from "bcryptjs";
import {setAuthCookie  } from '../utils/cookieUtils.js';
import {clearAuthCookie  } from "../utils/cookieUtils.js";
import ExpressError from "../utils/expressError.js";
import crypto from 'crypto'; 
import sendEmail from '../utils/sendEmail.js'; 
import { validatePassword } from '../utils/passwordValidator.js';



 
export const signup = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    // 1. Validation
    if (!name || !email || !password || !companyName) {
      throw new ExpressError("All fields are required", 400);
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ExpressError("Email already exists", 409);
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User (marked as admin & active)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isSuperAdmin: false,
      role: 'admin',
      isEmailVerified: true
    });

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const organization = await Organization.create({
      name: companyName,
      ownerUserId: user._id,
  
    });

    // 6. Associate Organization with User
    user.tenantId = organization._id;
    await user.save();

    // 7. Simple response (No tokens, no payload, no cookies set)
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please sign in.'
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Signup failed"
    });
  }
};

//  api/auth/login
export const userLogin = async (req , res ) => {
         const {email , password} = req.body;
             const user = await User.findOne({email})
               if(!user){
            throw new ExpressError("Invalid Email or password", 401);
            }
  

     const now = new Date();
    if (user.lockedUntil && new Date(user.lockedUntil) > now) {
        throw new ExpressError("Account is locked temporarily. Try again later.", 429);
    }

        if (user.lockedUntil && new Date(user.lockedUntil) <= now) {
        user.lockedUntil = null;
        user.failedLoginAttempts = 0;
        await user.save();
    }

          if(!user.isActive){
            throw new ExpressError("You Account is deactivate please contact admin", 403);
            }

            if (!user.isSuperAdmin && user.role !== 'admin' && !user.isEmailVerified) {
    throw new ExpressError("Your email is not verified. Please check your inbox.", 403);
  }

                    
        if (user.role !== 'admin' && !user.isEmailVerified) {
    throw new ExpressError("Your email is not verified. Please check your inbox.", 403);
  }

          

            const isMatch =  await bcrypt.compare(password , user.password)
           
            
        
            if (!isMatch) {
            const attempts = (user.failedLoginAttempts || 0) + 1;

           if (user.failedLoginAttempts >= 5) {
            user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            user.failedLoginAttempts = 0;
        }

            await user.save();            
            throw new ExpressError("Invalid Email or password", 401);
        }


        let subscriptionPlan = null;
  let subscriptionStatus = 'inactive';
  let subscriptionEndDate = null;

  if (user.isSuperAdmin || user.role === 'super_admin') {
    subscriptionPlan = 'enterprise';
    subscriptionStatus = 'active';
  } else if (user.tenantId) {
    const organization = await Organization.findById(user.tenantId);
    
    if (organization) {
    if (organization.status === 'suspended' || organization.status === 'inactive') {
      throw new ExpressError("Your store/organization account is suspended. Please contact admin.", 403);
    }
  }

    if (organization) {
      subscriptionPlan = organization.subscriptionPlan;
      subscriptionStatus = organization.subscriptionStatus;
      subscriptionEndDate = organization.subscriptionEndDate;

      if (organization.subscriptionEndDate && new Date(organization.subscriptionEndDate) < now) {
        subscriptionStatus = 'expired';
        organization.subscriptionStatus = 'expired';
        await organization.save();
      }
    }
  }
            
            const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId || null,
    isSuperAdmin: user.isSuperAdmin || false,
  };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);
            setAuthCookie(res, accessToken, refreshToken);

            if (!user.refreshTokens) {
            user.refreshTokens = [];
          }

            user.refreshTokens.push({ token: refreshToken });
            user.lastLogin = new Date();
            user.failedLoginAttempts = 0;
            user.lockedUntil = null;
            await user.save();
          return res.status(200).json({success : true , message :"Logged In", user:{ id: user._id,email: user.email, name: user.name , role: user.role,tenantId: user.tenantId,subscriptionPlan,
      subscriptionStatus,
      subscriptionEndDate
    }})
           
}





// logout /api/auth/logout
export const logout =  async (req,res) => {
   const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken && req.user ) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
  }
  
  
  clearAuthCookie(res)
    res.status(200).json({success : true , message :"Logged Out"})
   }

// post :/api/auth/register
export const registerStaff = async (req , res) =>  {
   const {name , email , password ,role} = req.body;
   const tenantId = req.tenantId || req.user?.tenantId; 
    const existingUser = await User.findOne({email});
    if(existingUser){
            throw new ExpressError("User Already Exist", 400);
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
         throw new ExpressError(passwordCheck.message, 400);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);



    const newUser = new User({
        name:name,
        email:email,
        password:hashedPassword,
        role: role || 'staff',
        tenantId: tenantId,
        isEmailVerified: false, 
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry
    })
    await newUser.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

   const emailHtml = `
  <div style="font-family: 'Mona Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #dbeafe; border-radius: 24px; background-color: #f8fafc; color: #111827;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #111827;">
        <span style="background-color: #1a3a99; color: #ffffff; padding: 4px 10px; border-radius: 8px;">V</span>endra
      </h1>
    </div>

    <h2 style="color: #111827; text-align: center; font-size: 24px; margin-bottom: 20px;">Welcome to Vendra!</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #111827;">Hi <strong>${name}</strong>,</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #111827;">
      The administrator has registered you on the Vendra System. To activate your account and gain access, please click the button below.
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${verificationUrl}" 
         style="background: linear-gradient(to right, #1a3a99, #0f2463); color: #ffffff; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(26, 58, 153, 0.2);">
         Verify Email Account
      </a>
    </div>

    <div style="border-top: 1px solid #dbeafe; padding-top: 20px; margin-top: 30px;">
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
        This link is valid for 24 hours. If the button doesn't work, please copy and paste this link into your browser:
      </p>
      <p style="color: #94a3b8; font-size: 11px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 8px;">
        ${verificationUrl}
      </p>
    </div>
    
    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px;">
      &copy; 2026 Vendra. All rights reserved.
    </p>
  </div>
`;

// send mail to user
    try {
        await sendEmail({
            email: newUser.email,
            subject: 'Activate Your Vendra Account - Email Verification',
            html: emailHtml
        });
    } catch (emailError) {
        console.error("Verification email sending failed:", emailError.message);
    }

 return res.status(201).json({
  success: true,
  message: 'User created and email sent  successfully',
  user: {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  }
}); 
}

export const getAllStaff = async (req, res) => {
  // Safe Fallback: Check req.tenantId or req.user.tenantId
  const tenantId = req.tenantId || req.user?.tenantId;

  if (!tenantId) {
    throw new ExpressError("Tenant context missing", 400);
  }

  const users = await User.find({ 
    tenantId: tenantId,  
    role: { $in: ['manager', 'staff'] }
  }).select('-password');
  
  return res.status(200).json({
    success: true,
    message: 'Staff retrieved successfully',
    users: users
  });
};

export const isAuth = async (req, res) => {
    if (req.user) {
       const now = new Date();
    let subscriptionPlan = null;
    let subscriptionStatus = 'inactive';
    let subscriptionEndDate = null;

    if (req.user.tenantId) {
      const organization = await Organization.findById(req.user.tenantId);
      if (organization) {
        subscriptionPlan = organization.subscriptionPlan;
        subscriptionStatus = organization.subscriptionStatus;
        subscriptionEndDate = organization.subscriptionEndDate;

        if (organization.subscriptionEndDate && new Date(organization.subscriptionEndDate) < now) {
          subscriptionStatus = 'expired';
          organization.subscriptionStatus = 'expired';
          await organization.save();
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      user: {
        ...req.user.toObject ? req.user.toObject() : req.user,
        subscriptionPlan,
        subscriptionStatus,
        subscriptionEndDate
        }
    });
    }
            throw new ExpressError("Not log in", 401);
};


export const refreshAccessToken = async (req, res) => {
  try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
      throw new ExpressError("No refresh token", 401);
        }

         const decoded =  verifyToken(refreshToken);
         const user = await User.findById(decoded.id);
         if(!user || !user.refreshTokens.some(rt => rt.token === refreshToken)) {
            throw new ExpressError("Invalid refresh token", 401);
         }

         const newAccessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,  
        isSuperAdmin: user.isSuperAdmin
      });

       res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000
    });


      return res.status(200).json({ 
        success: true, 
        message: "Token refreshed",
        user: { id: user._id, email: user.email, role: user.role }
      });
  



  } catch (error) {
  
  throw new ExpressError(error.message, 401);

  }
}


// GET /api/auth/verify-email/
export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: new Date() } 
    });

    if (!user) {
        throw new ExpressError("Verification link is invalid or has expired. Please contact admin.", 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;  
    user.emailVerificationExpiry = null; 

    await user.save();

   
    return res.status(200).json({
        success: true,
        message: "Your email has been verified successfully! You can now login to your account."
    });
};

// DELETE /api/auth/staff/:id
export const deleteStaff = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const user = await User.findOne({ _id: id, tenantId });
    if (!user) {
        throw new ExpressError("Staff member not found", 404);
    }

    if (user.role === 'admin') {
        throw new ExpressError("Cannot delete admin account", 403);
    }

    

    await User.findOneAndDelete({ _id: id, tenantId });

    return res.status(200).json({
        success: true,
        message: "Staff member deleted successfully"
    });
};

