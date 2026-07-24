const FaqPage = require("../models/FaqPage");
const { generalFAQ } = require("../data/faq-data");

const fallbackFaqs = () => ({
  heroTitle: generalFAQ.heroTitle,
  heroSubtitle: generalFAQ.heroSubtitle,
  faqs: (generalFAQ.faqs || []).map((item, index) => ({
    question: item.question,
    answer: item.answer,
    order: index,
  })),
});

const normalizeFaqPayload = (data = {}) => ({
  heroTitle: String(data.heroTitle || "").trim() || generalFAQ.heroTitle,
  heroSubtitle: String(data.heroSubtitle || "").trim() || generalFAQ.heroSubtitle,
  faqs: Array.isArray(data.faqs)
    ? data.faqs
        .map((item, index) => ({
          question: String(item?.question || "").trim(),
          answer: String(item?.answer || "").trim(),
          order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
        }))
        .filter((item) => item.question && item.answer)
        .sort((a, b) => a.order - b.order)
        .map((item, index) => ({ ...item, order: index }))
    : [],
});

// GET /api/faq  (Public)
exports.getFaqPage = async (req, res) => {
  try {
    let faq = await FaqPage.findOne();

    if (!faq) {
      faq = await FaqPage.create(fallbackFaqs());
    }

    res.json(faq);
  } catch (err) {
    console.error("Error fetching FAQ page:", err);
    res.status(500).json({ message: "Failed to load FAQ page" });
  }
};

// PUT /api/faq  (Admin / Superadmin only)
exports.updateFaqPage = async (req, res) => {
  try {
    const data = normalizeFaqPayload(req.body);

    let faq = await FaqPage.findOne();
    if (!faq) {
      faq = new FaqPage();
    }

    faq.heroTitle = data.heroTitle;
    faq.heroSubtitle = data.heroSubtitle;
    faq.faqs = data.faqs;

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
