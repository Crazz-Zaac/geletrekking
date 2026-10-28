# Sidebar availability calendar — October 19, 2026

The supplied “12 months, 2 columns” HTML is a visual reference. Its sample dates, prices, and runtime scripts are not part of the implementation.

The old full-width availability section and the sidebar shortcut are replaced by one two-column calendar inside the pricing card, directly above Download PDF itinerary. The sidebar scrolls normally so the larger card and PDF action remain reachable.

The calendar receives each itinerary's backend availability ranges. Every day within a range, including both endpoints and dates crossing months or years, is marked directly: green ticks for available dates, amber ticks for limited availability, and grey without ticks for fully booked dates. Month panels are static; they no longer open departure lists. Year arrows remain available. Hover descriptions retain exact ranges and backend notes, and each date has an accessible status label. Empty months and years never invent availability.

The public API mapping now retains all three statuses. The existing admin trek form also preserves and edits statuses and notes instead of silently dropping limited/booked departures or resetting them to available. No migration or sample records are required.

Validation:

- 13 date, calendar rendering, backend mapping, and itinerary lookup tests passed.
- Full frontend TypeScript checking passed.
- An isolated browser preview of the actual calendar component loaded the 15 EBC departures from the existing backend and showed their 15 start dates.
- Two-column layout, PDF ordering, and lack of page overflow checked at 320px, 360px, 390px, and 440px.
- Month filtering, exact date ranges, keyboard selection, year navigation, and empty-month behavior passed.
- Controlled API-response tests verified limited/booked status colours and backend notes. No production data was changed.

Screenshots are available locally under `/tmp/geletrekking-sidebar-calendar-review/`. The isolated preview is removed after testing. Production deployment has not been performed.

Follow-up: inline tick marks

- Removed month selection and the expandable departure list.
- Calendar rendering/date checks passed (8 tests), including all 179 unique available dates covered by the 15 EBC ranges, limited/booked statuses, and empty schedules.
- Previous browser screenshots document the earlier circle design; they are not screenshots of the updated ticks.
