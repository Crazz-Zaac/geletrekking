export type PdfImage = { dataUrl: string; format: 'PNG' | 'JPEG'; width: number; height: number }

type LoadOptions = {
  /** Longest width worth embedding. Must be a size the image service offers. */
  maxWidth?: 256 | 640 | 1200 | 1920
  /** PNG keeps transparency (logos); JPEG keeps file size down (photos, maps). */
  format?: 'PNG' | 'JPEG'
  /** Crop to this width-to-height ratio, keeping the centre. */
  cropRatio?: number
  /** Smoothly enlarge smaller originals to this width, so they don't print blocky. */
  enlargeTo?: number
}

/**
 * The site's security policy lets the browser fetch only from this domain, so
 * photos on the image host have to come through Next's image service.
 */
const sameOriginUrl = (src: string, width: number) =>
  /^https?:/i.test(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=90` : src

/** Fetches an image and redraws it as a PNG or JPEG the PDF library can embed. Null if it can't be loaded. */
export async function loadPdfImage(src: string | undefined, { maxWidth = 1920, format = 'JPEG', cropRatio, enlargeTo }: LoadOptions = {}): Promise<PdfImage | null> {
  if (!src) return null
  try {
    const response = await fetch(sameOriginUrl(src, maxWidth), { cache: 'force-cache' })
    if (!response.ok) return null
    const bitmap = await createImageBitmap(await response.blob())

    let sourceX = 0
    let sourceY = 0
    let sourceWidth = bitmap.width
    let sourceHeight = bitmap.height
    if (cropRatio) {
      if (sourceWidth / sourceHeight > cropRatio) {
        sourceWidth = Math.round(sourceHeight * cropRatio)
        sourceX = Math.round((bitmap.width - sourceWidth) / 2)
      } else {
        sourceHeight = Math.round(sourceWidth / cropRatio)
        sourceY = Math.round((bitmap.height - sourceHeight) / 2)
      }
    }

    const scale = enlargeTo && sourceWidth < enlargeTo ? enlargeTo / sourceWidth : Math.min(1, maxWidth / sourceWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sourceWidth * scale)
    canvas.height = Math.round(sourceHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) return null
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    if (format === 'JPEG') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
    context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    return {
      dataUrl: canvas.toDataURL(format === 'PNG' ? 'image/png' : 'image/jpeg', 0.92),
      format,
      width: canvas.width,
      height: canvas.height,
    }
  } catch {
    return null
  }
}

const OFFICIAL_LOGO_URL = 'https://ik.imagekit.io/geletrekking/Official%20Documents/GeleTrekking_Logo.png?updatedAt=1779696522279'
const BUNDLED_LOGO_PATH = '/geletrekking.png'

/** The logo set in Site settings, then the official file, then the copy shipped with the site. */
export async function loadPdfLogo(logoUrl?: string): Promise<PdfImage> {
  const candidates = [logoUrl && logoUrl !== BUNDLED_LOGO_PATH ? logoUrl : undefined, OFFICIAL_LOGO_URL, BUNDLED_LOGO_PATH]
  for (const candidate of candidates) {
    const logo = await loadPdfImage(candidate, { maxWidth: 640, format: 'PNG' })
    if (logo) return logo
  }
  throw new Error('The logo could not be loaded.')
}
