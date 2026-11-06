// Google reviews via Featurable's official API, fetched by this server.
//
// Visitors' browsers never contact Featurable or Google: the backend fetches
// and caches the reviews, and reviewer photos are served through
// /api/reviews/avatar/:id. That keeps visitor IP addresses away from third
// parties, so no cookie consent is needed to show reviews.
//
// Docs: https://featurable.com/docs/api-reference/widgets/
// Env:  FEATURABLE_API_KEY (required), FEATURABLE_WIDGET_ID, FEATURABLE_CACHE_HOURS

const crypto = require('crypto');

const API_URL = 'https://featurable.com/api/v2/widgets';
const API_URL_V1 = 'https://featurable.com/api/v1/widgets';
const WIDGET_ID = process.env.FEATURABLE_WIDGET_ID || 'd8cabeae-9e92-42e1-ab78-75f13b25aa45';
const CACHE_MS = Number(process.env.FEATURABLE_CACHE_HOURS || 6) * 60 * 60 * 1000;
const RETRY_AFTER_ERROR_MS = 10 * 60 * 1000;
const MAX_REVIEWS = 20;

// Only these hosts may be fetched by the avatar proxy (prevents SSRF).
const AVATAR_HOSTS = [/\.googleusercontent\.com$/i, /\.ggpht\.com$/i, /(^|\.)featurable\.com$/i];

let cache = null; // { data, fetchedAt }
let lastErrorAt = 0;
let inflight = null;
let loggedShape = false;
const avatarSources = new Map(); // public id -> source URL

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const isAllowedAvatar = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && AVATAR_HOSTS.some((pattern) => pattern.test(parsed.hostname));
  } catch {
    return false;
  }
};

const normalizeReview = (review) => {
  const author = review.author || review.reviewer || {};
  const rating = toNumber(review.rating?.value ?? review.rating ?? review.starRating);
  const text = String(pick(review.text, review.originalText, review.comment, '') || '').trim();
  const name = String(pick(author.name, author.displayName, 'Google user')).trim();
  const date = pick(review.publishedAt, review.createdAt, review.timestamps?.publishedAt, review.timestamps?.createdAt, review.timestamps?.created, review.createTime, null);
  const avatarSource = pick(author.avatarUrl, author.avatar, author.profilePhotoUrl, author.photoUrl, null);
  const sourceId = String(pick(review.id, review.reviewId, `${name}-${date}`));
  const id = crypto.createHash('sha256').update(sourceId).digest('hex').slice(0, 16);

  let avatar = null;
  if (avatarSource && isAllowedAvatar(avatarSource)) {
    avatarSources.set(id, avatarSource);
    avatar = `/api/reviews/avatar/${id}`;
  }

  return {
    id,
    name,
    rating: rating === null ? null : Math.max(0, Math.min(5, rating)),
    text,
    date: date ? new Date(date).toISOString() : null,
    url: typeof review.url === 'string' && /^https:\/\//.test(review.url) ? review.url : null,
    avatar,
  };
};

const normalize = (payload) => {
  const summary = payload.gbpLocationSummary || {};
  const reviews = (Array.isArray(payload.reviews) ? payload.reviews : [])
    .map(normalizeReview)
    .filter((review) => review.text && review.rating !== null && !/^\[EXAMPLE REVIEW\]/i.test(review.text))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, MAX_REVIEWS);

  return {
    averageRating: toNumber(pick(summary.averageRating, payload.averageRating)),
    totalReviewCount: toNumber(pick(summary.reviewCount, summary.totalReviewCount, payload.totalReviewCount)),
    writeReviewUrl: pick(summary.writeAReviewUri, summary.writeReviewUri, payload.profileUrl, null),
    showBranding: payload.showBranding !== false,
    reviews,
  };
};

const fetchFromFeaturable = async () => {
  const apiKey = process.env.FEATURABLE_API_KEY;
  if (!apiKey) throw new Error('FEATURABLE_API_KEY is not set');

  const request = (base) =>
    fetch(`${base}/${encodeURIComponent(WIDGET_ID)}`, {
      headers: { 'X-API-Key': apiKey, accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

  // Newer widgets are served by API v2; older widgets only exist on v1.
  let response = await request(API_URL);
  if (response.status === 404) response = await request(API_URL_V1);
  if (!response.ok) throw new Error(`Featurable API responded ${response.status}`);
  const payload = await response.json();
  if (payload?.success === false) throw new Error('Featurable API returned success=false');

  if (!loggedShape) {
    loggedShape = true;
    const sample = Array.isArray(payload.reviews) && payload.reviews[0];
    console.log('[reviews] Featurable fields:', Object.keys(payload || {}).join(','), '| review:', sample ? Object.keys(sample).join(',') : 'none', '| author:', sample?.author ? Object.keys(sample.author).join(',') : 'none');
  }
  return normalize(payload);
};

/** Cached reviews. Serves the last good copy if Featurable is unavailable. */
const getReviews = async () => {
  const now = Date.now();
  const fresh = cache && now - cache.fetchedAt < CACHE_MS;
  const backingOff = now - lastErrorAt < RETRY_AFTER_ERROR_MS;
  if (fresh || (cache && backingOff)) return cache.data;
  if (!cache && backingOff) return null;

  if (!inflight) {
    inflight = fetchFromFeaturable()
      .then((data) => {
        cache = { data, fetchedAt: Date.now() };
        return data;
      })
      .catch((error) => {
        lastErrorAt = Date.now();
        console.warn('[reviews] fetch failed:', error.message);
        return cache ? cache.data : null;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

const getAvatarSource = (id) => avatarSources.get(id) || null;

module.exports = { getReviews, getAvatarSource, isAllowedAvatar };
