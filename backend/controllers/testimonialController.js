const Testimonial = require("../models/Testimonial");

// Get approved testimonials (public)
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    console.error("Error fetching approved testimonials:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new testimonial (public form)
exports.createTestimonial = async (req, res) => {
  try {
    const { name, country, rating, message, image } = req.body;
    
    // Validation
    if (!name || !rating || !message) {
      return res.status(400).json({ message: "Name, rating and message are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const testimonial = await Testimonial.create({ 
      name, 
      country, 
      rating, 
      message, 
      image,
      isApproved: false 
    });
    
    res.status(201).json({ 
      message: "Thank you for your feedback! Awaiting approval.",
      testimonialId: testimonial._id 
    });
  } catch (err) {
    console.error("Error creating testimonial:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

// Get all testimonials (admin)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    console.error("Error fetching all testimonials:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve or update a testimonial (admin/superadmin)
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate rating if it's being updated
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    const updated = await Testimonial.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true // Run schema validators on update
    });
    
    if (!updated) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error updating testimonial:", err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a testimonial (superadmin)
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Testimonial.findByIdAndDelete(id);
    
    if (!del) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    
    res.json({ message: "Testimonial deleted successfully" });
  } catch (err) {
    console.error("Error deleting testimonial:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid testimonial ID" });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};