const express = require('express');
const router = express.Router();
const AboutUs = require('../models/AboutUsContent'); // Adjust path if needed

// GET all About Us entries
router.get('/', async (req, res) => {
  try {
    const abouts = await AboutUs.find();

    // Optional: Add this during development if DB is empty
    if (abouts.length === 0) {
      const defaultAbout = new AboutUs({
        heading: 'Welcome to Geletrekking',
        description: 'We organize the best trekking experiences in Nepal and beyond.',
        imageUrl: 'https://example.com/test-image.jpg',
        price: 1200,
        days: 7,
        groupSize: 10,
      });

      await defaultAbout.save();
      return res.json([defaultAbout]);
    }

    res.json(abouts);
  } catch (err) {
    console.error('❌ Failed to fetch About Us data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
