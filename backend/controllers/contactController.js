const ContactMessage = require("../models/ContactMessage");

// Submit a contact message (public)
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: "Thank you for contacting us!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all contact messages (admin/superadmin)
exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};