const Testimonial = require("../models/Testimonial");

// Get approved testimonials (public)
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new testimonial (public form)
exports.createTestimonial = async (req, res) => {
  try {
    const { name, country, rating, message } = req.body;
    if (!name || !rating || !message) {
      return res.status(400).json({ message: "Name, rating and message are required" });
    }
    const testimonial = await Testimonial.create({ name, country, rating, message, isApproved: false });
    res.status(201).json({ message: "Thank you for your feedback! Awaiting approval." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all testimonials (admin)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Approve or update a testimonial (admin/superadmin)
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Testimonial.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Testimonial not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a testimonial (superadmin)
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Testimonial.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Testimonial not found" });
    res.json({ message: "Testimonial deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};