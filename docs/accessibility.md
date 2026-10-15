# Accessibility practice

How accessibility is built, checked and what is still manual. The per-component guidance lives in each story's
usage guide (`guide.a11y`).

## Automated, on every change (CI)

- **axe on every story, light and dark** (`pnpm test-storybook`, `a11y: { test: 'error' }`).
- **Keyboard and focus tests** (`Story.test`) for the interactive components.
- **`eslint-plugin-jsx-a11y`** in `pnpm lint`; every exception has a written reason.
- **Logical CSS only** for right-to-left (`check-logical.mjs`), see [`i18n-rtl.md`](i18n-rtl.md).
- **Motion**: reduced motion is global; `check-motion.mjs` keeps every transition on tokens.

## Run on demand

| Command | What it finds |
| --- | --- |
| `pnpm audit:narrow` | Overflow and clipping at 390px (phone) for every story |
| `pnpm audit:rtl` | Overflow when mirrored right-to-left (compare with the left-to-right run) |
| `pnpm audit:forced-colors` | Controls that lose their boundary, and selected states not drawn in the selection colour, in Windows High Contrast |

## Forced colors (Windows High Contrast)

The browser swaps our colours for system colours and drops box-shadows. Anvil draws many strokes, focus rings
and selected fills with an inset ring, a shadow or a background, so a base-layer block in `src/styles/globals.css`
(`@media (forced-colors: active)`) restores them:

- Controls, cards, badges, alerts, progress and slider tracks, OTP slots and skeletons get a 1px outline in
  `ButtonBorder` (an outline, so nothing changes size).
- The focus ring becomes a 2px `Highlight` outline with a 2px offset.
- Selected, on, checked, pressed, current and active-tab states use `Highlight` / `HighlightText`
  (progress and slider fills and switch thumbs too).
- Availability bars become a line whose style says the level: solid, dashed (limited), dotted (sold out).
- Disabled controls use `GrayText`.

To look at it yourself, emulate it: Chrome DevTools → Rendering → Emulate CSS media feature `forced-colors: active`,
or `node scripts/shoot-forced-colors.mjs <outDir> <storyId>...` for screenshots. When you add a component that
draws a stroke or a selected state with a ring, shadow or fill only, add its `data-slot` to that block.

## Manual: screen readers

Automated tools find roughly a third of accessibility problems. Live regions, focus order and the wording of
accessible names need a person with a screen reader. The checklist for that pass is in
[`screen-reader-checklist.md`](screen-reader-checklist.md); record findings in `docs/component-status.md`.
