const ContactMessage = require("../models/ContactMessage");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no", "off"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const verifyCaptcha = async ({ token, remoteIp }) => {
  const provider = (process.env.CAPTCHA_PROVIDER || "turnstile").toLowerCase();
  const secret = process.env.CAPTCHA_SECRET_KEY;

  if (!token || !secret) return false;

  const endpoint =
    provider === "hcaptcha"
      ? "https://hcaptcha.com/siteverify"
      : "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const payload = new URLSearchParams();
  payload.append("secret", secret);
  payload.append("response", token);
  if (remoteIp) payload.append("remoteip", remoteIp);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data.success);
};

/* ─────────────────────────────────────────────
   PUBLIC
───────────────────────────────────────────── */

// POST /api/contact          – anyone can submit
exports.submitMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      website,
      formStartedAt,
      captchaToken,
    } = req.body || {};

    const normalizedName = normalizeText(name);
    const normalizedEmail = normalizeText(email).toLowerCase();
    const normalizedMessage = normalizeText(message);

    const honeypotValue = normalizeText(website);
    if (honeypotValue) {
      return res.status(202).json({ message: "Thank you for contacting us!" });
    }

    const minFillMs = Number.parseInt(process.env.CONTACT_MIN_FILL_MS || "2500", 10);
    if (formStartedAt) {
      const started = Number.parseInt(String(formStartedAt), 10);
      if (!Number.isNaN(started)) {
        const elapsed = Date.now() - started;
        if (elapsed > 0 && elapsed < minFillMs) {
          return res.status(400).json({ message: "Please take a moment and try again." });
        }
      }
    }

    const captchaRequired = toBoolean(process.env.CAPTCHA_REQUIRED, true);
    const hasCaptchaSecret = Boolean(process.env.CAPTCHA_SECRET_KEY);

    if (captchaRequired && !hasCaptchaSecret) {
      return res.status(500).json({ message: "Captcha is not configured on server." });
    }

    if (captchaRequired) {
      if (!captchaToken) {
        return res.status(400).json({ message: "Captcha verification is required." });
      }
      const passedCaptcha = await verifyCaptcha({
        token: captchaToken,
        remoteIp: req.ip,
      });
      if (!passedCaptcha) {
        return res.status(400).json({ message: "Captcha verification failed. Please try again." });
      }
    } else if (hasCaptchaSecret && captchaToken) {
      const passedCaptcha = await verifyCaptcha({
        token: captchaToken,
        remoteIp: req.ip,
      });
      if (!passedCaptcha) {
        return res.status(400).json({ message: "Captcha verification failed. Please try again." });
      }
    }

    if (!normalizedName || !normalizedEmail || !normalizedMessage) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({ message: "Name must be between 2 and 100 characters" });
    }

    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 255) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (normalizedMessage.length < 10 || normalizedMessage.length > 5000) {
      return res.status(400).json({ message: "Message must be between 10 and 5000 characters" });
    }

    const duplicateWindowMs = Number.parseInt(process.env.CONTACT_DUPLICATE_WINDOW_MS || `${10 * 60 * 1000}`, 10);
    const duplicateSince = new Date(Date.now() - Math.max(60 * 1000, duplicateWindowMs));

    const duplicate = await ContactMessage.findOne({
      email: normalizedEmail,
      message: normalizedMessage,
      createdAt: { $gte: duplicateSince },
    }).select("_id");

    if (duplicate) {
      return res.status(200).json({ message: "Thank you for contacting us! We already received your message." });
    }

    await ContactMessage.create({
      name: normalizedName,
      email: normalizedEmail,
      message: normalizedMessage,
    });
    res.status(201).json({ message: "Thank you for contacting us!" });
  } catch (err) {
    console.error("Contact submit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────────────────────────────────────────
   ADMIN / SUPERADMIN  (protected by route‑level middleware)
───────────────────────────────────────────── */

// GET /api/contact/admin     – list all messages, oldest first
exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: 1 });
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

// DELETE /api/contact/admin/:id – permanently delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!msg) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};