const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "GELE TREKKING" },
    logoUrl: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    officeHoursWeekdays: { type: String, default: "" },
    officeHoursWeekend: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    navigation: {
      activitiesEnabled: { type: Boolean, default: true },
    },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    registrationsAffiliations: [
      {
        title: { type: String, required: true },
        code: { type: String, required: true },
        description: { type: String, default: "" },
        documentUrl: { type: String, default: "" },
        documentType: { type: String, enum: ["image", "pdf"], default: "image" },
        uploadedAt: { type: Date, default: null },
        status: {
          type: String,
          enum: ["placeholder", "uploaded", "pending"],
          default: "placeholder",
        },
      },
    ],
  },
  { timestamps: true }
);

// Single document collection pattern
const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);

module.exports = SiteSettings;
