// Post-trek review request: one short, personal email a few days after the
// trek's end date, asking the client to review us on Google.
//
// Safety rails:
// - REVIEW_REQUESTS_ENABLED must be "true" for the daily job to send anything
//   (otherwise it only logs what it would send).
// - Each booking is emailed at most once (status "sent"), and admins can mark a
//   booking "skipped" (e.g. cancelled trip) so it is never emailed.
// - Only treks that ended 2–14 days ago qualify, so switching the job on never
//   emails old customers in bulk.

const cron = require('node-cron');
const BookingSubmission = require('../models/BookingSubmission');
const ReviewEmailTemplate = require('../models/ReviewEmailTemplate');
const sendEmail = require('./sendEmail');

const WRITE_REVIEW_URL = process.env.GOOGLE_WRITE_REVIEW_URL || 'https://search.google.com/local/writereview?placeid=ChIJR_d6frYf6zkR0HAm4EnYRkI';
const MIN_DAYS_AFTER = 2;
const MAX_DAYS_AFTER = 14;
// Review requests always come from (and replies go to) the company inbox.
const REVIEW_FROM = 'Gele Trekking <info@geletrekking.com>';
const REVIEW_REPLY_TO = 'info@geletrekking.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_SUBJECT_LENGTH = 150;
const MAX_TEXT_LENGTH = 5000;

const isEnabled = () => process.env.REVIEW_REQUESTS_ENABLED === 'true';

const dateDaysAgo = (days) => {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD, same format as trekEndDate
};

// Admins can reword this in the dashboard; {name}, {trek} and {reviewLink} are filled in per booking.
const STANDARD_EMAIL = {
  subject: 'How was your trek, {name}?',
  text: [
    'Namaste {name},',
    '',
    "Thank you for trekking {trek} with Gele Trekking. We hope you're home safe with wonderful memories of the mountains.",
    '',
    'Could you spare a minute to share your experience on Google? Your review helps other trekkers choose with confidence, and it means a lot to our small team.',
    '',
    'Leave a review: {reviewLink}',
    '',
    "If anything about your trip wasn't right, please just reply to this email (or write to info@geletrekking.com). We read every message and would like to put it right.",
    '',
    'Thank you!',
    'The Gele Trekking team',
    'https://geletrekking.com',
    '',
    "(This is a one-time email; we won't send you reminders.)",
  ].join('\n'),
};

const PLACEHOLDERS = ['name', 'trek', 'reviewLink'];

const fillPlaceholders = (template, booking) => {
  const trek = String(booking.trekPackage || '').trim();
  const values = new Map([
    ['name', String(booking.firstName || '').trim() || 'there'],
    ['trek', trek ? `the ${trek}` : ''],
    ['reviewlink', WRITE_REVIEW_URL],
  ]);
  const filled = template.replace(/\{(\w+)\}/g, (match, key) => values.get(key.toLowerCase()) ?? match);
  return trek ? filled : filled.replace(/[ \t]{2,}/g, ' ');
};

const buildReviewRequestEmail = (booking, template = STANDARD_EMAIL) => ({
  subject: fillPlaceholders(template.subject, booking),
  text: fillPlaceholders(template.text, booking),
});

/** The standard wording now in force, with its placeholders still in it. */
const getReviewEmailTemplate = async () => {
  const saved = await ReviewEmailTemplate.findOne().lean();
  return saved ? { subject: saved.subject, text: saved.text, customized: true } : { ...STANDARD_EMAIL, customized: false };
};

/** The email this booking will actually receive: its own edit if there is one, otherwise the standard wording. */
const getReviewRequestEmail = async (booking) => {
  const standard = buildReviewRequestEmail(booking, await getReviewEmailTemplate());
  return {
    subject: String(booking.reviewRequestSubject || '').trim() || standard.subject,
    text: String(booking.reviewRequestText || '').trim() || standard.text,
  };
};

