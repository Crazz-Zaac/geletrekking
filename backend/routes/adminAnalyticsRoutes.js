const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const restrictToRoles = require('../middleware/roleMiddleware')
const { getAdminAnalytics } = require('../controllers/adminAnalyticsController')

const router = express.Router()

router.get('/', authMiddleware, restrictToRoles('admin', 'superadmin'), getAdminAnalytics)

module.exports = router
