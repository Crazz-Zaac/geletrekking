// A short "we received it" email to the person who wrote to us.
//
// These addresses are unverified, so the text is fixed and never repeats what
// was typed into the form. Otherwise the form could be used to send someone
// else a message of the sender's choosing. Only a plain first name is used.

const sendEmail = require('./sendEmail');

const FROM = 'Gele Trekking <info@geletrekking.com>';
const REPLY_TO = 'info@geletrekking.com';

const COPY = {
  inquiry: {
    subject: 'We received your message - Gele Trekking',
    received: 'Thank you for contacting Gele Trekking. We have received your message and will reply within 24 hours.',
  },
  booking: {
    subject: 'We received your booking form - Gele Trekking',
    received: 'Thank you for completing your booking form. We have received it safely and will be in touch soon about the next steps.',
  },
  preBooking: {
    subject: 'We received your pre-booking - Gele Trekking',
    received: 'Thank you for your pre-booking with Gele Trekking. We have received your details and will reply within 24 hours.',
  },
};

const greetingName = (name) => {
  const first = String(name || '').trim().split(/\s+/)[0] || '';
  return /^\p{L}[\p{L}'-]{0,29}$/u.test(first) ? ` ${first}` : '';
};

const buildGuestConfirmation = (kind, name) => {
  const copy = COPY[kind];
  return {
    subject: copy.subject,
    text: [
      `Namaste${greetingName(name)},`,
      '',
      copy.received,
      '',
      'If anything is urgent, you can reach us on WhatsApp at +977 9843988164 or simply reply to this email.',
      '',
      'Thank you!',
      'The Gele Trekking team',
      'https://geletrekking.com',
      '',
      "If you didn't contact us, please ignore this email.",
    ].join('\n'),
  };
};

/** Never throws or delays the visitor: a failed courtesy email must not fail their submission. */
const sendGuestConfirmation = ({ to, name, kind }) => {
  if (!sendEmail.isConfigured() || !to) return;
  const { subject, text } = buildGuestConfirmation(kind, name);
  sendEmail(to, subject, text, { from: FROM, replyTo: REPLY_TO }).catch((error) => {
    console.error('Guest confirmation email error:', error.message);
  });
};

module.exports = { buildGuestConfirmation, sendGuestConfirmation };
