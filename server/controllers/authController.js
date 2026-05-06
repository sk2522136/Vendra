import User from '../models/User.js'
import { generateToken } from '../utils/token.js';
import bcrypt from "bcryptjs";
import { setAuthCookie  } from '../utils/cookieUtils.js';
import {clearAuthCookie } from "../utils/cookieUtils.js";
import ExpressError from "../utils/expressError.js";



 // Admin login : /api/auth/login
export const userLogin = async (req , res ) => {
         const {email , password} = req.body;
         //Admin login
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const payload = {
              id: "admin",
              email: email,
              role: "admin"
            } 
         const token = generateToken(payload)
         setAuthCookie(res,token)
         return res.status(200).json({success: true,message: "Logged In"});
        }else{
            // staff /user login
             const user = await User.findOne({email})
               if(!user){
            throw new ExpressError("Invalid Email or password", 401);
            }

            const isMatch =  await bcrypt.compare(password , user.password)
             if(!isMatch){
            throw new ExpressError("Invalid Email or password", 401);
            }
            
            if(!user.isActive){
            throw new ExpressError("You Account is deactivate please contact admin", 403);
            }
            const payload = {
                  id: user.id,
                  email: user.email,
                  role: user.role
            }
            const token = generateToken(payload)
             setAuthCookie(res,token)
            
               return res.status(200).json({success : true , message :"Logged In"})
            }
}

// logout /api/auth/logout
export const logout = (req,res) => {
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name:name,
        email:email,
        password:hashedPassword,
        role:role,
    })
    await newUser.save();
 return res.status(201).json({
  success: true,
  message: 'User created successfully',
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

