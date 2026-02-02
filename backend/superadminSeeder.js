const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/user');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    const existing = await User.findOne({ email: SUPERADMIN_EMAIL });
    if (existing) {
      console.log('Superadmin already exists');
    } else {
      const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
      await User.create({
        name: 'Super Admin',
        email: SUPERADMIN_EMAIL,
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