const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { restrictToRoles } = require("../middleware/roleMiddleware");
const { contactLimiter, contactSlowDown } = require("../middleware/rateLimitMiddleware");
const {
  createBookingFormLink,
  getBookingFormLinks,
  deactivateBookingFormLink,
  deleteBookingFormLink,
  getBookingFormTemplate,
  saveBookingFormTemplate,
  resetBookingFormTemplate,
  getPublicBookingFormLink,
  submitBooking,
  submitPreBooking,
  getBookingSubmissions,
  downloadBookingPdf,
  markBookingAsRead,
  markBookingAsUnread,
  deleteBookingSubmission,
} = require("../controllers/bookingSubmissionController");
const BookingSubmission = require("../models/BookingSubmission");
const ReviewEmailTemplate = require("../models/ReviewEmailTemplate");
const { getReviewRequestEmail, getReviewEmailTemplate, cleanReviewRequestEmail, cleanReviewEmailTemplate, WRITE_REVIEW_URL, sendReviewRequest, isReviewRequestsEnabled, REVIEW_REQUEST_WINDOW } = require("../utils/reviewRequests");
const { logAudit } = require("../utils/auditLogger");

router.get("/link/:token", getPublicBookingFormLink);
router.post("/link/:token/submit", contactSlowDown, contactLimiter, submitBooking);
router.post("/pre-booking", contactSlowDown, contactLimiter, submitPreBooking);

router.get("/admin/links", authMiddleware, restrictToRoles("admin", "superadmin"), getBookingFormLinks);
router.post("/admin/links", authMiddleware, restrictToRoles("admin", "superadmin"), createBookingFormLink);
router.patch("/admin/links/:id/deactivate", authMiddleware, restrictToRoles("admin", "superadmin"), deactivateBookingFormLink);
router.delete("/admin/links/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteBookingFormLink);

router.get("/admin/form-template", authMiddleware, restrictToRoles("admin", "superadmin"), getBookingFormTemplate);
router.put("/admin/form-template", authMiddleware, restrictToRoles("admin", "superadmin"), saveBookingFormTemplate);
router.delete("/admin/form-template", authMiddleware, restrictToRoles("admin", "superadmin"), resetBookingFormTemplate);

router.get("/admin", authMiddleware, restrictToRoles("admin", "superadmin"), getBookingSubmissions);
router.get("/admin/:id/pdf", authMiddleware, restrictToRoles("admin", "superadmin"), downloadBookingPdf);
router.patch("/admin/:id/read", authMiddleware, restrictToRoles("admin", "superadmin"), markBookingAsRead);
router.patch("/admin/:id/unread", authMiddleware, restrictToRoles("admin", "superadmin"), markBookingAsUnread);
router.delete("/admin/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteBookingSubmission);

// Post-trek review request: status, email preview, send now, skip / re-enable.
const reviewAdmin = [authMiddleware, restrictToRoles("admin", "superadmin")];

router.get("/admin/:id/review-request", ...reviewAdmin, async (req, res) => {
  try {
    const booking = await BookingSubmission.findById(req.params.id).select("-pdf.data");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    let scheduledFor = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(booking.trekEndDate || "")) {
      const date = new Date(`${booking.trekEndDate}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + REVIEW_REQUEST_WINDOW.MIN_DAYS_AFTER);
      scheduledFor = date.toISOString().slice(0, 10);
    }
    res.json({
      status: booking.reviewRequestStatus || "pending",
      sentAt: booking.reviewRequestSentAt,
      error: booking.reviewRequestError || "",
      automaticSendingEnabled: isReviewRequestsEnabled(),
      scheduledFor,
      preview: await getReviewRequestEmail(booking),
      customized: Boolean(booking.reviewRequestSubject || booking.reviewRequestText),
      reviewUrl: WRITE_REVIEW_URL,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/admin/:id/review-request/send", ...reviewAdmin, async (req, res) => {
  try {
    const booking = await BookingSubmission.findById(req.params.id).select("-pdf.data");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.reviewRequestStatus === "sent") return res.status(409).json({ message: "A review request was already sent for this booking." });
    await sendReviewRequest(booking);
    await logAudit({ actor: req.user._id, actorEmail: req.user.email, action: "booking.review_request.send", outcome: "success", ip: req.ip, meta: { bookingId: String(booking._id) } });
    res.json({ status: booking.reviewRequestStatus, sentAt: booking.reviewRequestSentAt });
  } catch (err) {
    res.status(502).json({ message: `Could not send the email: ${err.message}` });
  }
});

router.patch("/admin/:id/review-request", ...reviewAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!["skipped", "pending"].includes(status)) return res.status(400).json({ message: "Status must be skipped or pending." });
    const booking = await BookingSubmission.findById(req.params.id).select("-pdf.data");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.reviewRequestStatus === "sent") return res.status(409).json({ message: "Already sent." });
    booking.reviewRequestStatus = status;
    await booking.save();
    res.json({ status: booking.reviewRequestStatus });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// The standard wording, shared by every booking without its own edit.
const auditTemplate = (req, action) =>
  logAudit({ actor: req.user._id, actorEmail: req.user.email, action, outcome: "success", ip: req.ip, meta: {} });

router.get("/admin/review-request/template", ...reviewAdmin, async (req, res) => {
  try {
    res.json(await getReviewEmailTemplate());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/admin/review-request/template", ...reviewAdmin, async (req, res) => {
  const { error, subject, text } = cleanReviewEmailTemplate(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    await ReviewEmailTemplate.findOneAndUpdate({}, { subject, text }, { upsert: true });
    await auditTemplate(req, "booking.review_template.edit");
    res.json(await getReviewEmailTemplate());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/admin/review-request/template", ...reviewAdmin, async (req, res) => {
  try {
    await ReviewEmailTemplate.deleteMany({});
    await auditTemplate(req, "booking.review_template.reset");
    res.json(await getReviewEmailTemplate());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const saveReviewEmail = async (req, res, fields, action) => {
  try {
    const booking = await BookingSubmission.findById(req.params.id).select("-pdf.data");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.reviewRequestStatus === "sent") return res.status(409).json({ message: "This email was already sent." });
    booking.reviewRequestSubject = fields.subject;
    booking.reviewRequestText = fields.text;
    await booking.save();
    await logAudit({ actor: req.user._id, actorEmail: req.user.email, action, outcome: "success", ip: req.ip, meta: { bookingId: String(booking._id) } });
    res.json({ preview: await getReviewRequestEmail(booking) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

router.put("/admin/:id/review-request/email", ...reviewAdmin, (req, res) => {
  const { error, subject, text } = cleanReviewRequestEmail(req.body);
  if (error) return res.status(400).json({ message: error });
  return saveReviewEmail(req, res, { subject, text }, "booking.review_request.edit");
});

router.delete("/admin/:id/review-request/email", ...reviewAdmin, (req, res) =>
  saveReviewEmail(req, res, { subject: "", text: "" }, "booking.review_request.reset")
);

module.exports = router;
