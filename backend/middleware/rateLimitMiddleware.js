const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many inquiries from this IP. Please wait before trying again." },
});

const contactSlowDown = slowDown({
  windowMs: 10 * 60 * 1000,
  delayAfter: 2,
  delayMs: (hits) => Math.min(3000, hits * 500),
});

module.exports = {
  apiLimiter,
  contactLimiter,
  contactSlowDown,
};
