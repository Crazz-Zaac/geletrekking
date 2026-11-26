// Keep one alt text per gallery photo (same order): trimmed, max 200 chars,
// padded or cut to the number of photos so the two lists never drift apart.
const MAX_ALT_LENGTH = 200;
const normalizeGalleryAlts = (data) => {
  if (!Array.isArray(data.gallery_images)) {
    delete data.gallery_image_alts;
    return;
  }
  const alts = Array.isArray(data.gallery_image_alts) ? data.gallery_image_alts : [];
  data.gallery_image_alts = data.gallery_images.map((_, index) =>
    typeof alts[index] === "string" ? alts[index].trim().slice(0, MAX_ALT_LENGTH) : ""
  );
};

module.exports = { normalizeGalleryAlts, MAX_ALT_LENGTH };
