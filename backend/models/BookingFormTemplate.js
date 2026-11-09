const mongoose = require("mongoose");

// One record at most: the questions used for new private booking links.
// With no record, the standard form in the frontend is used.
const bookingFormTemplateSchema = new mongoose.Schema(
  { config: { type: mongoose.Schema.Types.Mixed, required: true } },
  { timestamps: true }
);

module.exports = mongoose.model("BookingFormTemplate", bookingFormTemplateSchema);
