# Remove in-app transit estimates and standardize directions

## Goal

Make native maps the only transit experience. The app will no longer show or calculate nearby stops, subway or bus lines, transit proximity, or walk-time estimates.

## User-facing changes

- Remove the **Nearby Transit** section from every resource detail page.
- Remove stop names, subway-line badges, bus routes, and walk-time-to-stop badges from category lists, search results, spreadsheet views, map popups, favorites, guided-help results, and shared packs.
- Remove the global map’s **Near subway** and **Near bus** filters and its transit-distance legend.
- Remove estimated “minutes walk” text from homepage listing cards. Keep the existing general distance in miles where available; this is separate from transit-stop proximity. Listings with non-specific addresses continue to show **Location varies — check details** and no directions action.
- Add a consistent **Get Directions** action wherever a listing with a specific address appears, including detail pages, homepage cards, category/search/favorites/help/pack list cards, spreadsheet actions, global-map list items, and map popups.

## Native maps behavior

- Add one shared, reusable directions-link helper/component so every surface behaves the same.
- On Apple devices, open Apple Maps with the listing address as the destination and transit requested (`dirflg=r`).
- On Android and other devices, open Google Maps with the address as the destination and `travelmode=transit`.
- Keep device detection browser-only and safe during server rendering; provide an accessible label and external-link behavior.
- Preserve existing directions analytics where they already exist and use the same tracking event on newly added actions.

## Calculation and data cleanup

- Stop calling Places nearby-search for subway and bus stops when geocoding listings.
- Remove the in-app route-summary calculation for transit, walking, and driving times.
- Simplify location data to the coordinates and formatted address needed for map pins; existing cached transit fields may remain in storage but will no longer be read, refreshed, or displayed.
- Remove the now-unused transit display components and related stop-normalization, line-color, and walking-time code while retaining category map-pin styling and geocoding.

## Content cleanup

- Update privacy, FAQ, demo-tour, and presentation copy that currently promises nearby transit, transit estimates, or walk-time cards.
- Keep legitimate resource content about transit programs such as Fair Fares; only proximity and routing estimates are removed.

## Verification

- Search the full codebase to confirm there are no remaining user-facing named stops, bus/subway proximity, walk-time estimates, Nearby Transit labels, or route-summary calls.
- Check representative detail, category list, search, favorites/help pack, spreadsheet, and map views on desktop and mobile-sized screens.
- Confirm Apple-device links use Apple Maps transit URLs, other devices use Google Maps transit URLs, and non-specific addresses never receive directions links or pins.
- Run the focused type checks/tests after implementation.
