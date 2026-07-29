// seedSuperAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; 


const MONGO_URI =  'mongodb+srv://sk2522136_db_user:Rh5oyhZljN2ljQdP@cluster0.vujwrr2.mongodb.net/vendra?retryWrites=true&w=majority&appName=Cluster0';

const seedSuperAdmin = async () => {
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!');

    const adminEmail = 'admin@vendra.com';
    const adminPassword = 'SuperSecretPass123!';

    // Check if Super Admin already exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [{ role: 'super_admin' }, { isSuperAdmin: true }] 
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        name: 'Platform Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        isSuperAdmin: true,
        isActive: true,
        isAdmin: true,
        isEmailVerified: true,
        tenantId: null // Independent of any store/organization
      });

      console.log('🎉 Super Admin account created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log('ℹ️ Super Admin already exists in the database.');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error.message);
    process.exit(1);
  }
};

// Execute Script
seedSuperAdmin();