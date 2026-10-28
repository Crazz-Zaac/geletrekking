# Guide availability fix — October 19, 2026

The Key Preparations record is active and `/api/guides/slug/key-preparations` returns it publicly. Requests from the frontend container's address returned HTTP 429 with the anti-abuse message instead. The guide fetch helper converted that failure to `null`, causing Next.js to serve a false 404.

Changes:

- Only an actual API 404 becomes a missing guide. Rate limits, backend failures, and network failures reach a retryable error screen instead.
- React request memoization shares the guide lookup between metadata and page rendering.
- Public content reads made by the frontend server carry a private `INTERNAL_API_TOKEN`. Both backend protection layers recognize that credential for public GET requests, avoiding aggregate visitor traffic being treated as a single abusive client.
- Public callers without the token, admin endpoints, authentication, form submissions, and write methods retain their existing protections. The token is never included in browser requests.

A matching random token has been configured locally in `backend/.env` and `frontend/.env.local`; it is not committed. Deploy both services with the same private environment value. Do not prefix this variable with `NEXT_PUBLIC_`.

The running backend uses an in-memory risk store. No global unblock or production restart was performed. Deploying/restarting the backend and deploying the frontend applies the permanent fix; a backend restart also clears the existing in-memory false block. The unrelated pending source changes remain intact.

## Itinerary links and legacy IDs

The navigation menu still used `trek.id || trek.slug`, independently of the earlier homepage-card fix. Navigation, cards, footer links, sitemap URLs, and itinerary canonicals now use `getTrekPath`, which consistently prefers the slug.

The reported ID `6a54aaacd5a65be18a3281cd` is the active Pikey Peak Trek record, with slug `pikey-peak-trekking`. The detail route now calls the existing `/api/treks/:identifier` endpoint, which supports either ID or slug, instead of searching a list that silently falls back to unrelated static records on API failures. Valid old ID URLs permanently redirect to their named URL; only a real API 404 displays not found. Rate limits, network errors, and backend failures reach a retry screen.

Regression tests cover the exact reported ID, both lookup forms, the page's redirect, missing records, and transient failures. These additional changes also require frontend deployment and the preceding backend configuration fix to affect the live website.
