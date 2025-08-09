const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController'); // contains login & googleLogin

// ✅ Email + Password login with 2FA
router.post('/login', authController.login);

// ✅ Google login
router.post('/google-login', authController.googleLogin);

module.exports = router;
