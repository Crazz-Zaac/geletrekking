// controllers/aboutUsController.js
const AboutUs = require('../models/AboutUs');

// Get About Us content (assume only one document)
exports.getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne().sort({ updatedAt: -1 });
    if (!aboutUs) return res.status(404).json({ message: 'About Us content not found' });
    res.json(aboutUs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch About Us content' });
  }
};

// Create or update About Us content
exports.createOrUpdateAboutUs = async (req, res) => {
  try {
    const { heading, description, imageUrl, price, days, groupSize } = req.body;

    let aboutUs = await AboutUs.findOne();

    if (aboutUs) {
      // Update existing
      aboutUs.heading = heading;
      aboutUs.description = description;
      aboutUs.imageUrl = imageUrl;
      aboutUs.price = price;
      aboutUs.days = days;
      aboutUs.groupSize = groupSize;
      aboutUs.updatedAt = Date.now();
      await aboutUs.save();
      return res.json({ message: 'About Us updated successfully', aboutUs });
    } else {
      // Create new
      aboutUs = new AboutUs({ heading, description, imageUrl, price, days, groupSize });
      await aboutUs.save();
      return res.status(201).json({ message: 'About Us created successfully', aboutUs });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save About Us content' });
  }
};

// Delete About Us content (optional)
exports.deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOneAndDelete();
    if (!aboutUs) return res.status(404).json({ message: 'About Us content not found' });
    res.json({ message: 'About Us deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete About Us content' });
  }
};
