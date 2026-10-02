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
- Storybook 10 (`@storybook/react-vite`) with addons: docs, themes, a11y, designs, vitest,
  pseudo-states. `pnpm test-storybook` runs the stories through Vitest browser mode twice
  (projects `storybook-light` and `storybook-dark`).
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

- Pull `tokens/anvil.tokens.json` from Figma with `scripts/figma/export-tokens.js` via the Figma
  MCP (variables with code syntax, effect styles, text styles). Figma is the source of truth.
- Style Dictionary 5 config (`style-dictionary.config.mjs`) and `pnpm tokens:build` writing to
  `src/styles/tokens/`: `primitives.css`, `colors.css` (`:root` + `.dark`), `dimensions.css`
  (radius from `--radius`, `--space-*` with a `@media (max-width: 767px)` override, z-index,
  motion), `typography.css` (sizes, line heights, weights 400/500/600, tracking in px, mobile
  override), `shell.css` (`[data-shell=…]`), `effects.css` (shadows, elevation, focus ring).
- Names come from the Figma code syntax; rules in `CLAUDE.md` → Tokens.
- `@theme inline` registers every semantic variable as a Tailwind utility.
- Foundations stories (MDX) written by `scripts/build-foundations.mjs` as part of
  `pnpm tokens:build` (generated files, not read at runtime): color swatches with light/dark values and
  contrast ratios, type scale, spacing, radius, elevation.

**Exit gate:** `globals.css` compiles with zero hand edits; a test page re-themes with `.dark`;
foundations render in both themes. **Checkpoint.**

## Step 3 — Reference component: Button

Build Button end to end as the pattern every other component copies: `cva` with variant ×
intent × size × shape, `loading`, states as selectors, focus ring, icon slots, six stories, Figma
link, a11y passing, compared to the Figma screenshot in both themes.

**Exit gate:** the design lead approves Button in Storybook. **Checkpoint** — the pattern is
locked before scaling out.

## Step 4 — Components: every shadcn counterpart first, then the custom ones

Every component follows `CLAUDE.md` → Architecture (shadcn source → Anvil styling, Icon for
icons). One component per branch and PR; **checkpoint after every 3–5 components.**

**Done:** Button, Badge, Label, Field, Input, Textarea, Select, Checkbox, Radio Group, Switch,
Dialog (+ shell header / footer / body / overlay), Sheet, Popover, Dropdown Menu, Tooltip,
Icon (foundation).

### 4a — shadcn counterparts, in priority order

Ordered so each group completes something usable and later groups build on earlier ones.

| # | Group | Components (Figma page) | New dependency |
| --- | --- | --- | --- |
| 1 | Finish the form controls Field exists for | Kbd (Badge · badge/shortcut), Slider (Forms), Input Group (Forms · search), Input OTP (Forms), Command (Command), Combobox (Forms: Popover + Command per the API Contract) | `input-otp`, `cmdk` |
| 2 | Overlays and feedback on the shell | Alert Dialog, Drawer, Toast (restyle Sonner), Alert, Context Menu (Dropdown Menu items) | `vaul` |
| 3 | Surfaces and structure | Card (+ Hover Card example), Tabs, Accordion (+ Collapsible), Separator (restyle), Scroll Area, Toggle / Toggle Group, Button Group (base for Toolbar) | — |
| 4 | Navigation | Breadcrumb, Pagination, Menubar (Figma Menu), Sidebar | — |
| 5 | Data display | Avatar, Skeleton, Progress, Empty (Empty state), Table, Calendar + Date Picker, Carousel, Resizable | `react-day-picker`, `date-fns`, `embla-carousel-react`, `react-resizable-panels` |
| 6 | Agent Builder primitives from shadcn's chat set, where the Figma Core Kit matches | Message, Bubble, Attachment, Marker, Message Scroller (checked against Agent Builder → Core Kit first) | `@shadcn/react` (Message Scroller) |

### 4b — custom components (no shadcn counterpart), built on 4a

| Component (Figma) | Built on |
| --- | --- |
| Status Badge (Badge · status badge) | Badge |
| Choice Card (Forms · choice card) | FieldLabel's choice-card pattern |
| Stepper (Forms · stepper) | Button / Field |
| Toolbar (Toolbar) | Button Group |
| Chip (Chip) | Toggle |
| Link (Link) | shadcn link styles on an anchor (Button `asChild` pattern) |
| Code block (Code block) | Scroll Area + Kbd styles |
| Agent Builder components (Core Kit, Agent Patterns, Surfaces) | 4a + Agent primitives |

**Exit gate:** `pnpm test-storybook` passes with zero a11y errors in light and dark.

## Step 5 — Local quality pass

- Visual check of every story against Figma in both themes and all four shells.
- `pnpm build-storybook` succeeds; the static build opens from `storybook-static/`.
- README with setup and contribution steps.
- **Examples playground** (after the whole design system is built): a separate Storybook
  section with realistic compositions of the components (agent conversations, settings forms,
  dialogs in context). Component stories themselves keep plain copy — see `CLAUDE.md`.

## Later — publish (only when asked)

Not in scope yet. When requested: Cloud Run + Identity-Aware Proxy for an internal Storybook
with shareable links and PR previews; shadcn registry served from the private repo
(`npx shadcn add @anvil/button`); `@zazmic/anvil-tokens` package; Figma Code Connect
(`*.figma.tsx`) published from CI; Figma library and repo tagged v1.0.0 together.
