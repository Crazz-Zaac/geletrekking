const SiteSettings = require("../models/SiteSettings");

async function getSingleton() {
  let doc = await SiteSettings.findOne();
  if (!doc) doc = await SiteSettings.create({});
  return doc;
}

// Public
exports.getSettings = async (req, res) => {
  try {
    const doc = await getSingleton();
    res.json(doc);
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Superadmin
exports.updateSettings = async (req, res) => {
  try {
    const doc = await getSingleton();

    const allowed = [
      "siteName",
      "logoUrl",
      "phone",
      "email",
      "address",
      "officeHoursWeekdays",
      "officeHoursWeekend",
      "mapEmbedUrl",
      "navigation",
      "social",
    ];

    for (const key of allowed) {
      if (typeof req.body[key] !== "undefined") doc[key] = req.body[key];
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
