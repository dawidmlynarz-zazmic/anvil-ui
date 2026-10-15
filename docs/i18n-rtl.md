# Internationalisation and right-to-left

What the system guarantees today, and how to keep it.

## Rules

- **Strings are props.** Components never hard-code user-facing words they can avoid; the caller translates. Where a
  component writes a sentence itself (Quantity Selector's running total) it takes a function (`summary`) so plurals
  follow your language.
- **Formatting follows the locale.** Numbers, money, months, weekdays and day names go through `Intl` with the
  locale from `useLocale()` (`@/lib/locale`): a `LocaleProvider`, or the document's `lang` when there is none.
  Components that format accept a `locale` override (Quantity Selector). Calendar, Availability Calendar and the
  weekday and month names are locale-aware.
- **Logical CSS only.** `ms-` / `me-` / `ps-` / `pe-` / `start-` / `end-` / `text-start` / `text-end` / `rounded-s` /
  `rounded-e` / `border-s` / `border-e`, never `ml-` / `pr-` / `left-` / `text-left` and friends. `pnpm lint` runs
  `scripts/check-logical.mjs` and fails on the physical ones. Centering with `left-1/2` plus a translate, and Radix
  `data-[side=left]`, are physical on purpose.
- **Directional glyphs mirror.** `Icon` flips chevrons, arrows, the reply corner arrow and side-panel glyphs under
  `dir="rtl"` (`rtl:-scale-x-100`). Symmetric or physical glyphs (a clock, a map pin) do not. Add a glyph to the
  `MIRRORED` set in `ui/icon.tsx` when you use a new directional one.
- **Language and direction live on `<html>`**, like a real page (`lang`, `dir`). Apps set them; `LocaleProvider`
  derives the direction from the locale (`ar`, `he`, `fa`, `ur`… are right-to-left).
- **Physical by nature:** map pins and the map's own controls are positioned in map space and stay physical.

## Checking it

- **Storybook:** the **Locale** toolbar switches English, German (long words), Japanese, Arabic and Hebrew. It sets
  `lang`, `dir` and the provider, so every story can be viewed mirrored.
- **`pnpm audit:rtl`:** opens every story right-to-left at 1000px and lists overflow (use `pnpm audit:narrow` for
  phone widths). Compare against `pnpm audit:narrow "" 1000` (left to right): only differences matter. On
  2026-10-15 the only right-to-left-specific results were the Launcher's decorative ping ring and the collapsed
  Message Actions fold.
- **Tests:** `locale.test.tsx` (direction, currency, `useLocale`), the Quantity Selector German story and the
  Availability Calendar Arabic story.

## Not covered yet

- Translated copy in stories: the stories are English; only formatting and layout change with the toolbar.
- date-fns locale objects for react-day-picker's own labels beyond month, weekday and caption (screen-reader
  labels of the picker buttons are still English from the library).
- Pseudo-localisation (expanded accented text) to test text growth; the German option approximates it.
- Bidirectional text inside one string (an English product name in Arabic copy): use `<bdi>` around user content.
