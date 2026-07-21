const crypto = require("crypto");
const BookingSubmission = require("../models/BookingSubmission");
const BookingFormLink = require("../models/BookingFormLink");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEFAULT_LINK_TTL_DAYS = 14;
const VALID_FIELD_TYPES = new Set(["text", "email", "tel", "date", "time", "textarea", "select", "checkbox"]);

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no", "off"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const sanitizeFormConfig = (value) => {
  if (!Array.isArray(value)) return undefined;

  const sections = value.slice(0, 12).map((section, sectionIndex) => {
    if (!section || typeof section !== "object") return null;
    const fields = Array.isArray(section.fields)
      ? section.fields.slice(0, 40).map((field) => {
          if (!field || typeof field !== "object") return null;
          const id = String(field.id || "").trim().replace(/[^A-Za-z0-9_]/g, "").slice(0, 80);
          const label = normalizeText(field.label).slice(0, 120);
          if (!id || !label) return null;
          const type = VALID_FIELD_TYPES.has(field.type) ? field.type : "text";
          const options = type === "select" && Array.isArray(field.options)
            ? field.options.map((option) => normalizeText(option).slice(0, 80)).filter(Boolean).slice(0, 20)
            : undefined;
          return {
            id,
            label,
            type,
            required: Boolean(field.required),
            options,
            placeholder: normalizeText(field.placeholder).slice(0, 160) || undefined,
            condition: ["sharedAccommodation", "altitudeCoverage"].includes(field.condition) ? field.condition : undefined,
            locked: Boolean(field.locked),
          };
        }).filter(Boolean)
      : [];
    if (fields.length === 0) return null;
    return {
      id: normalizeText(section.id).replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80) || `section-${sectionIndex + 1}`,
      title: normalizeText(section.title).slice(0, 120) || `Section ${sectionIndex + 1}`,
      fields,
    };
  }).filter(Boolean);

  return sections.length > 0 ? sections : undefined;
};
const hashToken = (token) => crypto.createHash("sha256").update(String(token || "")).digest("hex");

const noStore = (res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, private, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
};

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
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data.success);
};

const extractPdfBuffer = (pdfBase64) => {
  const value = String(pdfBase64 || "");
  const match = value.match(/^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/);
  const rawBase64 = match ? match[1] : value;
  if (!rawBase64 || rawBase64.length > 220000) return null;
  return Buffer.from(rawBase64, "base64");
};

const isLinkUsable = (link) => {
  if (!link || !link.isActive || link.submittedAt) return false;
  return !link.expiresAt || link.expiresAt.getTime() > Date.now();
};

const linkSummary = (link) => ({
  _id: link._id,
  clientName: link.clientName,
  clientEmail: link.clientEmail,
  trekPackage: link.trekPackage,
  notes: link.notes,
  formConfig: link.formConfig,
  isActive: link.isActive,
  expiresAt: link.expiresAt,
  submittedAt: link.submittedAt,
  submission: link.submission,
  createdAt: link.createdAt,
  updatedAt: link.updatedAt,
});

const listSummary = (submission) => ({
  _id: submission._id,
  firstName: submission.firstName,
  lastName: submission.lastName,
  email: submission.email,
  mobileWhatsapp: submission.mobileWhatsapp,
  trekPackage: submission.trekPackage,
  formLink: submission.formLink,
  trekStartDate: submission.trekStartDate,
  trekEndDate: submission.trekEndDate,
  formData: submission.formData,
  isRead: submission.isRead,
  createdAt: submission.createdAt,
  updatedAt: submission.updatedAt,
  pdfFilename: submission.pdf?.filename,
});

