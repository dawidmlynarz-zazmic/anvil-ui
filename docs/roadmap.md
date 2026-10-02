# Anvil UI — roadmap

Local-first: everything up to Step 5 runs on a laptop with `pnpm storybook`. Publishing comes
last and is not in scope until the design lead asks for it. Each step ends with an exit gate and
a **review checkpoint**: stop, summarize what changed, and wait for approval before continuing.

## Step 1 — Scaffold (local)

- Vite + React + TypeScript (strict) with pnpm.
- Tailwind CSS v4 via `@tailwindcss/vite`; `globals.css` with `@import "tailwindcss"`,
  `@custom-variant dark (&:is(.dark *));`, `@theme inline`, base layer.
- `shadcn init` (`components.json`: aliases `@/components`, `@/components/ui`, `@/lib/utils`;
  CSS variables on). Path alias `@/` in `tsconfig` and `vite.config`.
- Storybook 9+ (`@storybook/react-vite`) with addons: docs, themes, a11y, designs, vitest,
  pseudo-states.
- `.storybook/preview.tsx`: `withThemeByClassName` on `html` (light `""`, dark `"dark"`),
  `shell` toolbar (full screen · side panel · popover · mobile → `data-shell` on a wrapper),
  `motion` toolbar (on · off → `.no-motion`), `TooltipProvider` + Sonner `Toaster`, a11y
  `test: "error"`, backgrounds disabled, sort Foundations → Components → Anvil → Agent.
- `preview-head.html`: Inter (400/500/600), Funnel Sans (600), JetBrains Mono (400).
- ESLint, Prettier, `tsc --noEmit`; the commands listed in `CLAUDE.md`.
- Create `docs/component-status.md`.

**Exit gate:** `pnpm storybook` opens with an "Anvil UI" title and one placeholder story; theme
toggle flips `.dark` on `html`; typecheck and lint pass. **Checkpoint.**

## Step 2 — Tokens

- Requires `tokens/anvil.tokens.json` (DTCG, exported from Figma by the designer). If missing,
  stop and ask.
- Style Dictionary 4 config (`style-dictionary.config.mjs`) and `pnpm tokens:build` writing to
  `src/styles/tokens/`: `primitives.css`, `colors.css` (`:root` + `.dark`), `dimensions.css`
  (radius from `--radius`, `--space-*` with a `@media (max-width: 767px)` override, z-index,
  motion), `typography.css` (sizes, line heights, weights 400/500/600, tracking in px, mobile
  override), `shell.css` (`[data-shell=…]`).
- Names come from the Figma code syntax; rules in `CLAUDE.md` → Tokens.
- `@theme inline` registers every semantic variable as a Tailwind utility.
- Foundations stories (MDX) generated from the JSON: color swatches with light/dark values and
  contrast ratios, type scale, spacing, radius, elevation.

**Exit gate:** `globals.css` compiles with zero hand edits; a test page re-themes with `.dark`;
foundations render in both themes. **Checkpoint.**

## Step 3 — Reference component: Button

Build Button end to end as the pattern every other component copies: `cva` with variant ×
intent × size × shape, `loading`, states as selectors, focus ring, icon slots, six stories, Figma
link, a11y passing, compared to the Figma screenshot in both themes.

**Exit gate:** the design lead approves Button in Storybook. **Checkpoint** — the pattern is
locked before scaling out.

## Step 4 — Top 15, then the rest

Order: Button ✓, Badge, Label, Input (Text field), Textarea, Select, Checkbox, Radio Group,
Switch, Field, Dialog (+ `ShellHeader` / `ShellFooter` / overlay), Sheet, Popover, Dropdown Menu,
Tooltip. Then: Alert, Alert Dialog, Drawer, Tabs, Toast (Sonner), Avatar, Card (+ hover card
example), Command, Combobox, Toggle / Toggle Group, Accordion, Calendar / Date Picker, Slider,
Carousel, Resizable, Menu, Pagination, Progress, Skeleton, Separator, Scroll Area, Table,
Breadcrumbs, Link, Empty state, Sidebar. Then Anvil compositions, then Agent Builder components.

One component per branch; update `docs/component-status.md` each time. **Checkpoint after every
three to five components.**

**Exit gate:** `pnpm test-storybook` passes with zero a11y errors in light and dark.

## Step 5 — Local quality pass

- Visual check of every story against Figma in both themes and all four shells.
- `pnpm build-storybook` succeeds; the static build opens from `storybook-static/`.
- README with setup and contribution steps.

## Later — publish (only when asked)

Not in scope yet. When requested: Cloud Run + Identity-Aware Proxy for an internal Storybook
with shareable links and PR previews; shadcn registry served from the private repo
(`npx shadcn add @anvil/button`); `@zazmic/anvil-tokens` package; Figma Code Connect
(`*.figma.tsx`) published from CI; Figma library and repo tagged v1.0.0 together.
