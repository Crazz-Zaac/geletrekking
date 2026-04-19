const { getProfile, saveProfile } = require("../config/riskStore");

const toBoolean = (value, fallback = true) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no", "off"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

const config = {
  enabled: toBoolean(process.env.RISK_ANALYSIS_ENABLED, true),
  blockThreshold: Number.parseInt(process.env.RISK_BLOCK_THRESHOLD || "100", 10),
  blockDurationMs: Number.parseInt(process.env.RISK_BLOCK_DURATION_MS || `${30 * 60 * 1000}`, 10),
  requestWindowMs: Number.parseInt(process.env.RISK_REQUEST_WINDOW_MS || `${60 * 1000}`, 10),
  requestWindowLimit: Number.parseInt(process.env.RISK_REQUEST_WINDOW_LIMIT || "80", 10),
  contactWindowMs: Number.parseInt(process.env.RISK_CONTACT_WINDOW_MS || `${5 * 60 * 1000}`, 10),
  contactWindowLimit: Number.parseInt(process.env.RISK_CONTACT_WINDOW_LIMIT || "8", 10),
  profileTtlMs: Number.parseInt(process.env.RISK_PROFILE_TTL_MS || `${24 * 60 * 60 * 1000}`, 10),
};

const SUSPICIOUS_UA = /(curl|wget|python|scrapy|httpclient|bot|spider|crawler|headless)/i;
const URL_PATTERN = /(https?:\/\/|www\.)/gi;

const now = () => Date.now();

const trimEvents = (events, windowMs, currentTime) => {
  const from = currentTime - windowMs;
  while (events.length && events[0] < from) {
    events.shift();
  }
};

const addScore = (profile, points) => {
  if (points <= 0) return;
  profile.score += points;
};

const decayScore = (profile, elapsedMs) => {
  if (!elapsedMs || elapsedMs <= 0) return;
  const decayUnits = Math.floor(elapsedMs / (5 * 60 * 1000));
  if (decayUnits > 0) {
    profile.score = Math.max(0, profile.score - decayUnits * 3);
  }
};

const classifyPayload = (body = {}) => {
  const text = [body.name, body.email, body.message]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(" ");

  const urls = text.match(URL_PATTERN) || [];
  let points = 0;
  if (urls.length >= 2) points += 20;
  if (text.length > 4500) points += 10;
  if (/\b(free money|casino|seo|viagra|crypto)\b/i.test(text)) points += 25;
  if (/([A-Z]{6,}\s*){5,}/.test(text)) points += 10;

  return points;
};

const requestRiskMiddleware = async (req, res, next) => {
  if (!config.enabled) return next();

  try {
    const currentTime = now();
    const ipKey = req.ip || req.socket?.remoteAddress || "unknown-ip";
    const userAgent = String(req.get("user-agent") || "").trim();
    const acceptHeader = String(req.get("accept") || "").trim();
    const deviceKey = `${ipKey}::${userAgent || "no-ua"}`;

    const [ipProfile, deviceProfile] = await Promise.all([
      getProfile({ profileType: "ip", profileKey: ipKey, profileTtlMs: config.profileTtlMs, currentTime }),
      getProfile({ profileType: "device", profileKey: deviceKey, profileTtlMs: config.profileTtlMs, currentTime }),
    ]);

    decayScore(ipProfile, currentTime - (ipProfile.lastRiskCheckAt || currentTime));
    decayScore(deviceProfile, currentTime - (deviceProfile.lastRiskCheckAt || currentTime));
    ipProfile.lastRiskCheckAt = currentTime;
    deviceProfile.lastRiskCheckAt = currentTime;

    if (ipProfile.blockedUntil > currentTime || deviceProfile.blockedUntil > currentTime) {
      return res.status(429).json({ message: "Request blocked due to suspicious activity. Please try later." });
    }

    ipProfile.requestEvents.push(currentTime);
    deviceProfile.requestEvents.push(currentTime);

    trimEvents(ipProfile.requestEvents, config.requestWindowMs, currentTime);
    trimEvents(deviceProfile.requestEvents, config.requestWindowMs, currentTime);

    if (!userAgent) {
      addScore(ipProfile, 15);
      addScore(deviceProfile, 15);
    }

    if (userAgent && SUSPICIOUS_UA.test(userAgent)) {
      addScore(ipProfile, 20);
      addScore(deviceProfile, 25);
    }

    if (!acceptHeader) {
      addScore(ipProfile, 5);
      addScore(deviceProfile, 5);
    }

    if (ipProfile.requestEvents.length > config.requestWindowLimit) {
      addScore(ipProfile, 35);
    }

    if (deviceProfile.requestEvents.length > config.requestWindowLimit) {
      addScore(deviceProfile, 35);
    }

    const isContactSubmission = req.method === "POST" && req.path === "/contact";
    if (isContactSubmission) {
      ipProfile.contactEvents.push(currentTime);
      deviceProfile.contactEvents.push(currentTime);
      trimEvents(ipProfile.contactEvents, config.contactWindowMs, currentTime);
      trimEvents(deviceProfile.contactEvents, config.contactWindowMs, currentTime);

      if (ipProfile.contactEvents.length > config.contactWindowLimit) {
        addScore(ipProfile, 30);
      }

      if (deviceProfile.contactEvents.length > config.contactWindowLimit) {
        addScore(deviceProfile, 30);
      }

      const payloadRisk = classifyPayload(req.body || {});
      addScore(ipProfile, payloadRisk);
      addScore(deviceProfile, payloadRisk);
    }

    const highestScore = Math.max(ipProfile.score, deviceProfile.score);
    if (highestScore >= config.blockThreshold) {
      const blockedUntil = currentTime + config.blockDurationMs;
      ipProfile.blockedUntil = Math.max(ipProfile.blockedUntil || 0, blockedUntil);
      deviceProfile.blockedUntil = Math.max(deviceProfile.blockedUntil || 0, blockedUntil);
      await Promise.all([
        saveProfile({ profileType: "ip", profileKey: ipKey, profile: ipProfile, profileTtlMs: config.profileTtlMs }),
        saveProfile({ profileType: "device", profileKey: deviceKey, profile: deviceProfile, profileTtlMs: config.profileTtlMs }),
      ]);
      return res.status(429).json({ message: "Suspicious behavior detected. Please retry later." });
    }

    await Promise.all([
      saveProfile({ profileType: "ip", profileKey: ipKey, profile: ipProfile, profileTtlMs: config.profileTtlMs }),
      saveProfile({ profileType: "device", profileKey: deviceKey, profile: deviceProfile, profileTtlMs: config.profileTtlMs }),
    ]);

    req.riskContext = {
      ipScore: ipProfile.score,
      deviceScore: deviceProfile.score,
    };

    return next();
  } catch (error) {
    return next();
  }
};

module.exports = requestRiskMiddleware;
