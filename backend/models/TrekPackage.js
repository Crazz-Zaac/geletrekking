const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  day: Number,
  title: String,
  description: String,
});

const faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

// ✅ Custom extra content sections schema
const extraSectionSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const trekPackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  overview: String,
  image_url: String,
  gallery_images: [String],
  map_image_url: String,
  highlights: [String],
  includes: [String],
  excludes: [String],
  itinerary: [itinerarySchema],
  best_season: String,
  start_point: String,
  end_point: String,
  price_gbp: Number,
  price_usd: Number,
  duration_days: Number,
  difficulty: String,
  group_size_min: Number,
  group_size_max: Number,
  max_altitude_meters: Number,
  itinerary_pdf_url: String,
  booking_link: String,
  trek_gallery_id: Number,
  trek_map_embed_url: String,
  has_offer: { type: Boolean, default: false },
  offer_title: String,
  offer_description: String,
  discounted_price_gbp: Number,
  discounted_price_usd: Number,
  offer_valid_from: Date,
  offer_valid_to: Date,
  season_tag: String,
  best_season: String,
  faqs: [faqSchema],

  // ✅ Add this
  extra_sections: [extraSectionSchema],

  is_featured: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("TrekPackage", trekPackageSchema);
