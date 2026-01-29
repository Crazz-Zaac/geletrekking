const mongoose = require("mongoose");
/**
 * Testimonial Schema
 *
 * Used to store feedback from trekkers. Testimonials are hidden
 * from the public until approved by an admin or superadmin. A rating
 * between 1 and 5 is required to accompany the message.
 */
const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },
    image: { 
      type: String, 
      trim: true,
      default: null 
    },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Testimonial", testimonialSchema);