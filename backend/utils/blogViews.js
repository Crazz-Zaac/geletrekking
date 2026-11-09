// Counts one view per visitor, per post, per day, without cookies or storing
// addresses: only a one-way fingerprint is held, in memory, using a random
// value that changes daily, so it can't be linked back to anyone or across days.

const crypto = require('crypto');

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_REMEMBERED = 200000;
const BOT_AGENT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless/i;

let salt = crypto.randomBytes(32);
let startedAt = Date.now();
let seen = new Set();

const isBot = (userAgent) => !userAgent || BOT_AGENT.test(userAgent);

/** True the first time this visitor reads this post today. */
const isFirstViewToday = ({ ip, userAgent, slug }, now = Date.now()) => {
  if (now - startedAt > DAY_MS || seen.size >= MAX_REMEMBERED) {
    salt = crypto.randomBytes(32);
    startedAt = now;
    seen = new Set();
  }
  const fingerprint = crypto.createHmac('sha256', salt).update(`${ip}|${userAgent}|${slug}`).digest('base64');
  if (seen.has(fingerprint)) return false;
  seen.add(fingerprint);
  return true;
};

module.exports = { isBot, isFirstViewToday };
