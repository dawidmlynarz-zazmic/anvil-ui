# Animate UI: evaluation and plan

Written 2026-11-06. Should Anvil use [Animate UI](https://animate-ui.com/) to improve its component animations,
and if so, how and at what cost? This document is the investigation and a proposed plan. **No code or
dependency has been added**; every step below needs a decision first (`CLAUDE.md`: ask before adding a
dependency).

Sources: the Animate UI docs (overview, installation), its GitHub repository, and the published npm package
`@animate-ui/react@2.4.2`, whose files I read directly (licence, peer dependencies, primitives, motion tokens).

## 1. What Animate UI is today

- **"Animate the primitives, not the components."** It ships animated drop-in versions of Radix UI, Base UI and
  React Aria primitives. A shadcn component keeps its markup, styles and API; only the primitive import changes,
  e.g. `radix-ui` → `@animate-ui/react/primitives/radix-ui`.
- **Install:** `npm install @animate-ui/react motion`. A CLI (`npx @animate-ui/cli@latest animate all | <name>`,
  with `--dry-run`) finds components through `components.json`, rewrites their primitive imports, and **removes
  the CSS animation classes that Motion replaces**.
- **Engine:** [Motion](https://motion.dev) (the former Framer Motion), `motion@^14` (MIT).
- **Peer dependencies:** React 19, `radix-ui@^1.6` (Anvil has 1.8), Motion 14. Base UI, React Aria, Embla,
  `input-otp`, `@shadcn/react` and Shiki are optional peers. Compatible with Anvil's stack.
- **Radix primitives covered (25):** Accordion, Alert Dialog, Checkbox, Collapsible, Context Menu, Dialog, Drawer,
  Dropdown Menu, Hover Card, Menubar, Navigation Menu, Popover, Preview Link Card, Progress, Radio Group, Select,
  Slider, Switch, Tabs, Toggle, Toggle Group, Tooltip.
- **Own primitives and effects:** text (sliding, counting and scrolling numbers, shimmering, typing, rolling,
  morphing, rotating, highlight, splitting), effects (auto-height, fade, slide, blur, zoom, highlight, magnetic,
  tilt, ripple, particles, shine, image zoom), buttons (ripple, copy, icon), tabs / pagination / sidebar /
  bottom-navigation indicators, avatar group, code block, carousel, animated icons.
- **Behaviour:** springs and short tweens with a strong ease-out, exits faster than entrances, transform and
  opacity only, interruptible, no animation on keyboard navigation, and reduced motion respected in every
  primitive. An `AnimateUIProvider` sets a global `tempo` (a speed multiplier) and the checkbox style.
- **Maturity:** about 4.9k GitHub stars. The current npm package was first published on **18 Oct 2026** and has
  had seven releases since (2.0.0 → 2.4.2). It is moving fast.
- **Licence: MIT + Commons Clause.** Free to use in an application, website or product, including commercially,
  but you may not "sell or redistribute the components themselves in their original form, alone or in a bundle".

## 2. How it fits Anvil's rules

| Anvil rule | Animate UI | Fit |
| --- | --- | --- |
| Motion values come from Figma: 3 durations (120 / 200 / 320ms) and 2 curves (`docs/motion-foundations.md`) | Its own vocabulary: about 13 easings, springs, scale / blur / shift values, and one `tempo` multiplier. Durations can be overridden per component through `transition` props, not mapped globally | ❌ Conflict. Using it as-is brings in values that are not in Figma |
| Motion lives in CSS on Radix `data-state`; `check-motion.mjs` lints every `transition` class | Motion runs in JavaScript through props; the lint cannot see it | 🟡 Needs a new check, or a wrapper that only accepts token-based transitions |
| shadcn is the foundation; behaviour changes are deliberate and logged | Swaps the primitive under each shadcn component (keeps Radix underneath, plus its own state and `AnimatePresence` logic) | 🟡 Acceptable per component, but it is a behaviour change to log each time |
| The CLI rewrites files and strips animation classes | Would remove Anvil's `overlayMotion`, `accordionMotion`, etc. (our token timings) | ❌ Never run `animate all`. Per component, by hand, at most |
| Reduced motion is global (movement becomes a short fade) | Built in, per primitive, through Motion's `ReducedMotionConfig` | ✅ Close. Check that it matches "movement → short fade", not "no animation" |
| Storybook **Motion** toolbar (off) and visual regression need deterministic frames | Springs settle over time; CSS-only switches will not stop them | 🟡 Needs `MotionGlobalConfig.skipAnimations` wired to the toolbar and to tests |
| Ask before adding dependencies | Needs `motion` and `@animate-ui/react` | ⏸ Decision needed |
| Anvil will become a shadcn registry and possibly a package (`docs/roadmap.md`) | Commons Clause forbids redistributing its components "in their original form" | ⚠️ Using it **inside** Anvil components is likely fine; re-publishing its files through an Anvil registry is a question for legal. Depending on the npm package (not copying its source) avoids most of it |

**Net:** a wholesale switch would undo the motion system we already have (tokens from Figma, CSS archetypes,
lint, global reduced motion) and swap Figma's values for the library's. The value is in the places **CSS
cannot do well**.

## 3. Where it would genuinely help

Anvil's overlays, menus, accordions, sheets and toasts already animate well in CSS with Figma timings. Replacing
them buys little. The gaps are things CSS struggles with:

| Opportunity | Anvil today | With Motion / Animate UI | Candidates |
| --- | --- | --- | --- |
| **Sliding indicators** (shared layout) | Tabs underline fades between tabs; Toggle Group has no moving highlight | The underline / pill slides to the selected item | Tabs, Toggle Group, Sidebar active item, Pagination |
| **Animated numbers** | Numbers jump | Sliding or counting digits | Widget Metric Card, Price, Quantity Selector, handoff queue (3 → 2 → 1), Progress values, NPS / Rating results |
| **Auto-height** for content that grows | Streaming text and widgets push the thread in jumps | Height follows content smoothly | Message Row while streaming, Thinking Panel, Widget states (skeleton → content), Showroom folding widgets |
| **List enter / exit and reorder** | Items appear and disappear instantly | Items fade / slide in, the rest move into place | Task Plan steps, Parallel Agents, Tool Call Accordion items, Memory Manager, Slot List, Open Items |
| **Check and switch feel** | Colour change only | Check mark draws; thumb springs | Checkbox, Switch, Check Row, Step Status |
| **Agent text effects** | `TextShimmer`, typing dots, caret (CSS) | Typing, shimmering, rotating status text | Streaming Placeholder, Action Status, Sync Indicator |

Things to **avoid** even though Animate UI offers them: magnetic, tilt, particles, ripple, cursor effects and
press-scale. They clash with Anvil's decisions (no scale on press; instant menu highlights; calm, productive
UI) and add motion without information.

## 4. Options

| | Option | What it means | Pros | Cons |
| --- | --- | --- | --- | --- |
| A | **Adopt Animate UI wholesale** (run the CLI) | Every shadcn component on Animate UI primitives | Fastest visible change | Drops Figma motion tokens and our lint; new vocabulary; fast-moving dependency; licence question for the registry. **Not recommended** |
| B | **Selective Animate UI** | Add `motion` + `@animate-ui/react`; use only the primitives that fill the gaps in §3, each given token-based transitions | Proven implementations; per-component, reversible | Two motion systems side by side; still tied to a young package; a token bridge is needed |
| C | **Motion only, Anvil-owned helpers** | Add `motion` (MIT) alone; build a small `@/lib/motion` layer (sliding indicator, animated number, auto-height, list presence) using Animate UI as a design reference | One dependency, MIT; values stay Figma tokens; we own the code and the API | More build effort; we maintain it |

**Recommendation: start with a short pilot that decides between B and C on evidence,** leaning C. Keep CSS for
everything that already works.

## 5. Plan and effort

Effort assumes the usual workflow (story updates, tests in light and dark, docs). "Day" means one focused working
day with agent assistance and your review.

| Phase | Work | Output | Effort |
| --- | --- | --- | --- |
| **0. Decide** (you) | Approve the pilot and the `motion` dependency; decide whether `@animate-ui/react` may be trialled; ask legal about the Commons Clause if registry publishing is planned | Go / no-go | — |
| **1. Foundations** | Emit the motion tokens to TypeScript too (Style Dictionary: durations in seconds, curves as arrays) so Motion reads Figma values; an `AnvilMotionConfig` provider that maps reduced motion to "short fade" and turns animations off for the Storybook Motion toolbar and for tests (`MotionGlobalConfig.skipAnimations`); extend `check-motion.mjs` to reject Motion `transition` objects that are not built from tokens; update `docs/motion-foundations.md` | Token bridge, provider, lint rule, docs | 1.5–2 days |
| **2. Pilot (3 components)** | Build each twice where useful (Animate UI primitive vs Anvil helper on Motion): **Tabs** (sliding underline), **Widget Metric Card / Price** (animated number), **Thinking Panel or streaming Message Row** (auto-height) | Side-by-side stories; bundle size before and after; a11y, reduced-motion and visual-regression results; a written B vs C decision | 2–3 days |
| **3. Roll out the winner** | Sliding indicators (Toggle Group, Sidebar, Pagination), animated numbers (Quantity Selector, handoff queue, Progress, results), auto-height and list presence (Task Plan, Parallel Agents, Tool Call items, Memory Manager, Slot List, Showroom widgets), check / switch feel | Updated components, stories, baselines, status rows | 4–6 days |
| **4. Figma alignment** | Add any new motion values (for example a spring, if adopted) to Figma first, then pull; record "code ahead of Figma" flags | Figma and tokens in step | 0.5–1 day (+ design time) |
| **Total** | | | **about 8–12 days** for B or C. Option A would be faster to switch on (1–2 days) but is not recommended |

### Pilot success criteria

- Every animation reads Figma tokens; no new literal timings or curves.
- Reduced motion: movement becomes a short fade; height changes are instant; loops stop.
- Motion toolbar off and Vitest / visual regression runs are deterministic (no flakes added).
- Keyboard and focus unchanged; axe passes in light and dark; Firefox / WebKit no worse.
- Bundle growth is measured and acceptable (Motion's docs put a lazy-loaded setup at a few kB to start, and
  the full `motion` component at roughly 30+ kB gzipped; to be measured on Anvil's Storybook build).
- The result looks clearly better to you in the Showroom, not only in isolation.

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| Two motion systems (CSS + JS) drift apart | One token source (Figma → CSS and TS); one lint; JS only where CSS cannot do it |
| `@animate-ui/react` changes quickly (7 releases in under three weeks) | Pin exact versions (repo rule); prefer Option C for anything core |
| Licence (Commons Clause) vs a future Anvil registry | Depend on the npm package rather than copying its source; get a legal answer before Phase 3 if B wins |
| Flaky tests and screenshots from springs | `skipAnimations` in tests and Storybook's Motion off; keep visual baselines on resting states |
| Overuse ("delight" motion that adds no information) | Only the §3 list; every new animation states what it communicates in its story's guide |

## 7. Decisions needed

1. Approve Phase 1 and the pilot, and adding `motion` (exact version).
2. Allow trialling `@animate-ui/react` in the pilot (Option B), or go straight to Option C (Motion only).
3. Whether registry publishing is planned soon enough to ask legal about the Commons Clause now.
