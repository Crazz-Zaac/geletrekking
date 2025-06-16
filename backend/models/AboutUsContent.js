// models/AboutUs.js
const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },          // URL or path of image
  price: { type: Number },             // Price value
  days: { type: Number },              // Number of days
  groupSize: { type: Number },         // Group size
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.AboutUs || mongoose.model('AboutUs', aboutUsSchema);
