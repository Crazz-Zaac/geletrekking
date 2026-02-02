const HeroSection = require("../models/HeroSection");

async function getSingleton() {
  let doc = await HeroSection.findOne();
  if (!doc) doc = await HeroSection.create({});
  return doc;
}

// Public
exports.getHero = async (req, res) => {
  try {
    const doc = await getSingleton();
    res.json(doc);
  } catch (err) {
    console.error("getHero error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Superadmin
exports.updateHero = async (req, res) => {
  try {
    const doc = await getSingleton();

    const allowed = [
      "title",
      "subtitle",
      "backgroundImage",
      "overlay",
      "ctaText",
      "ctaLink",
    ];

    for (const key of allowed) {
      if (typeof req.body[key] !== "undefined") doc[key] = req.body[key];
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error("updateHero error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
