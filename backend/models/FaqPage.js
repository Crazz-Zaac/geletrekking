const mongoose = require("mongoose");

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const faqPageSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "Frequently Asked Questions" },
    heroSubtitle: {
      type: String,
      default:
        "Helpful answers about trekking seasons, permits, difficulty, insurance, and planning your Himalayan adventure.",
    },
    faqs: { type: [faqItemSchema], default: [] },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FaqPage", faqPageSchema);