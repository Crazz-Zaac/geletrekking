const nodemailer = require('nodemailer');

// Outgoing email (admin invites, review requests, notifications).
//
// Default (unchanged): Gmail with EMAIL_USER / EMAIL_PASS.
// To send as info@geletrekking.com through a provider (Resend, Zoho, Brevo…):
//   SMTP_HOST=smtp.resend.com  SMTP_PORT=465
//   SMTP_USER=resend            SMTP_PASS=<Resend API key>
//   EMAIL_FROM="Gele Trekking <info@geletrekking.com>"
//   EMAIL_REPLY_TO=info@geletrekking.com          (optional)
// Notifications about new enquiries/bookings go to ADMIN_NOTIFICATION_EMAIL
// (falls back to EMAIL_USER), independent of the sending login.

const usingSmtp = Boolean(process.env.SMTP_HOST);
const authUser = usingSmtp ? process.env.SMTP_USER || process.env.EMAIL_USER : process.env.EMAIL_USER;
const authPass = usingSmtp ? process.env.SMTP_PASS || process.env.EMAIL_PASS : process.env.EMAIL_PASS;
const port = Number(process.env.SMTP_PORT || 465);

const transporter = usingSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: authUser, pass: authPass },
    })
  : nodemailer.createTransport({
      service: 'gmail',
      auth: { user: authUser, pass: authPass },
    });

// `options.from` / `options.replyTo` override the defaults for one message.
const sendEmail = async (to, subject, text, options = {}) => {
  const replyTo = options.replyTo || process.env.EMAIL_REPLY_TO;
  const mailOptions = {
    from: options.from || process.env.EMAIL_FROM || `geleTrekking <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  };

  await transporter.sendMail(mailOptions);
};

/** True when outgoing email has credentials. */
sendEmail.isConfigured = () => Boolean(authUser && authPass);

/** Where admin notifications (new enquiries, bookings) are delivered. */
sendEmail.notificationRecipient = () => process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || '';

module.exports = sendEmail;
