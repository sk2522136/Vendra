import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken,verifyToken} from '../utils/token.js';
import bcrypt from "bcryptjs";
import {setAuthCookie  } from '../utils/cookieUtils.js';
import {clearAuthCookie  } from "../utils/cookieUtils.js";
import ExpressError from "../utils/expressError.js";
import crypto from 'crypto'; 
import sendEmail from '../utils/sendEmail.js'; 
import { validatePassword } from '../utils/passwordValidator.js';


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
        
            
            const payload = {
                   id: user._id,
                  email: user.email,
                  role: user.role
            }
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
               return res.status(200).json({success : true , message :"Logged In", user:{ id: user._id,email: user.email, name: user.name , role: user.role,}})
           
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
    const existingUser = await User.findOne({email});
    if(existingUser){
            throw new ExpressError("User Already Exist", 400);
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
         throw new ExpressError(passwordCheck.message, 400); // 400 Bad Request
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);



    const newUser = new User({
        name:name,
        email:email,
        password:hashedPassword,
        role: role || 'staff',
        isEmailVerified: false, 
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry
    })
    await newUser.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const emailHtml = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 24px; background-color: #ffffff; color: #171717;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #171717;">
        <span style="background-color: #000000; color: #ffffff; padding: 4px 10px; border-radius: 8px;">V</span>endra
      </h1>
    </div>

    <h2 style="color: #171717; text-align: center; font-size: 24px; margin-bottom: 20px;">Welcome to Inventos!</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hi <strong>${name}</strong>,</p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
      Admin ne aapko Inventos POS System par register kar diya hai. Apna account active karne aur access hasil karne ke liye niche diye gaye button par click karein:
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${verificationUrl}" 
         style="background-color: #171717; color: #ffffff; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
         Verify Email Account
      </a>
    </div>

    <div style="border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 30px;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
        Yeh link 24 ghante ke liye valid hai. Agar button kaam nahi kar raha, toh is link ko copy karke browser mein paste karein:
      </p>
      <p style="color: #6b7280; font-size: 11px; word-break: break-all; background: #f9fafb; padding: 10px; border-radius: 8px;">
        ${verificationUrl}
      </p>
    </div>
    
    <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
      &copy; 2026 Inventos POS. All rights reserved.
    </p>
  </div>
`;

    // 6. Email send karein (Nodemailer se)
    try {
        await sendEmail({
            email: newUser.email,
            subject: 'Activate Your Inventos Account - Email Verification',
            html: emailHtml
        });
    } catch (emailError) {
        // Agar kisi wajah se email na jaye, toh admin ko bata dein par user DB mein ban chuka hoga
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
  const users = await User.find().select('-password');
  
  return res.status(200).json({
    success: true,
    message: 'Staff retrieved successfully',
    users: users
  });
};

export const isAuth = async (req, res) => {
    if (req.user) {
        return res.status(200).json({ 
            success: true, 
            user: req.user 
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
        role: user.role
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

    // Success response send karein
    return res.status(200).json({
        success: true,
        message: "Your email has been verified successfully! You can now login to your account."
    });
};

// DELETE /api/auth/staff/:id
export const deleteStaff = async (req, res) => {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
        throw new ExpressError("Staff member not found", 404);
    }

    // Optional: Prevent deleting the super admin (agar admin ka role 'admin' hai)
    if (user.role === 'admin') {
        throw new ExpressError("Cannot delete admin account", 403);
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Staff member deleted successfully"
    });
};

