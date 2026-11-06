const express = require('express');
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictToRoles } = require('../middleware/roleMiddleware');
const { contactLimiter, contactSlowDown } = require('../middleware/rateLimitMiddleware');
const { logAudit } = require('../utils/auditLogger');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES = new Set(['packing-list']);

// Public: sign up for a free resource. No email is sent from here, so the form
// cannot be used to send mail to other people's addresses.
router.post('/', contactSlowDown, contactLimiter, async (req, res) => {
  try {
    const { email, name, marketingConsent, source = 'packing-list', website } = req.body || {};

    // Honeypot: real visitors never fill this hidden field.
    if (website) return res.status(201).json({ ok: true });

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 254) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!SOURCES.has(source)) return res.status(400).json({ message: 'Unknown sign-up.' });

    const consent = marketingConsent === true;
    const update = {
      $setOnInsert: { email: normalizedEmail, source },
      $set: { lastSignupAt: new Date(), ...(name ? { name: String(name).trim().slice(0, 120) } : {}) },
      $inc: { signupCount: 1 },
    };
    // Only ever turn consent on from a new, explicit opt-in; never silently off.
    if (consent) {
      update.$set.marketingConsent = true;
      update.$set.marketingConsentAt = new Date();
    }

    await Lead.findOneAndUpdate({ email: normalizedEmail, source }, update, { upsert: true, setDefaultsOnInsert: true });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('lead signup error:', err.message);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

const adminOnly = [authMiddleware, restrictToRoles('admin', 'superadmin')];

router.get('/admin', ...adminOnly, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ lastSignupAt: -1 }).limit(5000).lean();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  // Neutralise spreadsheet formulas and escape quotes.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

router.get('/admin/export.csv', ...adminOnly, async (req, res) => {
  try {
    const onlyConsented = req.query.consent === '1';
    const leads = await Lead.find(onlyConsented ? { marketingConsent: true } : {}).sort({ lastSignupAt: -1 }).lean();
    const rows = [['email', 'name', 'source', 'marketing_consent', 'consent_date', 'first_signup', 'last_signup']];
    for (const lead of leads) {
      rows.push([
        lead.email,
        lead.name,
        lead.source,
        lead.marketingConsent ? 'yes' : 'no',
        lead.marketingConsentAt ? new Date(lead.marketingConsentAt).toISOString() : '',
        lead.createdAt ? new Date(lead.createdAt).toISOString() : '',
        lead.lastSignupAt ? new Date(lead.lastSignupAt).toISOString() : '',
      ]);
    }
    await logAudit({ actor: req.user._id, actorEmail: req.user.email, action: 'leads.export', outcome: 'success', ip: req.ip, meta: { count: leads.length, onlyConsented } });
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    });
    res.send(rows.map((row) => row.map(csvCell).join(',')).join('\r\n'));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/admin/:id', ...adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Not found' });
    await logAudit({ actor: req.user._id, actorEmail: req.user.email, action: 'leads.delete', outcome: 'success', ip: req.ip, meta: { email: lead.email } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
