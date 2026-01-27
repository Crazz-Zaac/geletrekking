const mongoose = require("mongoose");

const heroSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Explore the World, One Trail at a Time" },
    subtitle: {
      type: String,
      default:
        "Embark on unforgettable journeys through breathtaking landscapes. Discover nature’s wonders with expert guides and fellow adventurers.",
    },
    backgroundImage: { type: String, default: "" },
    overlay: { type: String, default: "linear-gradient(135deg, rgba(13, 110, 140, 0.55) 0%, rgba(59, 130, 246, 0.55) 100%)" },
    ctaText: { type: String, default: "Explore Treks" },
    ctaLink: { type: String, default: "/optional-treks" },
  },
  { timestamps: true }
);

const HeroSection =
  mongoose.models.HeroSection || mongoose.model("HeroSection", heroSectionSchema);

module.exports = HeroSection;
