const ContactMessage = require("../models/ContactMessage");

/* ─────────────────────────────────────────────
   PUBLIC
───────────────────────────────────────────── */

// POST /api/contact          – anyone can submit
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

/* ─────────────────────────────────────────────
   ADMIN / SUPERADMIN  (protected by route‑level middleware)
───────────────────────────────────────────── */

// GET /api/contact/admin     – list all messages, oldest first
exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: 1 }); // oldest on top
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/contact/admin/:id/read   – mark a single message as read
exports.markAsRead = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!msg) return res.status(404).json({ message: "Message not found" });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/contact/admin/:id/unread – mark a single message as unread
exports.markAsUnread = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: false },
      { new: true }
    );

    if (!msg) return res.status(404).json({ message: "Message not found" });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};