const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

//router.post('/login', login);
router.post('/login', (req, res, next) => {
  //console.log('Login route hit', req.body);
  next();
}, login);


module.exports = router;
