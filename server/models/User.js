import mongoose from 'mongoose' 


const userSchema = new mongoose.Schema({
    name : {type : String , required :true },
    email:{ type : String , required :true , unique : true, lowercase: true, trim: true },
    password : {  type : String ,required : true },
    tenantId: { type :mongoose.Schema.Types.ObjectId , ref: 'Organization' },
    isSuperAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ['super_admin', 'admin', 'manager', 'staff'], default: 'staff' },
    isActive : { type : Boolean , default : true }, 
    isAdmin: { type: Boolean, default: false  },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },  
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpiry: { type: Date, default: null},
    refreshTokens: [{
        token: String,
        createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7 days
        }
    }],
  

    },{ timestamps: true} )

    userSchema.index({ tenantId: 1, role: 1 });
    userSchema.index({ isSuperAdmin: 1 });



const User =  mongoose.models.User || mongoose.model('User' , userSchema)

export default User;