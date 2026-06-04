const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { requirePermission } = require('../middleware/roleMiddleware')
const { getAdminAnalytics } = require('../controllers/adminAnalyticsController')

const router = express.Router()

router.get('/', authMiddleware, requirePermission('manage_settings'), getAdminAnalytics)

module.exports = router
