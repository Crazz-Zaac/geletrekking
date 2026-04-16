const express = require('express');
const router = express.Router();
const controller = require('../controllers/travelGuideController');

// Public routes only - guides are now served from static data
router.get('/', controller.getGuides);
router.get('/category/:category', controller.getGuidesByCategory);
router.get('/slug/:slug', controller.getGuideBySlug);

module.exports = router;
