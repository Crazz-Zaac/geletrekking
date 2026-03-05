const mongoose = require("mongoose");

// Itinerary schema for daily trek activities
const itinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  altitude: { type: String },
  distance: { type: String },
  highlights: [String],
});

// FAQ schema for frequently asked questions
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

// Custom extra content sections schema
const extraSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

// ── NEW: Availability schema ───────────────────────────────────
const availabilitySchema = new mongoose.Schema({
  start_date: { type: Date, required: true },
  end_date:   { type: Date, required: true },
  status:     {
    type: String,
    enum: ["available", "booked", "limited"],
    default: "available",
  },
  note: { type: String, default: "" },
});

// Main Trek Package Schema
const trekPackageSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },

    // Media
    image_url: { type: String },
    gallery_images: [{ type: String }],
    map_image_url: { type: String },

    // Trek Details
    highlights: [{ type: String }],
    includes: [{ type: String }],
    excludes: [{ type: String }],
    itinerary: [itinerarySchema],

    // Location & Season
    best_season: { type: String },
    start_point: { type: String },
    end_point: { type: String },

    // Pricing
    price_gbp: { type: Number, default: 0 },
    price_usd: { type: Number, default: 0 },

    // Trek Specifications
    duration_days: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
      default: "Moderate",
    },
    group_size_min: { type: Number, default: 1 },
    group_size_max: { type: Number, default: 15 },
    max_altitude_meters: { type: Number },

    // Additional Resources
    itinerary_pdf_url: { type: String },
    booking_link: { type: String },
    trek_gallery_id: { type: Number },
    trek_map_embed_url: { type: String },

    // Offers & Discounts
    has_offer: { type: Boolean, default: false },
    offer_title: { type: String },
    offer_description: { type: String },
    discounted_price_gbp: { type: Number },
    discounted_price_usd: { type: Number },
    offer_valid_from: { type: Date },
    offer_valid_to: { type: Date },

    // Tags & Seasonality
    season_tag: { type: String },

    // FAQs and Extra Sections
    faqs: [faqSchema],
    extra_sections: [extraSectionSchema],

    // Status Flags
    is_featured: { type: Boolean, default: false },
    is_active:   { type: Boolean, default: true },
    is_optional: { type: Boolean, default: false },

    // Ratings & Reviews
    rating:       { type: Number, min: 0, max: 5, default: 0 },
    review_count: { type: Number, default: 0 },

    // ── NEW FIELD ──────────────────────────────────────────────
    availability: [availabilitySchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
trekPackageSchema.index({ name: 1 });
trekPackageSchema.index({ difficulty: 1 });
trekPackageSchema.index({ price_usd: 1 });
trekPackageSchema.index({ is_active: 1 });
trekPackageSchema.index({ is_featured: 1 });
trekPackageSchema.index({ is_optional: 1 });

// Virtual for group size display
trekPackageSchema.virtual("group_size").get(function () {
  if (this.group_size_min && this.group_size_max) {
    return `${this.group_size_min}-${this.group_size_max} people`;
  }
  return "Flexible";
});

// Method to check if offer is currently valid
trekPackageSchema.methods.isOfferValid = function () {
  if (!this.has_offer) return false;
  const now = new Date();
  if (this.offer_valid_from && now < this.offer_valid_from) return false;
  if (this.offer_valid_to && now > this.offer_valid_to) return false;
  return true;
};

// Method to get current price (considering offers)
trekPackageSchema.methods.getCurrentPrice = function (currency = "usd") {
  const isOfferValid = this.isOfferValid();
  if (currency.toLowerCase() === "gbp") {
    return isOfferValid && this.discounted_price_gbp
      ? this.discounted_price_gbp
      : this.price_gbp;
  }
  return isOfferValid && this.discounted_price_usd
    ? this.discounted_price_usd
    : this.price_usd;
};

// Static method to find featured treks
trekPackageSchema.statics.findFeatured = function () {
  return this.find({ is_featured: true, is_active: true }).sort({ createdAt: -1 });
};

// Static method to find optional treks
trekPackageSchema.statics.findOptional = function () {
  return this.find({ is_optional: true, is_active: true }).sort({ createdAt: -1 });
};

// Static method to find main destination treks
trekPackageSchema.statics.findDestinations = function () {
  return this.find({ is_optional: false, is_active: true }).sort({ createdAt: -1 });
};

// Pre-save hook to validate offer dates
trekPackageSchema.pre("save", function (next) {
  if (this.has_offer) {
    if (this.offer_valid_from && this.offer_valid_to) {
      if (this.offer_valid_from >= this.offer_valid_to) {
        return next(new Error("Offer valid_from date must be before valid_to date"));
      }
    }
  }
  next();
});

module.exports = mongoose.model("TrekPackage", trekPackageSchema);
