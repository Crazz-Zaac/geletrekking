const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { restrictToRoles } = require('../middleware/roleMiddleware');
const { auditContent } = require('../middleware/auditMiddleware');
const controller = require('../controllers/travelGuideController');

router.get('/', controller.getGuides);
router.get('/admin', authMiddleware, restrictToRoles('admin', 'superadmin'), controller.getGuidesAdmin);
router.post('/', authMiddleware, restrictToRoles('admin', 'superadmin'), auditContent('guide', (req) => ({ targetLabel: req.body?.title })), controller.createGuide);
router.put('/:id', authMiddleware, restrictToRoles('admin', 'superadmin'), auditContent('guide', (req) => ({ targetId: req.params.id })), controller.updateGuide);
router.delete('/:id', authMiddleware, restrictToRoles('admin', 'superadmin'), auditContent('guide', (req) => ({ targetId: req.params.id })), controller.deleteGuide);
router.get('/category/:category', controller.getGuidesByCategory);
router.get('/slug/:slug', controller.getGuideBySlug);

module.exports = router;
