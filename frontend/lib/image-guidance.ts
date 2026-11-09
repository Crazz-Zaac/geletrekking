export type ImageGuide = { width: number; height: number; label: string }

/**
 * Sizes for photos shown across the full width of the page. The site serves
 * images up to 1920 px wide, so a larger original adds nothing visible.
 */
export const IMAGE_GUIDES = {
  /** Tall areas: the homepage hero and blog headers. */
  hero: { width: 1920, height: 1080, label: 'Fills the screen' },
  /** Short strips across the top of a page, where only the middle of the photo shows. */
  header: { width: 1920, height: 800, label: 'Only a strip across the middle shows, so keep the subject centred' },
  /** Inside the page column rather than edge to edge. */
  inset: { width: 1600, height: 1000, label: 'Keep the subject centred' },
} as const satisfies Record<string, ImageGuide>

export type ImageGuideName = keyof typeof IMAGE_GUIDES

/** Below this share of the recommended width, upscaling is visible on a large screen. */
const MIN_WIDTH_SHARE = 5 / 6
/** Narrower than this and a full-width area crops away most of the photo. */
const MIN_LANDSCAPE_RATIO = 1.2

export function checkImageSize(width: number, height: number, guide: ImageGuide) {
  const size = `${width} × ${height} px`
  if (width / height < MIN_LANDSCAPE_RATIO) {
    return { good: false, message: `${size}. This photo is tall or square, so most of it will be cropped. Use a landscape photo.` }
  }
  if (width < Math.round(guide.width * MIN_WIDTH_SHARE)) {
    return { good: false, message: `${size}. Too small, so it will look blurry on large screens. Use a photo at least ${guide.width} px wide.` }
  }
  if (width < guide.width) {
    return { good: true, message: `${size}. Good, though ${guide.width} px wide would be sharper on large screens.` }
  }
  return { good: true, message: `${size}. Sharp on all screens.` }
}