exports.createBookingFormLink = async (req, res) => {
  try {
    const ttlDays = Number.parseInt(String(req.body?.ttlDays || DEFAULT_LINK_TTL_DAYS), 10);
    const safeTtlDays = Math.min(60, Math.max(1, Number.isNaN(ttlDays) ? DEFAULT_LINK_TTL_DAYS : ttlDays));
    const token = crypto.randomBytes(32).toString("base64url");
    const link = await BookingFormLink.create({
      tokenHash: hashToken(token),
      clientName: normalizeText(req.body?.clientName),
      clientEmail: normalizeText(req.body?.clientEmail).toLowerCase(),
      trekPackage: normalizeText(req.body?.trekPackage),
      notes: normalizeText(req.body?.notes),
      formConfig: sanitizeFormConfig(req.body?.formConfig),
      expiresAt: new Date(Date.now() + safeTtlDays * 24 * 60 * 60 * 1000),
      createdBy: req.user?._id,
    });

    res.status(201).json({ ...linkSummary(link), token, path: `/private-booking/${token}` });
  } catch (err) {
    console.error("Create booking form link error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookingFormLinks = async (req, res) => {
  try {
    const links = await BookingFormLink.find().sort({ createdAt: -1 });
    res.json(links.map(linkSummary));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deactivateBookingFormLink = async (req, res) => {
  try {
    const link = await BookingFormLink.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!link) return res.status(404).json({ message: "Booking form link not found" });
    res.json(linkSummary(link));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteBookingFormLink = async (req, res) => {
  try {
    const link = await BookingFormLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: "Booking form link not found" });
    res.json({ message: "Booking form link deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPublicBookingFormLink = async (req, res) => {
  try {
    noStore(res);
    const link = await BookingFormLink.findOne({ tokenHash: hashToken(req.params.token) });
    if (!isLinkUsable(link)) return res.status(404).json({ message: "This booking form link is inactive, expired, or already submitted." });
    res.json({
      clientName: link.clientName,
      clientEmail: link.clientEmail,
      trekPackage: link.trekPackage,
      formConfig: link.formConfig,
      expiresAt: link.expiresAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.submitBooking = async (req, res) => {
  try {
    noStore(res);
    const link = await BookingFormLink.findOne({ tokenHash: hashToken(req.params.token) });
    if (!isLinkUsable(link)) {
      return res.status(404).json({ message: "This booking form link is inactive, expired, or already submitted." });
    }

    const { formData, pdfBase64, website, formStartedAt, captchaToken } = req.body || {};

    const honeypotValue = normalizeText(website);
    if (honeypotValue) {
      return res.status(202).json({ message: "Thank you. Your booking form has been received." });
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
      if (!captchaToken) return res.status(400).json({ message: "Captcha verification is required." });
      const passedCaptcha = await verifyCaptcha({ token: captchaToken, remoteIp: req.ip });
      if (!passedCaptcha) return res.status(400).json({ message: "Captcha verification failed. Please try again." });
    } else if (hasCaptchaSecret && captchaToken) {
      const passedCaptcha = await verifyCaptcha({ token: captchaToken, remoteIp: req.ip });
      if (!passedCaptcha) return res.status(400).json({ message: "Captcha verification failed. Please try again." });
    }

    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ message: "Booking form data is required." });
    }

    const firstName = normalizeText(formData.firstName);
    const lastName = normalizeText(formData.lastName);
    const email = normalizeText(formData.email).toLowerCase();
    const mobileWhatsapp = normalizeText(formData.mobileWhatsapp);
    const trekPackage = normalizeText(formData.trekPackage || link.trekPackage);
    const trekStartDate = normalizeText(formData.trekStartDate);
    const trekEndDate = normalizeText(formData.trekEndDate);

    if (!firstName || !lastName || !email || !trekPackage) {
      return res.status(400).json({ message: "First name, last name, email and trek package are required." });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 255) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const pdfBuffer = extractPdfBuffer(pdfBase64);
    if (!pdfBuffer || pdfBuffer.length < 1000) {
      return res.status(400).json({ message: "A valid PDF copy of the form is required." });
    }

    const filename = `booking-form-${Date.now()}-${firstName}-${lastName}.pdf`
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-");

    const submission = await BookingSubmission.create({
      firstName,
      lastName,
      email,
      mobileWhatsapp,
      trekPackage,
      formLink: link._id,
      trekStartDate,
      trekEndDate,
      formData,
      pdf: {
        filename,
        contentType: "application/pdf",
        data: pdfBuffer,
      },
    });

    link.isActive = false;
    link.submittedAt = new Date();
    link.submission = submission._id;
    await link.save();

    res.status(201).json({
      message: "Your booking form was submitted.",
      id: submission._id,
    });
  } catch (err) {
    console.error("Booking submit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookingSubmissions = async (req, res) => {
  try {
    const submissions = await BookingSubmission.find().select("-pdf.data").sort({ createdAt: -1 });
    res.json(submissions.map(listSummary));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.downloadBookingPdf = async (req, res) => {
  try {
    noStore(res);
    const submission = await BookingSubmission.findById(req.params.id).select("pdf");
    if (!submission) return res.status(404).json({ message: "Booking submission not found" });

    res.setHeader("Content-Type", submission.pdf.contentType || "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${submission.pdf.filename}"`);
    res.send(submission.pdf.data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.markBookingAsRead = async (req, res) => {
  try {
    const submission = await BookingSubmission.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).select("-pdf.data");

    if (!submission) return res.status(404).json({ message: "Booking submission not found" });
    res.json(listSummary(submission));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.markBookingAsUnread = async (req, res) => {
  try {
    const submission = await BookingSubmission.findByIdAndUpdate(
      req.params.id,
      { isRead: false },
      { new: true }
    ).select("-pdf.data");

    if (!submission) return res.status(404).json({ message: "Booking submission not found" });
    res.json(listSummary(submission));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBookingSubmission = async (req, res) => {
  try {
    const submission = await BookingSubmission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ message: "Booking submission not found" });
    await BookingFormLink.updateOne({ submission: submission._id }, { $unset: { submission: "", submittedAt: "" }, isActive: false });
    res.json({ message: "Booking submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
