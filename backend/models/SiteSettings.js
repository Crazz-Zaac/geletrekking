const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "GELE TREKKING" },
    logoUrl: { type: String, default: "" },
    contactHeroImageUrl: { type: String, default: "" },
    bookingHeroImageUrl: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    // Extra addresses shown on the Contact page (main address is `email`).
    // Undefined until first saved, so the website can show its defaults.
    contactEmails: {
      type: [
        {
          _id: false,
          label: { type: String, default: "" },
          email: { type: String, default: "" },
          note: { type: String, default: "" },
        },
      ],
      default: undefined,
    },
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
        // "registration" = government registration/licence; "membership" = association membership
        kind: { type: String, enum: ["registration", "membership"], default: "registration" },
        issuer: { type: String, default: "" }, // e.g. Office of the Company Registrar, TAAN
        referenceNumber: { type: String, default: "" }, // registration / licence / member number
        issuedOn: { type: String, default: "" }, // YYYY-MM-DD
        validUntil: { type: String, default: "" }, // YYYY-MM-DD, for licences that are renewed
        verifyUrl: { type: String, default: "" }, // official page where visitors can check it
        logoUrl: { type: String, default: "" }, // association logo (memberships)
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