/** Validate an admin's edit. Subjects are kept to one line. */
const cleanReviewRequestEmail = (body) => {
  if (typeof body?.subject !== 'string' || typeof body?.text !== 'string') return { error: 'Subject and message are required.' };
  const subject = body.subject.replace(/\s*[\r\n]+\s*/g, ' ').trim();
  const text = body.text.replace(/\r\n?/g, '\n').trim();
  if (!subject) return { error: 'Add a subject.' };
  if (!text) return { error: 'Add a message.' };
  if (subject.length > MAX_SUBJECT_LENGTH) return { error: `Keep the subject under ${MAX_SUBJECT_LENGTH} characters.` };
  if (text.length > MAX_TEXT_LENGTH) return { error: `Keep the message under ${MAX_TEXT_LENGTH} characters.` };
  return { subject, text };
};

/** Validate the standard wording: as above, and a mistyped placeholder must not reach a guest. */
const cleanReviewEmailTemplate = (body) => {
  const cleaned = cleanReviewRequestEmail(body);
  if (cleaned.error) return cleaned;
  const known = PLACEHOLDERS.map((name) => name.toLowerCase());
  const unknown = `${cleaned.subject} ${cleaned.text}`.match(/\{[^{}]*\}/g)?.find((token) => !known.includes(token.slice(1, -1).toLowerCase()));
  if (unknown) return { error: `${unknown} isn't recognised. Use ${PLACEHOLDERS.map((name) => `{${name}}`).join(', ')}.` };
  return cleaned;
};

/** Send the request for one booking now and record the result. */
const sendReviewRequest = async (booking) => {
  if (!EMAIL_RE.test(String(booking.email || '').trim())) {
    booking.reviewRequestStatus = 'failed';
    booking.reviewRequestError = 'Invalid email address';
    await booking.save();
    throw new Error('Invalid email address');
  }
  try {
    const { subject, text } = await getReviewRequestEmail(booking);
    await sendEmail(booking.email.trim(), subject, text, { from: REVIEW_FROM, replyTo: REVIEW_REPLY_TO });
    booking.reviewRequestStatus = 'sent';
    booking.reviewRequestSentAt = new Date();
    booking.reviewRequestError = '';
    await booking.save();
  } catch (error) {
    booking.reviewRequestStatus = 'failed';
    booking.reviewRequestError = String(error.message || error).slice(0, 300);
    await booking.save();
    throw error;
  }
};

const findDueBookings = () =>
  BookingSubmission.find({
    reviewRequestStatus: 'pending',
    trekEndDate: { $gte: dateDaysAgo(MAX_DAYS_AFTER), $lte: dateDaysAgo(MIN_DAYS_AFTER) },
  }).select('-pdf.data');

const runReviewRequests = async () => {
  const due = await findDueBookings();
  if (due.length === 0) return;
  if (!isEnabled()) {
    console.log(`[review-requests] ${due.length} booking(s) due, but REVIEW_REQUESTS_ENABLED is not "true"; nothing sent.`);
    return;
  }
  for (const booking of due) {
    try {
      await sendReviewRequest(booking);
      console.log(`[review-requests] sent for booking ${booking._id}`);
    } catch (error) {
      console.warn(`[review-requests] failed for booking ${booking._id}: ${error.message}`);
    }
  }
};

const startReviewRequestJob = () => {
  cron.schedule(process.env.REVIEW_REQUESTS_CRON || '0 10 * * *', () => void runReviewRequests().catch((error) => console.error('[review-requests]', error.message)), {
    timezone: 'Asia/Kathmandu',
  });
  console.log(`[review-requests] daily job scheduled (${isEnabled() ? 'ENABLED' : 'disabled: set REVIEW_REQUESTS_ENABLED=true to send'})`);
};

module.exports = {
  buildReviewRequestEmail,
  getReviewRequestEmail,
  getReviewEmailTemplate,
  cleanReviewRequestEmail,
  cleanReviewEmailTemplate,
  WRITE_REVIEW_URL,
  sendReviewRequest,
  runReviewRequests,
  startReviewRequestJob,
  isReviewRequestsEnabled: isEnabled,
  REVIEW_REQUEST_WINDOW: { MIN_DAYS_AFTER, MAX_DAYS_AFTER },
};
