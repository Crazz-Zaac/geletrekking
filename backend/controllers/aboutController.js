const AboutPage = require("../models/AboutPage");

// GET /api/about  (Public)
exports.getAboutPage = async (req, res) => {
  try {
    let about = await AboutPage.findOne();

    if (!about) {
      about = await AboutPage.create({});
    }

    res.json(about);
  } catch (err) {
    console.error("Error fetching About page:", err);
    res.status(500).json({ message: "Failed to load About page" });
  }
};

// PUT /api/about  (Admin / Superadmin only)
exports.updateAboutPage = async (req, res) => {
  try {
    const data = req.body;

    let about = await AboutPage.findOne();
    if (!about) {
      about = new AboutPage();
    }

    const allowedFields = [
      "heroTitle",
      "heroSubtitle",
      "heroImageUrl",
      "missionTitle",
      "missionBody",
      "storyTitle",
      "storyBody",
      "highlights",
      "whyChooseUs",
      "stats",
      "associations",
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        about[field] = data[field];
      }
    });

    if (req.user && req.user._id) {
      about.updatedBy = req.user._id;
    }

    await about.save();

    res.json(about);
  } catch (err) {
    console.error("Error updating About page:", err);
    res.status(500).json({ message: "Failed to update About page" });
  }
};