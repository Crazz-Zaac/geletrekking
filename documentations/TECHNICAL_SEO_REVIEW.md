# Technical and SEO changes — October 18, 2026

Update: Bundled blog injection has been removed. All blog listings, article pages, homepage highlights, related posts, and sitemap entries now use backend records only. The four articles are preserved as unpublished drafts in `documentations/BLOG_GUIDE_DRAFTS.md`; the guide-related implementation and screenshots below describe the earlier version. No blog records were added to the backend.

## Implementation

- Removed the inherited, site-wide keyword list. The shared metadata builder now supplies page-specific keywords, canonical URLs, and social previews. Added metadata layouts for privacy, terms, and disclaimer pages.
- Added an explicit About social preview using the existing team image, for both Open Graph and Twitter cards.
- Trek cards link directly to each trek's slug, retaining an ID fallback for records without a slug. Existing detail-route redirects continue to handle old links.
- Capped Next.js image output at 1920px and supplied smaller phone breakpoints. Added responsive slot sizes to previously unspecified images, enabled optimization for public photos, and converted the homepage CSS background to a responsive image.
- Added four planning guides, linked through the existing blog helpers, homepage article list, related posts, and sitemap:
  - `/blog/everest-base-camp-cost`
  - `/blog/best-time-everest-base-camp-trek`
  - `/blog/lukla-flight-delays`
  - `/blog/annapurna-base-camp-vs-poon-hill`
- Guides are bundled in `frontend/lib/editorial-guides.ts`. A published CMS post with a matching slug takes precedence. Bundled guides themselves are maintained in source. The cost guide dates its package-price snapshot and links to the current itinerary; the content includes official tourism-board and airline references.
- Blog article text now renders in server HTML and does not wait for JavaScript or an entrance animation to become visible. Comparison tables can scroll within the article on narrow screens.
- Blog hero content uses normal document flow so longer guide titles can increase the section height on phones instead of being clipped.
- Added a cookie banner with accept, reject, and save controls. Optional review widgets, Google Maps, and embedded videos default to off. Preferences last up to 180 days and can be changed from the footer. Withdrawing permission reloads the page to stop already-loaded optional scripts. Essential form security remains available.

## Validation

- Full frontend TypeScript check passed.
- All 15 regression tests passed: contact links, availability dates, metadata, content merging, image configuration, and consent preference parsing.
- Chromium phone emulation at 390 × 844 CSS pixels, DPR 2, passed checks on home, About, the EBC cost guide, Contact, and the EBC availability calendar.
- Browser requests confirmed no optional map/review/video requests before consent or after rejection. The map appeared after acceptance and was removed after withdrawal.
- Browser metadata checks confirmed different home/About keywords and both About preview-image tags.
- The EBC calendar showed all 12 months and the 179 unique days covered by the 15 supplied trip ranges, without horizontal page overflow.
- On a simulated 1.6 Mbps connection with 150 ms latency, the phone selected an 828px hero image (39,118 bytes, about 38.2 KiB) and 750px trek-card images. No selected image exceeded the 1920px cap. These are image-transfer measurements from the development preview, not production Core Web Vitals.
- The main browser run recorded no uncaught page errors.
- All four guides also passed at 360px and 390px with JavaScript disabled: article text remained visible and no page overflow occurred.

Testing used an isolated preview and emulated phone screens, not a physical phone. No production deployment or CMS publication was performed. These source changes become visible after deployment.
