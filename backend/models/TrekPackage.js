const mongoose = require("mongoose");

const trekPackageSchema = new mongoose.Schema({
  package_id: Number,
  name: { type: String, required: true },
  overview: String,
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
  is_featured: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("TrekPackage", trekPackageSchema);
