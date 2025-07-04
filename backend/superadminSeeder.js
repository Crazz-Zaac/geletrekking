const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../backend/models/user');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const existing = await User.findOne({ email: 'superadmin@geletrekking.com' });

    if (existing) {
      console.log('Superadmin already exists');
    } else {
      const hashedPassword = await bcrypt.hash('SuperSecure123', 10);

      await User.create({
        name: 'Super Admin',
        email: 'superadmin@geletrekking.com',
        password: hashedPassword,
        role: 'superadmin'
      });

      console.log('✅ Superadmin created');
    }

    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
