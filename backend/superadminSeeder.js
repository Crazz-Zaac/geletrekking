const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('./models/user');

dotenv.config();

// Construct MongoDB URI dynamically
const buildMongoUri = () => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }
  
  const username = encodeURIComponent(process.env.MONGO_USERNAME || process.env.MONGO_INITDB_ROOT_USERNAME);
  const password = encodeURIComponent(process.env.MONGO_PASSWORD || process.env.MONGO_INITDB_ROOT_PASSWORD);
  const host = process.env.MONGO_HOST || 'mongo';
  const port = process.env.MONGO_PORT || '27017';
  const database = process.env.MONGO_DATABASE || 'geletrekking';
  const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
  
  return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`;
};

const MONGO_URI = buildMongoUri();
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
      console.log('Superadmin created');
    }
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();