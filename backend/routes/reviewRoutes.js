const express = require('express');
const { getReviews, getAvatarSource, isAllowedAvatar } = require('../utils/featurableReviews');

const router = express.Router();

const AVATAR_MAX_BYTES = 512 * 1024;
const AVATAR_CACHE_MS = 24 * 60 * 60 * 1000;
const AVATAR_CACHE_LIMIT = 100;
const avatarCache = new Map(); // id -> { body, type, cachedAt }
// Avatars are shown at 40px (80px covers 2x screens); browsers may keep them for 30 days (ids are stable per review).
const AVATAR_BROWSER_CACHE = 'public, max-age=2592000, stale-while-revalidate=86400';

// Google profile photos take a size suffix (".../photo=s128-c0x00000000-cc-rp-mo").
// Ask for a small square instead of the full-size original as WebP (~35 KB -> ~3 KB).
const smallAvatarUrl = (source) => {
  try {
    const url = new URL(source);
    if (!/(^|\.)googleusercontent\.com$/.test(url.hostname)) return source;
    url.pathname = /=[^/]*$/.test(url.pathname) ? url.pathname.replace(/=[^/]*$/, '=s80-c-rw') : `${url.pathname}=s80-c-rw`;
    return url.toString();
  } catch {
    return source;
  }
};

// Public: Google reviews (cached server-side, no third-party calls from browsers).
router.get('/', async (req, res) => {
  const data = await getReviews();
  res.set('Cache-Control', 'public, max-age=600');
  if (!data) {
    return res.json({ available: false, averageRating: null, totalReviewCount: null, writeReviewUrl: null, showBranding: false, reviews: [] });
  }
  res.json({ available: true, ...data });
});

// Public: reviewer photo proxy. Only serves photos referenced by the cached
// reviews (looked up by id), never an arbitrary URL.
router.get('/avatar/:id', async (req, res) => {
  const id = String(req.params.id || '');
  if (!/^[a-f0-9]{16}$/.test(id)) return res.status(404).end();

  const cached = avatarCache.get(id);
  if (cached && Date.now() - cached.cachedAt < AVATAR_CACHE_MS) {
    res.set({ 'Content-Type': cached.type, 'Cache-Control': AVATAR_BROWSER_CACHE, 'X-Content-Type-Options': 'nosniff' });
    return res.send(cached.body);
  }

  // Make sure the review list (and so the id -> photo map) is loaded.
  if (!getAvatarSource(id)) await getReviews();
  const source = getAvatarSource(id);
  if (!source || !isAllowedAvatar(source)) return res.status(404).end();

  try {
    let upstream = await fetch(smallAvatarUrl(source), { redirect: 'error', signal: AbortSignal.timeout(8000) });
    // Fall back to the original if the resized variant is unavailable.
    if (!upstream.ok && smallAvatarUrl(source) !== source) {
      upstream = await fetch(source, { redirect: 'error', signal: AbortSignal.timeout(8000) });
    }
    const type = upstream.headers.get('content-type') || '';
    if (!upstream.ok || !/^image\/(jpeg|png|webp|gif|avif)/.test(type)) return res.status(404).end();
    const body = Buffer.from(await upstream.arrayBuffer());
    if (body.length > AVATAR_MAX_BYTES) return res.status(404).end();

    if (avatarCache.size >= AVATAR_CACHE_LIMIT) avatarCache.delete(avatarCache.keys().next().value);
    avatarCache.set(id, { body, type, cachedAt: Date.now() });
    res.set({ 'Content-Type': type, 'Cache-Control': AVATAR_BROWSER_CACHE, 'X-Content-Type-Options': 'nosniff' });
    return res.send(body);
  } catch {
    return res.status(404).end();
  }
});

module.exports = router;
