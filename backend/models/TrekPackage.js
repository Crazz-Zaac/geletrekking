const mongoose = require("mongoose");

// each day of the trek with what happens, where you sleep, and how far you go
const itinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  altitude: { type: String },
  distance: { type: String },
  accommodation: { type: String },
  highlights: [String],
});

// questions and answers that people commonly ask about the trek
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

// any extra content blocks that don't fit the standard fields, like gear lists or special notes
const extraSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

// tracks when the trek is open for booking, fully booked, or has limited spots
const availabilitySchema = new mongoose.Schema({
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["available", "booked", "limited"],
    default: "available",
  },
  note: { type: String, default: "" },
});

const trekPackageSchema = new mongoose.Schema(
  {
    // the full name of the trek shown on the page
    name: { type: String, required: true, trim: true },

    // url-friendly version of the name, used to find the trek from the browser address bar
    slug: { type: String, unique: true, trim: true },

    // the main description shown on the trek detail page
    description: { type: String, required: true, trim: true },

    // which mountain region this trek belongs to, for example Everest or Annapurna
    region: { type: String, trim: true },

    // where the trek starts and ends
    start_point: { type: String },
    end_point: { type: String },

    // exact coordinates of the trek region used to fetch live weather on the frontend
    latitude: { type: Number },
    longitude: { type: Number },

    // human readable location name shown alongside the weather card
    location_name: { type: String, trim: true },

    // main cover image and extra photos shown in the gallery section
    image_url: { type: String },
    gallery_images: [{ type: String }],
    map_image_url: { type: String },

    // bullet points shown in the trek highlights section
    highlights: [{ type: String }],

    // what is covered in the trek price
    includes: [{ type: String }],

    // what the trekker needs to pay for separately
    excludes: [{ type: String }],

    // day by day plan for the trek
    itinerary: [itinerarySchema],

    // the months or seasons when this trek is recommended
    best_season: { type: String },

    // price in british pounds and us dollars
    price_gbp: { type: Number, default: 0 },
    price_usd: { type: Number, default: 0 },

    // how many days the trek takes
    duration_days: { type: Number, default: 0 },

    // how physically demanding the trek is
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
      default: "Moderate",
    },

    // minimum and maximum number of people allowed in a group
    group_size_min: { type: Number, default: 1 },
    group_size_max: { type: Number, default: 15 },

    // the highest point reached during the trek in meters
    max_altitude_meters: { type: Number },

    // whether this is a private tour, group tour, or something else
    tour_type: { type: String },

    // how trekkers get to the starting point, for example by flight or by road
    transportation: { type: String },

    // downloadable pdf of the itinerary if available
    itinerary_pdf_url: { type: String },

    // external booking link if the trek uses a third party booking system
    booking_link: { type: String },

    // reference id used to pull the correct gallery from the gallery system
    trek_gallery_id: { type: Number },

    // google maps embed url shown on the trek detail page
    trek_map_embed_url: { type: String },

    // whether there is an active discount or special offer on this trek
    has_offer: { type: Boolean, default: false },
    offer_title: { type: String },
    offer_description: { type: String },

    // discounted prices shown when an offer is active
    discounted_price_gbp: { type: Number },
    discounted_price_usd: { type: Number },

    // the date range during which the offer is valid
    offer_valid_from: { type: Date },
    offer_valid_to: { type: Date },

    // a short tag like Spring or Autumn used for filtering treks by season
    season_tag: { type: String },

    // frequently asked questions specific to this trek
    faqs: [faqSchema],

    // any additional custom content sections added by the admin
    extra_sections: [extraSectionSchema],

    // whether this trek appears in the featured section on the homepage
    is_featured: { type: Boolean, default: false },

    // whether this trek is visible to users on the site
    is_active: { type: Boolean, default: true },

    // whether this is an optional add-on trek rather than a main destination
    is_optional: { type: Boolean, default: false },

    // average rating out of 5 and total number of reviews
    rating: { type: Number, min: 0, max: 5, default: 0 },
    review_count: { type: Number, default: 0 },

    // date windows when this trek can be booked and how many spots are left
    availability: [availabilitySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

trekPackageSchema.index({ name: 1 });
trekPackageSchema.index({ slug: 1 });
trekPackageSchema.index({ region: 1 });
trekPackageSchema.index({ difficulty: 1 });
trekPackageSchema.index({ price_usd: 1 });
trekPackageSchema.index({ is_active: 1 });
trekPackageSchema.index({ is_featured: 1 });
trekPackageSchema.index({ is_optional: 1 });

// returns a readable group size string like "2-10 people" instead of two separate numbers
trekPackageSchema.virtual("group_size").get(function () {
  if (this.group_size_min && this.group_size_max) {
    return `${this.group_size_min}-${this.group_size_max} people`;
  }
  return "Flexible";
});

// checks whether the current date falls within the offer window
trekPackageSchema.methods.isOfferValid = function () {
  if (!this.has_offer) return false;
  const now = new Date();
  if (this.offer_valid_from && now < this.offer_valid_from) return false;
  if (this.offer_valid_to && now > this.offer_valid_to) return false;
  return true;
};

// returns the correct price based on currency and whether a valid offer exists
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

trekPackageSchema.statics.findFeatured = function () {
  return this.find({ is_featured: true, is_active: true }).sort({ createdAt: -1 });
};

trekPackageSchema.statics.findOptional = function () {
  return this.find({ is_optional: true, is_active: true }).sort({ createdAt: -1 });
};

trekPackageSchema.statics.findDestinations = function () {
  return this.find({ is_optional: false, is_active: true }).sort({ createdAt: -1 });
};

trekPackageSchema.pre("save", function (next) {
  // if no slug was provided, generate one from the trek name
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // make sure the offer start date is always before the end date
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