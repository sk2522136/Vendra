import mongoose from 'mongoose' 


const userSchema = new mongoose.Schema({
    name : {type : String , required :true },
    email:{ type : String , required :true , unique : true, lowercase: true, trim: true },
    password : {  type : String ,required : true },
    role : { type : String , enum : ['admin' , 'staff'] , default : 'staff'},
    isActive : { type : Boolean , default : true }, 
    isAdmin: { type: Boolean, default: false  },
    isEmailVerified: { type: Boolean, default: false },
  
  // Login Tracking
    lastLogin: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },  

  // Email Verification
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpiry: { type: Date, default: null},
  
  // Password Reset
    resetPasswordToken: { type: String, default: null },
     resetPasswordExpiry: { type: Date, default: null },
  
  // Refresh Tokens (for logout tracking)
    refreshTokens: [{
        token: String,
        createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7 days
        }
    }],
  

    },{ timestamps: true} )




const User =  mongoose.models.User || mongoose.model('User' , userSchema)

export default User;