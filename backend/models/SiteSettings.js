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
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Single document collection pattern
const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model("SiteSettings", siteSettingsSchema);

module.exports = SiteSettings;
