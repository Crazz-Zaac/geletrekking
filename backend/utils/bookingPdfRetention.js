// Booking-form retention: the signed PDF and the form answers (passport, medical,
// insurance, emergency contact and so on) are removed a while after the trek
// ends. Only the summary stays for the admin history: name, email, phone, trek
// and dates. The Privacy Policy states these periods, so keep the two in step.
//
// - BOOKING_PDF_RETENTION_MONTHS (default 12): months after the trek end date.
// - Bookings without a valid end date use the submission date plus 6 extra months.
// - Runs daily at 03:30 Nepal time (BOOKING_PDF_RETENTION_CRON to change).

const cron = require('node-cron');
const BookingSubmission = require('../models/BookingSubmission');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const NO_END_DATE_EXTRA_MONTHS = 6;

const retentionMonths = () => {
  const value = Number.parseInt(process.env.BOOKING_PDF_RETENTION_MONTHS || '', 10);
  return Number.isFinite(value) && value >= 1 ? value : 12;
};

const monthsAgo = (months) => {
  const date = new Date();
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
};

const purgeExpiredBookingPdfs = async () => {
  const months = retentionMonths();
  const endDateCutoff = monthsAgo(months).toISOString().slice(0, 10); // trekEndDate is YYYY-MM-DD
  const createdCutoff = monthsAgo(months + NO_END_DATE_EXTRA_MONTHS);

  const expired = {
    $or: [
      { trekEndDate: { $regex: DATE_RE, $lt: endDateCutoff } },
      { trekEndDate: { $not: DATE_RE }, createdAt: { $lt: createdCutoff } },
    ],
  };
  const now = new Date();

  const pdfs = await BookingSubmission.updateMany(
    { 'pdf.data': { $exists: true }, ...expired },
    { $unset: { 'pdf.data': '' }, $set: { 'pdf.purgedAt': now } }
  );
  const answers = await BookingSubmission.updateMany(
    { formDataPurgedAt: null, ...expired },
    { $set: { formData: {}, formDataPurgedAt: now } }
  );

  if (pdfs.modifiedCount || answers.modifiedCount) {
    console.log(`[pdf-retention] removed ${pdfs.modifiedCount} PDF(s) and ${answers.modifiedCount} set(s) of form answers older than ${months} months after the trek`);
  }
  return pdfs.modifiedCount + answers.modifiedCount;
};

const startBookingPdfRetentionJob = () => {
  cron.schedule(
    process.env.BOOKING_PDF_RETENTION_CRON || '30 3 * * *',
    () => void purgeExpiredBookingPdfs().catch((error) => console.error('[pdf-retention]', error.message)),
    { timezone: 'Asia/Kathmandu' }
  );
  console.log(`[pdf-retention] daily job scheduled (keeps booking PDFs and form answers ${retentionMonths()} months after the trek)`);
};

module.exports = { purgeExpiredBookingPdfs, startBookingPdfRetentionJob };
