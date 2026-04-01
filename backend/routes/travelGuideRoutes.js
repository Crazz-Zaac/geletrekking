const express = require('express');
const router = express.Router();
const controller = require('../controllers/travelGuideController');
const protect = require('../middleware/authMiddleware');
const restrictToRoles = require('../middleware/roleMiddleware');

router.get('/', controller.getAllGuides);
router.get('/slug/:slug', controller.getGuideBySlug);
router.get('/category/:category', controller.getGuidesByCategory);

router.post('/', protect, restrictToRoles('admin', 'superadmin'), controller.createGuide);
router.put('/:id', protect, restrictToRoles('admin', 'superadmin'), controller.updateGuide);
router.delete('/:id', protect, restrictToRoles('admin', 'superadmin'), controller.deleteGuide);

module.exports = router;
