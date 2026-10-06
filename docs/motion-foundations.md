# Motion foundations

How Anvil moves. Motion is built from Tailwind transitions and `tw-animate-css` enter / exit
animations on Radix `data-state`, the same primitives shadcn/ui uses (no Framer Motion). The
values come from Figma (`dimensions` collection), so code never invents a duration or a curve.
Storybook's **Foundations → Motion** page shows the tokens and each kind of transition live.

## 1. Durations and easings

| Token | Value | Utility | Use |
| --- | --- | --- | --- |
| `--duration-fast` | 120ms | `duration-(--duration-fast)` | Hover, pressed and focus colour changes; chevrons; switch thumbs; exits of small overlays |
| `--duration-base` | 200ms | `duration-(--duration-base)` | Small overlays opening (popover, menu, select, tooltip, hover card); expand / collapse; dialogs; sheet and drawer exits |
| `--duration-slow` | 320ms | `duration-(--duration-slow)` | Large surfaces opening (sheet, drawer); the sidebar's width |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-out` | Everything that enters or responds to the user |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | `ease-in-out` | Exits, state changes, loops |
| linear | `linear` | `ease-linear` | Opacity-only fades and continuous loops (shimmer, spinner) |

Rules:

- **Exits are one step shorter than entrances** (slow → base, base → fast) and use
  `ease-in-out`: things leave faster than they arrive.
- There is no dedicated exit curve in Figma; add one there first if `ease-in-out` ever feels
  wrong (decided 2026-10-06).
- `tw-animate-css` enter / exit animations read Tailwind's `duration-*` and `ease-*`; without
  them they fall back to 150ms and the browser's `ease`, so always set both.
- Focus rings appear instantly: focus must never lag.

## 2. Transition archetypes

| Archetype | Enter | Exit | Classes |
| --- | --- | --- | --- |
| **Small overlay** (Popover, Dropdown / Context Menu, Menubar, Select, Combobox, Hover Card, Date Picker) | fade + scale from 95% (shadcn) + 4px nudge from the side it opens on · base · ease-out | fade + scale to 95% · fast · ease-in-out | `overlayMotion` + `overlayNudge` from `@/lib/motion` with shadcn's `animate-in fade-in-0 zoom-in-95` / `animate-out fade-out-0 zoom-out-95` |
| **Tooltip** | fade + scale from 95% · fast · ease-out | fade · fast | `tooltipMotion` + `overlayNudge` |
| **Modal** (Dialog, Alert Dialog, Command) | overlay fade · panel fade + scale from 95% · base · ease-out | reverse · fast · ease-in-out | `modalMotion` (same timing as small overlays; also every scrim) |
| **Edge panel** (Sheet, Drawer) | slide from its edge + overlay fade · slow · ease-out | slide back · base · ease-in-out | Sheet: `panelMotion` + `slide-in-from-{side}` / `slide-out-to-{side}`; Drawer (Vaul): its keyframes with our duration and curve (`!` overrides) |
| **Expand / collapse** (Accordion, Collapsible: Thinking Panel, Tool Call Item / Accordion, Instructions Banner, Rating comment) | height to content · base · ease-out; chevron rotates · fast · ease-out | height to 0 · fast · ease-in-out | `accordionMotion` (Accordion) / `expandMotion` (Collapsible; padding goes on a child, focus rings show through a 6px clip margin) + `chevronMotion` |
| **Toast** | slide from its edge + fade · base · ease-out | fade · fast | Sonner's transitions with our duration and curve; reduced motion keeps only opacity |
| **Floating control** (Message Scroller jump button) | rise + fade · base · ease-out | fade + scale · fast · ease-in-out | `transition-[translate,scale,opacity]` |

### Micro-interactions

| Element | Hover | Pressed | Focus-visible |
| --- | --- | --- | --- |
| Button, Toggle, Chip, Link, menu item, Item, table row | colour / background · fast · ease-out | colour (Figma's pressed fill), no scale | focus ring, instant |
| Input, Textarea, Select / Combobox trigger, Prompt Input | stroke colour · fast · ease-out | — | stroke + focus ring, instant |
| Checkbox, Radio, Switch | background · fast · ease-out | — | focus ring, instant; switch thumb slides · fast · ease-out |
| Tabs | text colour · fast | — | focus ring; underline fades · fast |
| Card (interactive) | shadow · fast · ease-out | — | focus ring |

No scale on press: Figma draws pressed as a colour, and scaling text-heavy controls reads as
jitter.

## 3. Reduced motion

`prefers-reduced-motion: reduce` is honoured globally (`src/styles/globals.css`), so every
component, including new ones, gets it without extra classes:

- **Movement becomes a short fade.** Enter / exit animations keep their opacity but drop
  translation, scale, rotation and blur, and run at `--duration-fast`.
- **Height animations are skipped** (Accordion, Collapsible): content appears at once.
- **Movement transitions stop** where a component moves something (switch thumb, sidebar width,
  jump button, Sheet / Drawer slides): `motion-reduce:transition-none` or the global rule.
- **Loops stop** on their first frame (shimmer, pulse dot, typing dots, caret, waveform,
  Skeleton) — each utility carries its own `@media (prefers-reduced-motion: reduce)`.
- **Spinners keep spinning**: they say “working”, and stopping one hides that.
- **Colour transitions stay**: they are not motion.

For a one-off case use Tailwind's `motion-reduce:` / `motion-safe:` variants. Storybook's
**Motion** toolbar (off) goes further and makes everything instant, for screenshots and
reviews; check real reduced-motion behaviour with the OS setting.
