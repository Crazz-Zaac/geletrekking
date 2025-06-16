// routes/Admin/aboutUsRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const AboutUs = require('../../models/AboutUs');

// Setup multer for file uploads (storing image in public folder for now)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// @route   POST /api/aboutus
// @desc    Create AboutUs entry
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { heading, description, price, days, groupSize } = req.body;

    const newAbout = new AboutUs({
      heading,
      description,
      price,
      days,
      groupSize,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });

    await newAbout.save();
    res.status(201).json(newAbout);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create AboutUs', message: err.message });
  }
});

// @route   GET /api/aboutus
// @desc    Get all AboutUs entries
router.get('/', async (req, res) => {
  try {
    const abouts = await AboutUs.find().sort({ updatedAt: -1 });
    res.json(abouts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AboutUs' });
  }
});

module.exports = router;
