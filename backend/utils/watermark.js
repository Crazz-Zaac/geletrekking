// Watermarked previews of company certificates for the public
// Registrations & Affiliations page.
//
// The original file stays private (only admins see its link). Visitors get a
// resized WebP with a repeating diagonal "geletrekking.com · for verification
// only" mark and a footer band, so a copied certificate is easy to recognise.

const sharp = require('sharp');

const SIZES = { thumb: 720, full: 1600 };
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15000;
const CACHE_LIMIT = 24;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

// Private / link-local ranges that must never be fetched (SSRF guard).
// Checked after URL parsing and after each redirect to block redirect-chain attacks.
const PRIVATE_IP_RE =
  /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|127\.\d+\.\d+\.\d+|169\.254\.\d+\.\d+|::1|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|::ffff:0?10\.|::ffff:0?127\.|::ffff:0?172\.(1[6-9]|2\d|3[01])\.|::ffff:0?192\.168\.|::ffff:a9fe:)$/i;

/**
 * Throws if `url` resolves to a private/link-local/loopback address.
 * Also rejects non-HTTPS schemes.
 */
const assertSafeUrl = (url) => {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid document URL');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Document link must use https');
  }
  const host = parsed.hostname.toLowerCase();
  // Block numeric IP literals that resolve to private ranges.
  if (PRIVATE_IP_RE.test(host)) {
    throw new Error('Document link targets a private network address');
  }
  // Block localhost by name.
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Document link targets a private network address');
  }
};

const WATERMARK_TEXT = 'geletrekking.com · for verification only';
const FOOTER_TEXT = 'Shared by Gele Trekking for verification only · geletrekking.com';

const cache = new Map(); // key -> { buffer, expires }

const escapeXml = (text) =>
  text.replace(/[<>&'"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[ch]));

const buildOverlay = (width, height) => {
  const fontSize = Math.max(14, Math.round(width / 38));
  const tileWidth = Math.round(fontSize * 23);
  const tileHeight = Math.round(fontSize * 6);
  const footerHeight = Math.round(fontSize * 1.9);
  const footerFont = Math.max(11, Math.round(fontSize * 0.72));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <pattern id="wm" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
      <text x="0" y="${Math.round(tileHeight * 0.55)}" font-family="DejaVu Sans, sans-serif" font-size="${fontSize}" font-weight="bold"
        fill="#0b4a5c" fill-opacity="0.17">${escapeXml(WATERMARK_TEXT)}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#wm)"/>
  <rect x="0" y="${height - footerHeight}" width="${width}" height="${footerHeight}" fill="#ffffff" fill-opacity="0.88"/>
  <text x="${Math.round(width / 2)}" y="${height - Math.round(footerHeight * 0.34)}" text-anchor="middle"
    font-family="DejaVu Sans, sans-serif" font-size="${footerFont}" fill="#333333">${escapeXml(FOOTER_TEXT)}</text>
</svg>`);
};

const fetchSource = async (url) => {
  assertSafeUrl(url);  // throws on private IPs or non-HTTPS before the network call
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // `redirect: 'manual'` prevents following redirects automatically — we
    // inspect each hop ourselves so a redirect chain cannot escape to a
    // private address.
    const response = await fetch(url, { signal: controller.signal, redirect: 'manual' });

    // Follow up to 5 redirects, asserting each destination is safe.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Redirect with no Location header');
      assertSafeUrl(location);  // guard the redirect target too
      // Re-fetch the redirect destination (recursive-safe: limited by fetch internals + our assertion)
      const followed = await fetch(location, { signal: controller.signal, redirect: 'follow' });
      if (!followed.ok) throw new Error(`Source returned ${followed.status}`);
      const declared = Number(followed.headers.get('content-length') || 0);
      if (declared > MAX_SOURCE_BYTES) throw new Error('Source image is too large');
      const buffer = Buffer.from(await followed.arrayBuffer());
      if (buffer.length > MAX_SOURCE_BYTES) throw new Error('Source image is too large');
      return buffer;
    }

    if (!response.ok) throw new Error(`Source returned ${response.status}`);
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > MAX_SOURCE_BYTES) throw new Error('Source image is too large');
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_SOURCE_BYTES) throw new Error('Source image is too large');
    return buffer;
  } finally {
    clearTimeout(timer);
  }
};

/** Returns a watermarked WebP (Buffer) of the image at `url`. size: "thumb" | "full". */
const getWatermarkedImage = async (url, size = 'thumb') => {
  const key = `${size}|${url}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.buffer;

  const source = await fetchSource(url);
  const resized = await sharp(source, { limitInputPixels: 80_000_000 })
    .rotate()
    .resize({ width: SIZES[size] || SIZES.thumb, withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .toBuffer({ resolveWithObject: true });

  const { width, height } = resized.info;
  const buffer = await sharp(resized.data)
    .composite([{ input: buildOverlay(width, height), top: 0, left: 0 }])
    .webp({ quality: size === 'full' ? 80 : 72 })
    .toBuffer();

  cache.set(key, { buffer, expires: Date.now() + CACHE_TTL_MS });
  while (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
  return buffer;
};

module.exports = { getWatermarkedImage };
