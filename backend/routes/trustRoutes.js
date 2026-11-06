const express = require('express');
const AboutPage = require('../models/AboutPage');
const SiteSettings = require('../models/SiteSettings');
const { getReviews } = require('../utils/featurableReviews');

const router = express.Router();

// Public: small summary of trust signals (Google rating, memberships, verified
// registrations) for badges shown site-wide. Everything comes from admin-managed
// data or the cached reviews; nothing is hard-coded here.
router.get('/', async (req, res) => {
  try {
    const [reviews, about, settings] = await Promise.all([
      getReviews(),
      AboutPage.findOne().select('associations').lean(),
      SiteSettings.findOne().select('registrationsAffiliations').lean(),
    ]);

    const associations = ((about && about.associations) || [])
      .filter((item) => item && item.name && item.logoUrl)
      .map((item) => ({ name: item.name, logoUrl: item.logoUrl }));

    const verifiedRegistrations = ((settings && settings.registrationsAffiliations) || [])
      .filter((doc) => doc.status === 'uploaded' && doc.documentUrl)
      .map((doc) => doc.title);

    res.set('Cache-Control', 'public, max-age=600');
    res.json({
      rating: reviews ? reviews.averageRating : null,
      reviewCount: reviews ? reviews.totalReviewCount : null,
      writeReviewUrl: reviews ? reviews.writeReviewUrl : null,
      associations,
      verifiedRegistrations,
    });
  } catch (err) {
    console.error('trust summary error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
