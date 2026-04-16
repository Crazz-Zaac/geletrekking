const FaqPage = require("../models/FaqPage");
const { generalFAQ } = require("../data/faq-data");

// GET /api/faq  (Public)
// Returns hardcoded FAQ data instead of database data
exports.getFaqPage = async (req, res) => {
  try {
    res.json(generalFAQ);
  } catch (err) {
    console.error("Error fetching FAQ page:", err);
    res.status(500).json({ message: "Failed to load FAQ page" });
  }
};

// PUT /api/faq  (Admin / Superadmin only)
exports.updateFaqPage = async (req, res) => {
  try {
    const data = req.body;

    let faq = await FaqPage.findOne();
    if (!faq) {
      faq = new FaqPage();
    }

    const allowedFields = ["heroTitle", "heroSubtitle", "faqs"];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        faq[field] = data[field];
      }
    });

    if (req.user && req.user._id) {
      faq.updatedBy = req.user._id;
    }

    await faq.save();

    res.json(faq);
  } catch (err) {
    console.error("Error updating FAQ page:", err);
    res.status(500).json({ message: "Failed to update FAQ page" });
  }
};