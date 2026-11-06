// Daily SSL certificate monitor.
//
// Checks the certificate nginx is actually serving (not just the file on
// disk), so it also catches "replaced but nginx not reloaded". Production uses
// a long-lived Cloudflare Origin Certificate, so an alert means it is close to
// expiry or something replaced it: email the superadmin.

const tls = require('tls');
const fs = require('fs/promises');
const { X509Certificate } = require('crypto');
const cron = require('node-cron');
const sendEmail = require('../utils/sendEmail');

const ALERT_DAYS = Number(process.env.SSL_ALERT_DAYS || 21);
const CHECK_HOST = process.env.SSL_CHECK_HOST || 'nginx';
const CHECK_PORT = Number(process.env.SSL_CHECK_PORT || 443);
const SERVERNAME = process.env.SSL_CHECK_SERVERNAME || 'geletrekking.com';
const CERT_PATH = process.env.SSL_CERT_PATH || '/etc/nginx/certs/fullchain.pem';
const SCHEDULE = process.env.SSL_CHECK_CRON || '0 9 * * *';

const daysUntil = (date) => (date.getTime() - Date.now()) / (24 * 60 * 60 * 1000);

const getServedCertificate = () =>
  new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: CHECK_HOST,
      port: CHECK_PORT,
      servername: SERVERNAME,
      // We only read the expiry date; trust is checked by Cloudflare/browsers.
      rejectUnauthorized: false,
      timeout: 10000,
    });
    socket.once('secureConnect', () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert || !cert.valid_to) return reject(new Error('No certificate presented'));
      resolve({ source: `served by ${CHECK_HOST}:${CHECK_PORT}`, validTo: new Date(cert.valid_to), subject: cert.subject?.CN });
    });
    socket.once('timeout', () => {
      socket.destroy();
      reject(new Error('TLS connection timed out'));
    });
    socket.once('error', reject);
  });

const getFileCertificate = async () => {
  const pem = await fs.readFile(CERT_PATH, 'utf8');
  const cert = new X509Certificate(pem);
  return { source: `file ${CERT_PATH}`, validTo: new Date(cert.validTo), subject: cert.subject };
};

const recipients = () =>
  (process.env.SSL_ALERT_EMAIL || process.env.SUPERADMIN_EMAIL || process.env.EMAIL_USER || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const alert = async (subject, text) => {
  const to = recipients();
  console.warn(`[ssl-monitor] ALERT: ${subject}`);
  if (to.length === 0) return;
  try {
    await sendEmail(to.join(','), subject, text);
  } catch (error) {
    console.error('[ssl-monitor] could not send alert email:', error.message);
  }
};

const checkCertificate = async ({ notify = true } = {}) => {
  let result;
  try {
    result = await getServedCertificate();
  } catch (servedError) {
    try {
      result = await getFileCertificate();
      result.note = `Could not reach nginx (${servedError.message}); checked the file instead.`;
    } catch (fileError) {
      if (notify) {
        await alert(
          '[Gele Trekking] SSL check failed',
          `The daily SSL certificate check could not read the certificate.\n\nServed: ${servedError.message}\nFile: ${fileError.message}\n\nCheck the server: docker logs geletrekking-nginx`
        );
      }
      return null;
    }
  }

  const days = daysUntil(result.validTo);
  const summary = `${result.subject || SERVERNAME}: expires ${result.validTo.toISOString()} (${days.toFixed(1)} days left, ${result.source})`;
  console.log(`[ssl-monitor] ${summary}`);

  if (notify && days <= ALERT_DAYS) {
    await alert(
      days <= 0 ? '[Gele Trekking] SSL certificate EXPIRED' : `[Gele Trekking] SSL certificate expires in ${Math.max(0, Math.floor(days))} days`,
      [
        `The SSL certificate for ${SERVERNAME} ${days <= 0 ? 'has expired' : `expires in ${days.toFixed(1)} days`} (${result.validTo.toUTCString()}).`,
        '',
        result.note || '',
        '',
        'To replace it: create a new Origin Certificate in Cloudflare (SSL/TLS > Origin Server),',
        'save the certificate and key on the server, then run:',
        '  cd ~/geletrekking/docker && sudo ./scripts/install-origin-cert.sh cert.pem key.pem',
        'Details: docker/SSL_SETUP.md',
      ].join('\n')
    );
  }
  return { ...result, days };
};

const startSslMonitor = () => {
  cron.schedule(SCHEDULE, () => void checkCertificate(), { timezone: 'Asia/Kathmandu' });
  // Log the status once shortly after startup (no email, to avoid repeats on restarts).
  setTimeout(() => void checkCertificate({ notify: false }), 60 * 1000).unref();
  console.log(`[ssl-monitor] scheduled "${SCHEDULE}" (Asia/Kathmandu), alert at <= ${ALERT_DAYS} days`);
};

module.exports = { startSslMonitor, checkCertificate };
