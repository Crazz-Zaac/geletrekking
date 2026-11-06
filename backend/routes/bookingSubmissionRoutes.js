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
const { buildReviewRequestEmail, sendReviewRequest, isReviewRequestsEnabled, REVIEW_REQUEST_WINDOW } = require("../utils/reviewRequests");
const { logAudit } = require("../utils/auditLogger");

router.get("/link/:token", getPublicBookingFormLink);
router.post("/link/:token/submit", contactSlowDown, contactLimiter, submitBooking);
router.post("/pre-booking", contactSlowDown, contactLimiter, submitPreBooking);

router.get("/admin/links", authMiddleware, restrictToRoles("admin", "superadmin"), getBookingFormLinks);
router.post("/admin/links", authMiddleware, restrictToRoles("admin", "superadmin"), createBookingFormLink);
router.patch("/admin/links/:id/deactivate", authMiddleware, restrictToRoles("admin", "superadmin"), deactivateBookingFormLink);
router.delete("/admin/links/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteBookingFormLink);

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
      preview: buildReviewRequestEmail(booking),
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

module.exports = router;
