const mongoose = require("mongoose");

const bookingSubmissionSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    mobileWhatsapp: { type: String, trim: true },
    trekPackage: { type: String, required: true, trim: true },
    formLink: { type: mongoose.Schema.Types.ObjectId, ref: "BookingFormLink" },
    trekStartDate: { type: String, trim: true },
    trekEndDate: { type: String, trim: true },
    formData: { type: mongoose.Schema.Types.Mixed, required: true },
    pdf: {
      filename: { type: String, required: true },
      contentType: { type: String, default: "application/pdf" },
      // Removed by utils/bookingPdfRetention.js once the retention period has passed.
      data: { type: Buffer },
      purgedAt: { type: Date, default: null },
    },
    isRead: { type: Boolean, default: false },
    // Post-trek Google review request (see utils/reviewRequests.js).
    // When the retention job removed this guest's form answers (see utils/bookingPdfRetention.js).
    formDataPurgedAt: { type: Date, default: null },
    reviewRequestStatus: { type: String, enum: ["pending", "sent", "skipped", "failed"], default: "pending" },
    reviewRequestSentAt: { type: Date, default: null },
    reviewRequestError: { type: String, default: "" },
    // Admin's edited wording for this booking; empty means the standard email.
    reviewRequestSubject: { type: String, default: "" },
    reviewRequestText: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingSubmission", bookingSubmissionSchema);
