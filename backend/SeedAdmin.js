const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin'); // make sure path is correct

mongoose.connect('mongodb://localhost:27017/geletrekking')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const createAdmin = async () => {
  try {
    // Remove existing admin with the same email or username (optional)
    await Admin.deleteMany({ $or: [{ email: 'admin@example.com' }, { username: 'admin' }] });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new Admin({
      email: 'admin@example.com',
      username: 'admin',    // Add this to fix duplicate null error
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
