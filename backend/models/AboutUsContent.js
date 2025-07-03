// models/AboutUs.js
const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },          // URL or path of image
  price: { type: Number },             
  days: { type: Number },              
  groupSize: { type: Number },         
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.AboutUs || mongoose.model('AboutUs', aboutUsSchema);
