const mongoose = require("mongoose");

// One record at most: the admin's wording for the standard post-trek review
// email. With no record, the wording in utils/reviewRequests.js is used.
const reviewEmailTemplateSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewEmailTemplate", reviewEmailTemplateSchema);
