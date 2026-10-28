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

const associationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const socialUrlField = {
  type: String,
  default: "",
  trim: true,
  validate: {
    validator: (value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
      } catch {
        return false;
      }
    },
    message: "Social links must be complete HTTP or HTTPS URLs.",
  },
};

const teamSocialSchema = new mongoose.Schema(
  {
    facebook: socialUrlField,
    instagram: socialUrlField,
    linkedin: socialUrlField,
    youtube: socialUrlField,
    whatsapp: socialUrlField,
  },
  { _id: false }
);

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    social: { type: teamSocialSchema, default: () => ({}) },
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
    teamTitle: {
      type: String,
      default: "",
    },
    teamMembers: {
      type: [teamMemberSchema],
      default: [],
    },
    associations: {
      type: [associationSchema],
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