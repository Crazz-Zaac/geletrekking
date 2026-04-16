const express = require('express')
const router = express.Router()
const { getGoogleReviews } = require('../controllers/reviewController')

router.get('/google', getGoogleReviews)

module.exports = router
