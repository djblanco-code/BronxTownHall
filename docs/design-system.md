# Design system

Bronx Town Hall is friendly and photo-led: real Bronx photos, soft rounded
corners, clear type and calm lists on plain white, in Bronx flag colors.
These rules keep every page consistent. Check new UI against them, and
against the "slop tells" list at the end, before opening a PR.

The reference implementation is Home (`src/features/home`).

## Type

- Headings (`h1`, `h2`, `.font-display`): Bricolage Grotesque.
- Everything else: Atkinson Hyperlegible Next. Arabic and Bengali fall back
  to Noto Sans Arabic and Noto Sans Bengali (set in `src/styles.css`).
- Small labels above a name (`Health · 1.2 mi`) use the `label-caps`
  utility. Despite the name it is sentence case, semibold, 13px.
- Names in lists are bold body text, not headings.

## Color

| Token                       | Use                                                                       |
| --------------------------- | ------------------------------------------------------------------------- |
| `foreground` / `background` | Navy text on plain white                                                  |
| `border`                    | Hairlines between rows, borders on cards and inputs                       |
| `primary` (subway blue)     | Links, the main button, the active tab, icon tiles for civic rows         |
| `bronx-orange`              | Voice and read-aloud buttons, the accent word on a photo. Navy text on it |
| `destructive`               | Crisis and SOS only                                                       |
| `success`                   | "Open now" status                                                         |
| `--cat-*`                   | A category's icon and label color; a 14% tint of it behind the icon tile  |

No gradients on buttons or panels, no glow, no neon, no purple accents, no
warm "paper" tints. The one gradient allowed is the dark fade over a photo so
white text stays readable.

## Photos

- Real Bronx places, not posed stock people. Sources: CC0, public domain,
  CC BY or CC BY-SA (or our own), recorded in `docs/photo-credits.md`.
- Self-host them in `public/images/bronx/` as WebP at 800 and 1280 px wide;
  never hotlink a photo site (visitors' phones shouldn't contact them).
- Show a small credit on the photo linking to its source.
- Put text on photos only over a dark fade, in white.
- Home's masthead rotates one photo per day
  (`src/features/home/lib/hero-photos.ts`).

## Shape and depth

- Soft corners: `rounded-md` (10px) for buttons and inputs, `rounded-xl` for
  icon tiles, `rounded-2xl`/`rounded-3xl` for photo cards and the search box.
  Chips and quick filters can be `rounded-full`.
- No shadows on content. Floating things (sheets, menus, the SOS tab, the
  search box on a photo) may use `shadow-lg`.

## Layout

- Sections: `<Section ruled>` puts the title and its action ("See all") on
  one line with room above. No heavy rules.
- Lists are rows between hairlines (`divide-y divide-border`). A row: icon on
  a soft tile, a `label-caps` line, a bold name, one detail line. Rows are
  links; underline the name on hover.
- Use a bordered card for something that must stand apart: a form, a notice,
  a sponsored placement.
- Phone first: one column, 16px side padding. Laptop: the same content in
  columns, max width `5xl`.

## Icons

- Lucide line icons only. Never emoji as icons or decoration.
- Categories use `CATEGORY_ICONS` from `@/features/resources`, in the
  category color on a tint of it.

## Components

- Buttons: primary is solid `primary`; secondary is the `outline` variant (1px
  `border`, white, gray on hover). One primary button per view.
- Chips and filters: `Chip` from `@/components/ui/chip`.
- Empty and error states suggest a next step (`EmptyState`).

## Motion

- Color and underline changes on hover only. No zoom, bounce, floating or
  entrance animations.

## Accessibility (always)

- Tap targets at least 44px. Text contrast AA, including text on photos.
  Works in all five languages, right-to-left Arabic, Simplified View and at
  360px width.

## Slop tells to avoid

Gradient or glowing buttons; emoji as icons; heavy shadows; everything in a
card; glassmorphism; decorative blobs or watermarks; side-border accents on
every notice; floating animations; default chart colors; neon on dark;
stock photos of posed people; long helper paragraphs where a label would do.
