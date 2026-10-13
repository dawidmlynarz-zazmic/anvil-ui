# Agent Patterns — parts audit (step 5)

Figma page **Agent Patterns** (10769:15815), section **Parts** (10843:4583). Every pattern in the
groups after this (Tasks, Evidence & decisions, Catalog & scheduling, Checkout & orders, Trust &
handoff) is drawn from these parts, so we decide them once, here, before building any group
(CLAUDE.md step 0: reuse first, no duplicates). Audit date 2026-10-13.

Rule applied: **extend an existing component with a variant or prop before adding a new one**; add a
molecule only when no existing component carries the meaning.

## Decisions

| Part (Figma node) | What Figma draws | Existing coverage | Decision |
| --- | --- | --- | --- |
| icon tile (10843:4240) | tone × size × shape tile | `IconTile` | Done. |
| card header / footer (10843:4461 · :4502) | card header and footer parts | Shell Header / Footer (`variant` card) | Done; Figma duplicate, align Figma. |
| shortcut hint (10877:6041) | keys + label | `ShortcutHint` (#166) | Done. |
| list item (10877:5765) | leading tile · avatar · none, title + subtitle, trailing value + meta; hover · focus · selected · disabled | `Item` (ItemMedia, Content, Actions; variants default · outline · muted) | **Extend Item**: `selected` state (`data-[selected=true]`, `aria-selected` / `aria-current` by use) and disabled look. Trailing value + meta = a Value Stack in `ItemActions`. No new component. |
| person (10855:5513) | avatar + name + optional role, sm · default | `Avatar` + `Item` | **Compose, no new component**: `Item` with an Avatar `ItemMedia`; add a padding-free `variant="plain"` to Item so it can sit inline. |
| inline note (10847:4951) | message on a tint: tone × shape inset · full-bleed · rule | `Alert` (tone, `size` xs · sm) | **Extend Alert** with `shape` inset (default) · full-bleed (no radius or side stroke) · rule (2px start rule). No new component. |
| meta item (10847:5032) | small icon + short label, xs · sm · default | `Marker` (muted xs line with 12px icon) | **Extend Marker**: `variant="inline"` (not full-width) and `size` xs · sm · default. No new component. |
| stat tile (10847:5117) | label + value on a muted tile, emphasis default · positive · negative | none | **Value Stack `variant="tile"`** (see next row); `emphasis` on the stack. No separate component. |
| value stack (10877:5984) | label + value stacked; align start · end, order, size sm · default · lg | none | **New molecule `ValueStack`** (`align`, `order`, `size`, `emphasis`, `variant` default · tile). |
| key value row (10847:4910) | key + value on one line: spread · aligned, emphasis default · strong | none (Table / Item are not the semantics) | **New molecule `KeyValueList` + `KeyValueRow`** (a real `<dl>`; `layout` spread · aligned, `emphasis`). |
| check row (10847:5075) | included · excluded · fee · pending line | none (Step Status Icon is running · done · failed) | **New molecule `CheckRow`** (`status`; glyph + text, never colour alone). |
| price (10855:5558) | price, optional was-price and discount, sm · default · lg, sale | `Badge` for the discount | **New molecule `Price`** (`value`, `was`, `discount`, `size`, `emphasis`) using Badge for the discount. |
| rating (10855:5609) | stars: compact (1 star + score + count) · stars (5) | Core Kit `Rating` is a *satisfaction check* (different) | **New atom `RatingDisplay`** (Figma calls it “rating display”; `Rating` is the satisfaction check). |
| step (10851:5335) | dots with connectors or bars, label + date; done · current · warning · failed · upcoming | `Stepper` is listed (catalog, roadmap) but **not built** | **Build `ProgressSteps` + `ProgressStep`** (`variant` dots · bars; `status`, `label`, `meta`), used by Progress Timeline and Status Tracker. Figma's own description says it is *not* the numeric Forms stepper, which stays the separate `Stepper` (a quantity control, listed in the catalog, not built). |
| timeline item (10851:5493) | time, marker (dot or tile), title, detail, actor, connector | `Marker` is an event line, not a timeline | **New molecule `Timeline` + `TimelineItem`** (`marker` dot · tile via IconTile, `tone`, `time`, `actor`). |
| legend item (10855:5814) | swatch (bar · square · dot · custom) + label | none | **New molecule `LegendItem`** (`swatch`, `color`). Tiny, but it has no existing home and charts, maps and grids all need it. |

Net result (updated 2026-10-13 as parts were built): **3 extensions** (Item, Alert, Marker) and **8 new parts** (ValueStack, KeyValueRow,
CheckRow, Price, RatingDisplay, ProgressSteps, Timeline, LegendItem). Four of the fifteen parts need
nothing new, because the system already carries them.

## Proposed PRs

1. **Extensions** — Alert `shape`, Item `selected` + `variant="plain"`, Marker `inline` + `size`.
   (Design System stories updated; no new components.)
2. **Parts A** — ValueStack (+ tile), KeyValueRow, CheckRow, Price.
3. **Parts B** — ProgressSteps, Timeline, RatingDisplay, LegendItem.

Each new part is a Design System molecule (`Design System/Molecules/<Name>`, tag `molecule`), with a
Default, a Variants grid, tests and a docs page, like the existing molecules.

## What the groups reuse (checked against the Figma page)

| Group | Patterns | Built from |
| --- | --- | --- |
| Tasks (10) | task brief, question set, task settings, run limits, task plan, change review, progress timeline, activity feed, parallel agents, task summary | Card + Shell parts, Item, Badge, Alert (note), Stepper, Timeline, Progress, Switch Field / Select (settings), Clarifying Question (question set), Tool Log Line / Step Status (activity, parallel agents), KeyValueRow (summary) |
| Evidence & decisions (5) | insight card, open items, conflict resolver, criteria matrix, deliverable outline | Card, Badge, Citation Confidence, Item, Choice Card (resolver), Table (matrix) + CheckRow, Alert note |
| Catalog & scheduling (10 + 1) | offer card, offer carousel, item detail, comparison table, location list, map view, media gallery, date picker (availability), slot list, quantity selector (+ media placeholder) | Card (interactive), Carousel, Item, Table, Calendar (availability states as variants), Toggle / Item (slots), Input Group / Button (quantity), Skeleton / aspect-ratio (media placeholder is a duplicate: not built), Price, StarRating, LegendItem |
| Checkout & orders (5) | order summary, extras, checkout handoff, confirmation, status tracker | Card, KeyValueRow, Price, Alert, Item, Stepper, ActionStatus |
| Trust & handoff (4) | preference capture, identity check, human handoff, response time | Card, Input OTP, Alert, Item + Person, Badge, Timeline |

## Flags for the design lead

- **Rating**: Core Kit `rating` (satisfaction check) and Patterns `parts / rating` (a display; Figma's own description already calls it “rating display”). Code uses `Rating` and `RatingDisplay`; rename the Figma component frame to match.
- **Duplicates in Figma**: `parts / card header` / `card footer` (= Shell Header / Footer card), `palette item` (= Command item), `media placeholder` (= Skeleton / a placeholder box). Align Figma instead of rebuilding.
- **Date picker pattern** (availability available · limited · unavailable · none) is the Calendar with a per-day state, not a second date picker: implement as Calendar day variants.
- **Stepper**: resolved. Patterns `parts / step` is a progress stepper (code `ProgressSteps`); the Forms `stepper` is the numeric control and is still to be built (it is the base of the quantity selector).
