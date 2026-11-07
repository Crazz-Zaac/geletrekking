// Booking-form PDF retention: the signed PDF (personal details) is removed from
// the database a while after the trek ends. The booking record itself (name,
// trek, dates, form answers) is kept, so the admin history stays intact.
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

  const result = await BookingSubmission.updateMany(
    {
      'pdf.data': { $exists: true },
      $or: [
        { trekEndDate: { $regex: DATE_RE, $lt: endDateCutoff } },
        { trekEndDate: { $not: DATE_RE }, createdAt: { $lt: createdCutoff } },
      ],
    },
    { $unset: { 'pdf.data': '' }, $set: { 'pdf.purgedAt': new Date() } }
  );

  if (result.modifiedCount) {
    console.log(`[pdf-retention] removed ${result.modifiedCount} booking PDF(s) older than ${months} months after the trek`);
  }
  return result.modifiedCount;
};

const startBookingPdfRetentionJob = () => {
  cron.schedule(
    process.env.BOOKING_PDF_RETENTION_CRON || '30 3 * * *',
    () => void purgeExpiredBookingPdfs().catch((error) => console.error('[pdf-retention]', error.message)),
    { timezone: 'Asia/Kathmandu' }
  );
  console.log(`[pdf-retention] daily job scheduled (keeps booking PDFs ${retentionMonths()} months after the trek)`);
};

module.exports = { purgeExpiredBookingPdfs, startBookingPdfRetentionJob };
