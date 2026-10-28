# Phase 1: Static interface translation

## Goal
Make the existing language switcher visibly translate the fixed, resident-facing interface in English, Spanish, French, Bengali, and Arabic. Keep all listing names, descriptions, hours, and requirements unchanged in this phase.

## Implementation

1. **Make one complete translation source**
   - Consolidate the current split translation dictionaries behind the existing `t(...)` helper.
   - Add complete five-language keys for navigation, homepage text, category names and headings, filter controls, subcategories, view controls, listing actions, verification text, common status labels, dialogs, and footer links.
   - Preserve language selection between pages and keep Arabic’s document direction set to RTL.

2. **Replace fixed English on shared surfaces**
   - Update the shared header, mobile navigation, footer, language selector, view switcher, filters, verification badge, availability note, directions/actions, print flyer, edit/report dialogs, and recurring card labels to use translated keys.
   - Translate accessible labels, tooltips, empty/loading/error states, and confirmation messages alongside visible labels.

3. **Translate the three required verification surfaces**
   - **Homepage:** headline/supporting copy, search controls, trust/privacy/verification text, category browsing, nearby section, utility links, and standard card actions.
   - **Category page:** title/supporting controls, all category/subcategory pills, filters, list/map/sheet controls, badges, empty state, and suggestion flow.
   - **Listing detail:** verification and call-ahead text, Call Now, directions, share, print, application, edit/report actions, information labels, and shared dialogs.

4. **Cover other public resident-facing shared views**
   - Apply the same keys to search, map, favorites, events, business directory, and other reused listing surfaces so changing language does not leave shared interface controls in English.
   - Keep proper names, street addresses, phone numbers, and user/database-authored content as data rather than translating them.

5. **Keep Phase 2 out of scope**
   - Do not generate, machine-translate, or rewrite the 300+ listing names, descriptions, hours, or requirements.
   - Do not add AI translation or claim that imported listings have human translations.
   - After Phase 1 verification, report the remaining dynamic-content gap and ask which reviewed/disclosed Phase 2 approach to use.

## Verification

- Run the project’s type check.
- In a fresh browser session, select Spanish and verify visible changes on:
  1. `/` — navigation, homepage copy, category labels, trust line, and card actions.
  2. `/category/food` — navigation, filters, subcategory pills, view controls, verification text, and actions.
  3. A listing detail page — navigation, verification/call-ahead copy, Call Now, directions, share, print, edit, and report controls.
- Confirm the selected language persists during navigation and after reload.
- Switch to Arabic and confirm `lang="ar"`, RTL layout direction, and translated shared controls.
- Confirm listing content was not machine-translated in this phase.
