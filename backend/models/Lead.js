const mongoose = require('mongoose');

// Email sign-ups (e.g. the free packing list). marketingConsent records an
// explicit, optional opt-in to receive trek tips and offers; without it the
// address may only be used to deliver what the person asked for.
const leadSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    name: { type: String, trim: true, maxlength: 120, default: '' },
    source: { type: String, trim: true, maxlength: 60, default: 'packing-list' },
    marketingConsent: { type: Boolean, default: false },
    marketingConsentAt: { type: Date, default: null },
    signupCount: { type: Number, default: 1 },
    lastSignupAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leadSchema.index({ email: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
