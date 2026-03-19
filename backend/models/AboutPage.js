const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const statSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const aboutPageSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "",
    },
    heroSubtitle: {
      type: String,
      default: "",
    },
    heroImageUrl: {
      type: String,
      default: "",
    },

    missionTitle: {
      type: String,
      default: "",
    },
    missionBody: {
      type: String,
      default: "",
    },

    storyTitle: {
      type: String,
      default: "",
    },
    storyBody: {
      type: String,
      default: "",
    },

    highlights: {
      type: [highlightSchema],
      default: [],
    },

    whyChooseUs: {
      type: [String],
      default: [],
    },

    stats: {
      type: [statSchema],
      default: [],
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);
