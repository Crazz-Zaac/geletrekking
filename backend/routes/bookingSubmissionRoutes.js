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
  getBookingSubmissions,
  downloadBookingPdf,
  markBookingAsRead,
  markBookingAsUnread,
  deleteBookingSubmission,
} = require("../controllers/bookingSubmissionController");

router.get("/link/:token", getPublicBookingFormLink);
router.post("/link/:token/submit", contactSlowDown, contactLimiter, submitBooking);

router.get("/admin/links", authMiddleware, restrictToRoles("admin", "superadmin"), getBookingFormLinks);
router.post("/admin/links", authMiddleware, restrictToRoles("admin", "superadmin"), createBookingFormLink);
router.patch("/admin/links/:id/deactivate", authMiddleware, restrictToRoles("admin", "superadmin"), deactivateBookingFormLink);
router.delete("/admin/links/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteBookingFormLink);

router.get("/admin", authMiddleware, restrictToRoles("admin", "superadmin"), getBookingSubmissions);
router.get("/admin/:id/pdf", authMiddleware, restrictToRoles("admin", "superadmin"), downloadBookingPdf);
router.patch("/admin/:id/read", authMiddleware, restrictToRoles("admin", "superadmin"), markBookingAsRead);
router.patch("/admin/:id/unread", authMiddleware, restrictToRoles("admin", "superadmin"), markBookingAsUnread);
router.delete("/admin/:id", authMiddleware, restrictToRoles("admin", "superadmin"), deleteBookingSubmission);

module.exports = router;
