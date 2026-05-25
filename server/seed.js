import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; // Sahi path check karein


const seedAdmin = async () => {
   try{
           await mongoose.connect(process.env.MONGO_URI)
           console.log("DataBase Connected Successfully"); 

    // Password ko hash karna zaroori hai
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      name: "Admin",
      email: "admin@vendra.com",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true, // Manual admin hai to verify karne ki zaroorat nahi
      isActive: true
    });

    await admin.save();
    console.log("✅ Admin User Created Successfully!");
    console.log("Email: admin@vendra.com | Password: admin123");
    
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();