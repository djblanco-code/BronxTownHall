# Repair and complete the event imports

## Database corrections
- Add an optional event end-date field so fixed date ranges can remain visible through their actual final day.
- Correct the five existing dated/ranged listings, retaining times in Hours and using clean date values.
- Keep the five existing recurring listings as ongoing, undated resource listings.
- Hold Tour de Bronx 2026 from public display until its real date is confirmed.
- Import all 29 supplemental rows: 23 dated/ranged events and six recurring resources. No supplied date is before September 20, 2026; events occurring today remain visible today.
- Restore the three recurring rows present in the original curated list but absent from both CSV batches: Plant Sale at Wave Hill, Tune-Up Tuesdays, and Yoga in the Garden.
- Add the two unconfirmed original rows to the admin review queue without publishing: Bronx River Celebration and Demystifying Medicare.
- Delete the ten old calendar rows confirmed as sample seed data in the original table-creation migration.

## Display fixes
- Make the Events page and homepage event section read active dated events from the unified resource database, while still including future approved community submissions.
- Treat an event as current through its end date when a range exists, and show the range on its card.
- Keep recurring resources undated and available through the normal Events category listing.
- Hide expired dated events from both Events and category browsing while retaining them in the database for audit/history.

## Verification and reporting
- Confirm there are no active dated imports with missing or malformed dates.
- Confirm current/upcoming cards render on the Events page and expired rows do not.
- Report live dated events, live recurring listings, held items, and the corrected original-list total.
