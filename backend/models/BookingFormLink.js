const mongoose = require("mongoose");

const bookingFormLinkSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, trim: true },
    clientEmail: { type: String, trim: true },
    trekPackage: { type: String, trim: true },
    notes: { type: String, trim: true },
    formConfig: { type: mongoose.Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    submittedAt: { type: Date },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "BookingSubmission" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookingFormLink", bookingFormLinkSchema);
