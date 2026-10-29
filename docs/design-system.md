# Design system

Bronx Town Hall looks like a careful local paper set in Bronx flag colors:
type-led, ruled, square, calm. These rules keep every page consistent. Check
new UI against them, and against the "slop tells" list at the end, before
opening a PR.

The reference implementation is Home (`src/features/home`).

## Type

- Headings (`h1`, `h2`, `.font-display`): Bricolage Grotesque, tight tracking.
- Everything else: Atkinson Hyperlegible Next. Arabic and Bengali fall back
  to Noto Sans Arabic and Noto Sans Bengali (set in `src/styles.css`).
- Small labels above a name or headline use the `label-caps` utility
  (`HEALTH · 1.2 MI`). It drops letter-spacing for Arabic and Bengali.
- Names in lists are bold body text, not headings.

## Color

| Token                       | Use                                                                          |
| --------------------------- | ---------------------------------------------------------------------------- |
| `foreground` / `background` | Ink on paper. Rules use `foreground` (heavy) or `border`                     |
| `primary` (subway blue)     | Links, the accent word in a title, active tab, kicker text                   |
| `bronx-orange`              | Voice and read-aloud buttons, small highlights. Navy text on it, never white |
| `destructive`               | Crisis and SOS only                                                          |
| `success`                   | "Open now" status                                                            |
| `--cat-*`                   | A category's icon and label color, never a fill behind text                  |

No gradients, no glow, no neon, no purple accents.

## Shape and depth

- Corners are small: the theme caps every `rounded-*` at 6px. Use
  `rounded-md` for buttons, inputs and chips. `rounded-full` is only for
  things that are truly round: avatars, dots, spinners.
- No shadows on content. Elevation (`shadow-lg` and up) is reserved for
  things that float over the page: sheets, menus, the SOS tab.

## Layout

- Sections open with a heavy rule: `<Section ruled>`. The title and its
  action ("See all", underlined) share one line.
- Lists are rows between hairlines (`divide-y divide-border border-b`),
  not boxes. Each row: line icon, `label-caps` line, bold name, one detail
  line. A row is a link; underline the name on hover.
- Use a box (border, no shadow) only when something must be grouped apart
  from the page: a form, a notice, a sponsored placement.
- Phone first: one column, 16px side padding. Laptop: the same content in
  columns, max width `5xl`.

## Icons

- Lucide line icons only. Never emoji as icons or decoration.
- Categories use `CATEGORY_ICONS` from `@/features/resources`, colored with
  the category color.

## Components

- Buttons: `rounded-md`. Primary is solid `primary`; secondary is a 2px
  `foreground` outline that fills on hover. One primary button per view.
- Chips and filters: `Chip` from `@/components/ui/chip` (square corners).
- Inputs: 2px `foreground` outline for the main search; 1px `border`
  elsewhere.
- Empty and error states suggest a next step (`EmptyState`).

## Motion

- Color and underline changes on hover only. No zoom, bounce, floating or
  entrance animations.

## Accessibility (always)

- Tap targets at least 44px. Text contrast AA. Works in all five
  languages, right-to-left Arabic, Simplified View and at 360px width.

## Slop tells to avoid

Gradient or glowing buttons; emoji as icons; heavy shadows; everything in a
card; glassmorphism; pill-shaped everything; decorative blobs or watermarks;
side-border accents on every notice; floating animations; default chart
colors; neon on dark; long helper paragraphs where a label would do.
