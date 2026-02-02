// enable2fa.js
const mongoose = require('mongoose');
const speakeasy = require('speakeasy');
const User = require('./models/user'); // Adjust if your model path differs

async function enable2FAForAdmins() {
  await mongoose.connect('mongodb://localhost:27017/geletrekking'); // Change DB URI if needed

  const admins = await User.find({ role: 'admin', twoFactorEnabled: false });

  for (const admin of admins) {
    const secret = speakeasy.generateSecret({ length: 20 });
    admin.twoFactorSecret = secret.base32;
    admin.twoFactorEnabled = true;
    await admin.save();
    console.log(`2FA enabled for ${admin.email}`);
  }

  await mongoose.disconnect();
  console.log('All done!');
}

enable2FAForAdmins().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
