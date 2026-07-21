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
      data: { type: Buffer, required: true },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingSubmission", bookingSubmissionSchema);
