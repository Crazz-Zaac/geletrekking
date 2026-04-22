const { createClient } = require("redis");

const IP_PROFILES = new Map();
const DEVICE_PROFILES = new Map();

const toBoolean = (value, fallback = true) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no", "off"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

const redisConfig = {
  enabled: toBoolean(process.env.RISK_USE_REDIS, true),
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST || "redis",
  port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

let redisClient = null;
let redisConnectPromise = null;
let lastRedisError = null;
let lastRedisErrorAt = null;
let lastRedisConnectAt = null;

const getMemoryStore = (profileType) => {
  if (profileType === "device") return DEVICE_PROFILES;
  return IP_PROFILES;
};

const makeDefaultProfile = (currentTime) => ({
  score: 0,
  blockedUntil: 0,
  requestEvents: [],
  contactEvents: [],
  lastSeenAt: currentTime,
  lastRiskCheckAt: currentTime,
});

const sanitizeProfile = (profile, currentTime) => {
  const safeProfile = {
    score: Number.isFinite(profile?.score) ? profile.score : 0,
    blockedUntil: Number.isFinite(profile?.blockedUntil) ? profile.blockedUntil : 0,
    requestEvents: Array.isArray(profile?.requestEvents)
      ? profile.requestEvents.filter((eventTime) => Number.isFinite(eventTime))
      : [],
    contactEvents: Array.isArray(profile?.contactEvents)
      ? profile.contactEvents.filter((eventTime) => Number.isFinite(eventTime))
      : [],
    lastSeenAt: Number.isFinite(profile?.lastSeenAt) ? profile.lastSeenAt : currentTime,
    lastRiskCheckAt: Number.isFinite(profile?.lastRiskCheckAt) ? profile.lastRiskCheckAt : currentTime,
  };

  return safeProfile;
};

const getRedisConnectionOptions = () => {
  if (redisConfig.url) {
    return { url: redisConfig.url };
  }

  const auth = redisConfig.password ? `:${encodeURIComponent(redisConfig.password)}@` : "";
  return { url: `redis://${auth}${redisConfig.host}:${redisConfig.port}` };
};

const getRedisKey = (profileType, profileKey) => {
  const encodedKey = Buffer.from(String(profileKey), "utf8").toString("base64url");
  return `risk:${profileType}:${encodedKey}`;
};

const connectRedis = async () => {
  if (!redisConfig.enabled) return null;
  if (redisClient?.isOpen) return redisClient;
  if (redisConnectPromise) return redisConnectPromise;

  redisConnectPromise = (async () => {
    try {
      redisClient = createClient(getRedisConnectionOptions());
      redisClient.on("error", (error) => {
        lastRedisError = error?.message || "Redis connection error";
        lastRedisErrorAt = new Date().toISOString();
      });
      redisClient.on("ready", () => {
        lastRedisConnectAt = new Date().toISOString();
        lastRedisError = null;
      });
      await redisClient.connect();
      lastRedisConnectAt = new Date().toISOString();
      lastRedisError = null;
      return redisClient;
    } catch (error) {
      lastRedisError = error?.message || "Redis initial connection failed";
      lastRedisErrorAt = new Date().toISOString();
      redisClient = null;
      return null;
    } finally {
      redisConnectPromise = null;
    }
  })();

  return redisConnectPromise;
};

const readProfile = async (profileType, profileKey) => {
  const client = await connectRedis();
  if (!client) return null;

  try {
    const raw = await client.get(getRedisKey(profileType, profileKey));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const writeProfile = async (profileType, profileKey, profile, ttlMs) => {
  const client = await connectRedis();
  if (!client) return false;

  try {
    const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
    await client.set(getRedisKey(profileType, profileKey), JSON.stringify(profile), {
      EX: ttlSeconds,
    });
    return true;
  } catch (error) {
    return false;
  }
};

const getProfile = async ({ profileType, profileKey, profileTtlMs, currentTime }) => {
  const store = getMemoryStore(profileType);
  const defaultProfile = makeDefaultProfile(currentTime);

  const redisProfile = await readProfile(profileType, profileKey);
  if (redisProfile) {
    const normalized = sanitizeProfile(redisProfile, currentTime);
    if (currentTime - normalized.lastSeenAt > profileTtlMs) {
      normalized.score = 0;
      normalized.blockedUntil = 0;
      normalized.requestEvents = [];
      normalized.contactEvents = [];
    }
    normalized.lastSeenAt = currentTime;
    return normalized;
  }

  const memoryProfile = store.get(profileKey);
  if (!memoryProfile) {
    store.set(profileKey, defaultProfile);
    return defaultProfile;
  }

  const normalized = sanitizeProfile(memoryProfile, currentTime);
  if (currentTime - normalized.lastSeenAt > profileTtlMs) {
    normalized.score = 0;
    normalized.blockedUntil = 0;
    normalized.requestEvents = [];
    normalized.contactEvents = [];
  }
  normalized.lastSeenAt = currentTime;
  store.set(profileKey, normalized);
  return normalized;
};

const saveProfile = async ({ profileType, profileKey, profile, profileTtlMs }) => {
  const store = getMemoryStore(profileType);
  store.set(profileKey, profile);

  const redisSaved = await writeProfile(profileType, profileKey, profile, profileTtlMs);
  return redisSaved;
};

const getRiskStoreHealth = async () => {
  const client = await connectRedis();
  let redisConnected = Boolean(client?.isOpen);
  let redisReachable = false;

  if (client?.isOpen) {
    try {
      const pong = await client.ping();
      redisReachable = pong === "PONG";
    } catch (error) {
      redisReachable = false;
      lastRedisError = error?.message || "Redis ping failed";
      lastRedisErrorAt = new Date().toISOString();
    }
  }

  if (!redisConnected && redisConfig.enabled) {
    redisConnected = Boolean(redisClient?.isOpen);
  }

  const mode = redisConfig.enabled && redisConnected && redisReachable ? "redis" : "memory-fallback";

  return {
    mode,
    redis: {
      enabled: redisConfig.enabled,
      connected: redisConnected,
      reachable: redisReachable,
      urlConfigured: Boolean(redisConfig.url),
      host: redisConfig.host,
      port: redisConfig.port,
      lastError: lastRedisError,
      lastErrorAt: lastRedisErrorAt,
      lastConnectedAt: lastRedisConnectAt,
    },
    memoryProfiles: {
      ip: IP_PROFILES.size,
      device: DEVICE_PROFILES.size,
    },
  };
};

module.exports = {
  getProfile,
  saveProfile,
  getRiskStoreHealth,
};
