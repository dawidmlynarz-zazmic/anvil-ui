# Anvil UI Kit — system audit (next phase)

Phases 1–3 of the next-phase plan: what the kit holds today, what it should hold, and where each
part belongs. Everything below was checked against the code (import graph of `src/components`),
the stories and the Figma file on 2026-10-06. Later PRs implement it; this file is the record of
the decisions.

## 1. The rule for each level

The old split (UI Components / Agent Primitives / Agent Blocks × element / composite / feature)
mixed *where a component came from* with *how it is built*. The new taxonomy only answers
**what it is and how reusable it is**:

| Level | What belongs here | Content in stories |
| --- | --- | --- |
| **Atoms** | One element. Uses no other Anvil component except Icon. Context-agnostic. | Generic: Title, Label, Value |
| **Molecules** | A few atoms with one job (a field, a scale, a menu, a status strip). | Realistic agent UI copy |
| **Organisms** | A complete, reusable section with its own structure or interaction (overlays, navigation, data display), not tied to one agent job. | Realistic agent UI copy |
| **Agent Builder** | A ready-to-use agent experience: composes the levels above into one job (a citation drawer, an approval, a survey). Used as-is in an agent UI. Never a variant of the primitive it is built on. | Production-like agent copy |

A **context** badge (Messages, Input, Agent Status, Sources, Memory, Actions, Widgets & Artifacts,
Feedback) says *where in an agent UI* a component is used. It replaces the old tier badge and is
only set where it helps; Button has none, Citation Chip has Sources.

## 2. Inventory

Columns: **Level** = new Atomic level · **Kind** = base / composite / ready-to-use · **Inside** =
the components that use it (from the import graph) · **shadcn** = has a shadcn counterpart ·
**Agentic** = exists for agent UIs · **Verdict** = keep / simplify / merge / remove / rename.
Columns 9–13 of the brief (removable, mergeable, variant instead, unnecessary subcomponents,
deprecated feature) are the verdict and its note.

### UI components (shadcn and Anvil-only)

| Component | Today | Level | Kind | Inside | shadcn | Agentic | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Accordion | UI · composite | Molecule | composite | — | ✓ | | keep |
| Alert | UI · composite | Molecule | composite | Approval Card, (Action Status) | ✓ | | keep; Action Status builds on it |
| Alert Dialog | UI · feature | Organism | composite | — | ✓ | | keep separate from Dialog (§4) |
| Avatar | UI · element | Atom | base | Message Row | ✓ | | keep |
| Badge | UI · element | Atom | base | 9 agent components, Toolbar | ✓ | | keep; Phase 9 adds colours × solid · subtle · outline × shape |
| Breadcrumb | UI · composite | Molecule | composite | — | ✓ | | keep |
| Button (+ icon button) | UI · element | Atom | base | 30 components | ✓ | | keep; the icon button is Button `size="icon*"` |
| Button Group | UI · composite | Molecule | composite | — | ✓ | | keep |
| Calendar | UI · feature | Molecule | composite | Date Picker | ✓ | | keep; Phase 9 adds the range story |
| Card | UI · composite | Molecule | composite | 10 agent components | ✓ | | keep |
| Carousel | UI · composite | Organism | composite | — | ✓ | | keep; demo slides become Cards |
| Checkbox | UI · element | Atom | base | Survey | ✓ | | keep |
| Chip | UI · element (Anvil) | Atom | base | Quick Reply, (Citation Chip) | | | keep |
| Collapsible | — (no story) | — | behavior | Thinking Panel, Tool Call Item / Accordion, Instructions Banner | ✓ | | keep as an internal behavior part; no story (nothing to see) |
| Combobox | UI · composite | Molecule | composite | — | ✓ | | keep |
| Command | UI · feature | Organism | composite | Combobox | ✓ | | keep |
| Context Menu | UI · composite | Molecule | composite | — | ✓ | | keep (reuses Dropdown Menu items) |
| Date Picker | UI · composite | Molecule | composite | — | ✓ | | keep; Phase 9 adds range |
| Dialog | UI · feature | Organism | composite | Command | ✓ | | keep (§4) |
| Drawer | UI · feature | Organism | composite | — | ✓ | | keep (§4) |
| Dropdown Menu | UI · composite | Molecule | composite | Message Actions, Prompt Input, Artifact Panel | ✓ | | keep |
| Empty | UI · composite | Molecule | composite | Image Generation Card, Survey, Widget Media, Widget Table | ✓ | | **rename → Empty State** |
| Field | UI · composite | Molecule | composite | Input, Select, Textarea, Survey | ✓ | | keep |
| Hover Card | UI · composite | Molecule | composite | Citation Hovercard | ✓ | | keep |
| Icon | Foundations | Foundation | base | everything | | | keep (Foundations) |
| Icon Tile | UI · element (Anvil) | Atom | base | 11 agent components | | | keep |
| Input | UI · element | Atom | base | Input Group, Sidebar | ✓ | | keep |
| Input Group | UI · composite | Molecule | composite | Prompt Input, Citation Drawer, Memory Manager | ✓ | | keep |
| Input OTP | UI · composite | Molecule | composite | — | ✓ | | keep |
| Item | UI · composite | Molecule | composite | Feedback Reason, Instructions Banner, Memory Manager, Widget Media | ✓ | | keep; more rows build on it (Citation Source Item) |
| Kbd | UI · element | Atom | base | — | ✓ | | keep |
| Label | UI · element | Atom | base | Field, Survey | ✓ | | keep; Phase 9 aligns sizing and audits usage |
| Link | UI · element (Anvil) | Atom | base | — | | | keep |
| Menubar | UI · feature | Organism | composite | — | ✓ | | keep |
| Pagination | UI · composite | Molecule | composite | Widget Table | ✓ | | keep |
| Popover | UI · composite | Molecule | composite | Combobox, Date Picker, Memory In Use | ✓ | | keep |
| Progress | UI · element | Atom | base | Action Status, File Output Card, Survey | ✓ | | keep |
| Radio Group | UI · element | Atom | base | Survey | ✓ | | keep |
| Resizable | UI · element | Molecule | composite | — | ✓ | | keep (panels + handle) |
| Scroll Area | UI · element | Atom | base | — | ✓ | | keep |
| Select | UI · composite | Molecule | composite | — | ✓ | | keep |
| Separator | UI · element | Atom | base | Button Group, Field, Item, Sidebar | ✓ | | keep |
| Sheet | UI · feature | Organism | composite | Citation Drawer, Sidebar | ✓ | | keep (§4) |
| Shell (header / footer / body) | UI · composite (Anvil) | Molecule | composite | 15 components | | | keep; the shared overlay and card frame |
| Sidebar | UI · feature | Organism | composite | — | ✓ | | keep |
| Skeleton | UI · element | Atom | base | 5 components | ✓ | | keep |
| Slider | UI · element | Atom | base | — | ✓ | | keep |
| Sparkline | UI · element (Anvil) | Atom | base | Widget Metric Card | | | keep |
| Spinner | UI · element | Atom | base | — | ✓ | | keep |
| Switch | UI · element | Atom | base | Memory Manager | ✓ | | keep |
| Table | UI · feature | Organism | composite | Widget Table | ✓ | | keep |
| Tabs | UI · composite | Molecule | composite | Artifact Panel | ✓ | | keep |
| Textarea | UI · element | Atom | base | 5 components | ✓ | | keep |
| Toast | UI · composite | Molecule | composite | — | ✓ (Sonner) | | keep |
| Toggle | UI · element | Atom | base | Toggle Group, Toolbar | ✓ | | keep |
| Toggle Group | UI · composite | Molecule | composite | Rating Scale, Image Generation Card | ✓ | | keep |
| Toolbar | UI · composite (Anvil) | Organism | composite | Message Actions | | | keep |
| Tooltip | UI · composite | Molecule | composite | Message Actions, Sidebar | ✓ | | keep |

### Chat parts (shadcn chat set)

| Component | Today | Level | Kind | Inside | shadcn | Agentic | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bubble | Agent Primitives · element | Atom (Messages) | base | Message Row | ✓ | ✓ | **rename → Message Bubble; remove reactions** (`BubbleReactions` has no user) |
| Message | Agent Primitives · composite | Molecule (Messages) | composite | Message Row | ✓ | ✓ | keep |
| Marker | Agent Primitives · composite | Atom (Messages) | base | Message Row | ✓ | ✓ | keep (icon + text only: an atom) |
| Message Scroller | Agent Primitives · composite | Organism (Messages) | composite | — | ✓ | ✓ | keep |
| Attachment | Agent Primitives · composite | Molecule (Input) | composite | File Output Card | ✓ | ✓ | keep |

### Agent components

| Component | Today | Level | Kind | Inside | Agentic | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Pulse Dot | Primitives · element | Atom (Agent Status) | base | Action Status, Message Row, Step Status Icon, Tool Call Accordion | ✓ | keep |
| Text Shimmer | Primitives · element | Atom (Agent Status) | base | Streaming Placeholder, Tool Log Line | ✓ | keep |
| Step Status Icon | Primitives · element | Atom (Agent Status) | base | Thinking Panel, Tool Call Item, Tool Log Line | ✓ | keep |
| Typing Indicator | Primitives · element | — | base | — | ✓ | **merge into Streaming Placeholder** (`variant` dots) — same job: hold the reply's place |
| Voice Waveform | Primitives · element | Atom (Input) | base | Prompt Input, Widget Media, Live Voice Session | ✓ | keep (still used after Live Voice Session goes) |
| Citation Chip | Primitives · element | Atom (Sources) | base | Citation Hovercard, Source Card, … | ✓ | keep (§3) |
| Mic Button | Primitives · element | — | base | Prompt Input | ✓ | **remove**; Prompt Input uses Button `size="icon-sm"` + Mic icon, `aria-pressed` while listening |
| Quick Reply (+ Filter, Group) | Primitives · element | Molecule (Messages) | composite | Feedback Reason | ✓ | keep; text left-aligned (Phase 9) |
| Rating Scale | inside Rating | Molecule (Feedback) | composite | Rating, NPS | ✓ | **split into its own file and story** — it is the reusable part |
| Message Actions | Primitives · composite | Molecule (Messages) | composite | Artifact Panel, Image Generation Card | ✓ | keep |
| Message Edit | Primitives · composite | Molecule (Messages) | composite | — | ✓ | keep (Textarea + Buttons; branch navigation) |
| Action Status | Primitives · composite | Molecule (Actions) | composite | Approval Card, Connector Card | ✓ | keep (§3) |
| Citation Source Item | Primitives · composite | Molecule (Sources) | composite | Citation Drawer | ✓ | keep (§3) |
| Tool Log Line | Primitives · composite | Molecule (Agent Status) | composite | — | ✓ | keep (inline, not expandable — different job from Tool Call Item) |
| Memory Chip | Primitives · composite | Agent Builder (Memory) | ready-to-use | — | ✓ | **merged with Memory In Use → Memory Notice** |
| Memory In Use | Primitives · composite | Agent Builder (Memory) | ready-to-use | — | ✓ | **merged → Memory Notice** (`status` used · not used · saved · updated · forgotten) |
| Drop Overlay | Primitives · composite | Agent Builder (Input) | ready-to-use | — | ✓ | simplify: build on Empty State |
| Streaming Placeholder | Primitives · composite | Agent Builder (Agent Status) | ready-to-use | — | ✓ | keep; absorbs Typing Indicator |
| Content Blocks | Primitives · element | Organism (Messages) | composite | — | ✓ | keep (styles rendered markdown) |
| Thinking Panel | Primitives · composite | Agent Builder (Agent Status) | ready-to-use | — | ✓ | simplify API: `title` / `duration` props instead of span subcomponents |
| Tool Call Item | Primitives · composite | Agent Builder (Agent Status) | ready-to-use | (Tool Call Accordion content) | ✓ | simplify API: `name` / `summary` / `duration` props |
| Tool Call Accordion | Blocks · feature | Agent Builder (Agent Status) | ready-to-use | — | ✓ | simplify API: `title` / `summary` / `duration` props |
| Message Row | Blocks · feature | Agent Builder (Messages) | ready-to-use | — | ✓ | keep |
| Prompt Input | Blocks · feature | Agent Builder (Input) | ready-to-use | — | ✓ | keep; loses Mic Button |
| Clarifying Question | Blocks · feature | Agent Builder (Input) | ready-to-use | — | ✓ | keep; Phase 9 adds the 3-step flow + submitted chat state |
| Live Voice Session | Blocks · feature | — | ready-to-use | — | ✓ | **remove** (feature dropped) |
| Approval Card | Blocks · feature | Agent Builder (Actions) | ready-to-use | — | ✓ | keep |
| Connector Card | Blocks · feature | Agent Builder (Actions) | ready-to-use | — | ✓ | keep |
| Instructions Banner | Primitives · composite | Agent Builder (Memory) | ready-to-use | — | ✓ | keep |
| Memory Manager | Blocks · feature | Agent Builder (Memory) | ready-to-use | — | ✓ | keep |
| Citation Hovercard | Primitives · composite | Agent Builder (Sources) | ready-to-use | — | ✓ | keep (a Hover Card implementation, not a Hover Card variant) |
| Citation Drawer | Blocks · feature | Agent Builder (Sources) | ready-to-use | — | ✓ | simplify API: `status` loading · empty instead of Loading / Empty subcomponents |
| Source Card | Primitives · composite | Agent Builder (Sources) | ready-to-use | — | ✓ | simplify: build on Card |
| File Output Card | Primitives · composite | Agent Builder (Widgets & Artifacts) | ready-to-use | — | ✓ | keep |
| Widget Metric Card | Primitives · composite | Agent Builder (Widgets & Artifacts) | ready-to-use | — | ✓ | keep |
| Widget Media | Primitives · composite | Agent Builder (Widgets & Artifacts) | ready-to-use | — | ✓ | keep |
| Widget Table | Blocks · feature | Agent Builder (Widgets & Artifacts) | ready-to-use | — | ✓ | keep |
| Image Generation Card | Blocks · feature | Agent Builder (Widgets & Artifacts) | ready-to-use | — | ✓ | keep |
| Artifact Panel | Blocks · feature | Agent Builder (Widgets & Artifacts) | ready-to-use | — | ✓ | keep |
| Rating | Primitives · composite | Agent Builder (Feedback) | ready-to-use | — | ✓ | keep; Phase 9 adds the comment flow |
| Feedback Reason | Blocks · feature | Agent Builder (Feedback) | ready-to-use | — | ✓ | keep |
| NPS | Blocks · feature | Agent Builder (Feedback) | ready-to-use | — | ✓ | keep |
| Survey | Blocks · feature | Agent Builder (Feedback) | ready-to-use | — | ✓ | keep |
| Poll | Blocks · feature | Agent Builder (Feedback) | ready-to-use | — | ✓ | keep |

Internal helpers (no story, not public): Citation Confidence (Citation Chip, Hovercard, Source
Item), menu styles (Dropdown Menu, Context Menu, Menubar).

## 3. Components that can be replaced (recommendations)

- **Live Voice Session → remove** (the feature is dropped). Its own parts go with it; Voice
  Waveform stays (Prompt Input, Widget Media).
- **Mic Button → remove; use Button `size="icon-sm"` with the Mic icon in context.** Prompt
  Input renders it, pressed (`aria-pressed`) while listening. The listening rings, processing and
  error looks go: the composer shows listening with the waveform already.
- **Typing Indicator → merge into Streaming Placeholder** as `variant="dots"`. Both hold the
  assistant's place before the first token; one component, two looks.
- **Memory Chip + Memory In Use → one Memory Notice.** Both are the inline memory line under an
  answer; `status` used · not used · saved · updated · forgotten, `details` opens the popover,
  `action` is the button.
- **Drop Overlay → keep, but compose Empty State** (dashed, tinted) instead of drawing its own
  column.
- **Source Card → compose Card** (done).
- **Action Status, Citation Chip, Citation Source Item → keep as they are** (decided while
  implementing): Action Status is a strip at the bottom of a card (no radius, top border only, a
  pulse dot instead of an icon, its own status tints), so on Alert it would be more overrides than
  code; Citation Chip is a 16px inline marker, a size Chip doesn't have; Citation Source Item is a
  `<button>` / `<a>` row and Item's parts are `<div>`s, which can't sit inside a button. All three
  already compose the parts that exist (Pulse Dot, Progress, Button, Citation Confidence on Badge).
- **Bubble reactions → remove** (no user anywhere); Bubble becomes Message Bubble.
- **Rating Scale → its own file and story** (Rating and NPS share it).

Already done in earlier audits (kept here for completeness): Attachment Menu → Prompt Input +
Dropdown Menu · Regenerate Menu → Message Action `menu` · Response Controls → Prompt Input
`response` · Widget Audio → Widget Media `kind` · Widget Metric Group → Widget Metric Card file ·
Follow-up Suggestions → Quick Reply Group · Core Kit table parts → UI Table.

## 4. Subcomponents

Keep a subcomponent when it is a real repeated unit or a Radix part; replace it with a prop when
it only wraps text in a styled `<span>`.

| Component | Remove (→ prop) | Keep |
| --- | --- | --- |
| Thinking Panel | Title, Duration | Trigger, Content, Steps, Step |
| Tool Call Item | Name, Summary, Duration | Trigger, Content, Section, Code, Actions |
| Tool Call Accordion | Title, Summary, Duration | Trigger, Content |
| Citation Drawer | Loading, Empty (→ `status`) | Content, Search, List |
| Bubble | Reactions | Group, Bubble, Content |
| Approval Card · Connector Card · Memory Manager | — | Field · Permission / Item · Search / Item (repeated rows) |

**Dialog and Alert Dialog stay separate components.** They share everything visual already (Shell
header / footer, overlay, elevation) but not behavior: Alert Dialog is `role="alertdialog"`,
ignores outside clicks and must be answered; one component with a `variant` would hide that
contract behind a prop and break shadcn's API. Sheet (side panel) and Drawer (mobile bottom
panel) are separate for the same reason. "Modal" stays a behavior, not a component.

## 5. Structure

The code stays flat: `src/components/{ui,anvil,agent}/<name>.tsx`, one level, by origin (shadcn
primitives · Anvil-only primitives · agent components), never by Atomic level. The level and
context live in each story's tags and title, and the relationships come from the imports.

## 6. Storybook

- Sidebar: **Foundations · Atoms · Molecules · Organisms · Agent Builder**, flat inside each
  (names A–Z). Title = `<Level>/<Name>`.
- Tags: one level tag (`atom` · `molecule` · `organism` · `agent-builder`), plus a context tag
  where it helps (`messages` · `input` · `agent-status` · `sources` · `memory` · `actions` ·
  `widgets` · `feedback`). The sidebar's tag filter works on both.
- Badges on the docs page: level, context (when set), **shadcn** (linked to the shadcn docs,
  only with a real counterpart). The Anvil-only badge goes.
- Relationships: generated from the imports (`pnpm relationships`): every docs page lists
  **Built with** (linked) and **Used in** (linked).

## 7. Order of work

1. This audit.
2. Simplify: removals (Live Voice Session, Mic Button, Bubble reactions), merges (Typing
   Indicator, Memory Notice), renames (Empty State, Message Bubble), Rating Scale split,
   subcomponent props, recompositions (Source Card, Drop Overlay).
3. Taxonomy + Storybook + badges + relationships.
4. Content (realistic agent copy above atoms) and docs (UX + implementation) per level.
5. The Phase 9 component changes (Badge, Date Picker, Carousel, overlays, Label, Quick Reply,
   Rating comment, Clarifying Question flow).
6. Figma alignment.
7. Final consistency pass.

## 8. Findings from the content pass (resolved)

- **Memory Manager**: each row's Edit and Delete are now named after the memory
  (`aria-labelledby`: “Edit Prefers concise answers…”).
- **Message Edit**: the editor focuses its field when it opens (`autoFocus`, cursor at the end).
- No **Chart** or **Code Block** component yet: guides that need one say so instead of linking.

## 9. Figma alignment (Phase 10)

Figma keeps its page structure (by flow); it mirrors components, variants, states and
relationships, not Storybook's levels. Changed on 2026-10-06:

- **Removed:** live voice session and mic button (component sets and their documentation
  frames; no instances anywhere). The Input section was closed up.
- **Badge (status badge set):** `variant` solid · subtle · outline for every tone, plus the
  **brand** tone (7 × 3 × 3 sizes × 2 shapes = 126 variants). Existing variants became
  `variant=subtle`, so every placed instance keeps its look. Figma's solid success stays on
  `--success`; code darkens it for contrast (noted in the description).
- **Alert Dialog:** Dialog's surface (radius 12, `--background`, `--overlay-16` stroke).
- **Date Picker:** `mode` single · range (the range trigger shows “12 Oct – 16 Oct 2026”, the
  calendar in mode=range).
- **Progress:** `value` 0 · 25 · 33 · 50 · 66 · 75 · 100 (Figma can't resize a layer inside an
  instance, so the value is a variant; existing variants are value=50).
- **Rating:** state `commenting` (Textarea + Cancel / Submit) and `commented` (“Thanks for the
  comment.”) for stars, faces and CSAT; the set is laid out state × type.
- **Clarifying Question:** state step 1 · step 2 · step 3 · submitted (progress, Back, Skip,
  Submit; the summary with Edit answers) and an **in chat** example from Message Row instances
  (the card as the assistant's widget, the answers as the user's message).
- **Carousel:** `.carousel slide` is a Card (card static, sm) with real project content.
- **Descriptions:** “Code:” lines updated for the merged and reworked components (typing
  indicator, memory chip, memory in use, streaming placeholder, drop overlay, source card,
  prompt input, citation drawer, thinking panel, tool call item / accordion, badge sets,
  progress, rating, clarifying question, date picker, carousel, alert dialog).

## 10. Definition of done

| # | Item | Where |
| --- | --- | --- |
| 1 | Inventory audited | §2 |
| 2 | Redundant components and subcomponents simplified | §3–4; PRs: removals, merges, subcomponents |
| 3 | Atomic taxonomy established | §1, `.storybook/taxonomy.ts` |
| 4 | Agent Builder established | §1–2, sidebar |
| 5 | Storybook reorganised | Foundations · Atoms · Molecules · Organisms · Agent Builder |
| 6 | Relationships documented and linked | docs page Built with / Used in (from imports) |
| 7 | Anvil-only badge removed | taxonomy, docs page, Welcome |
| 8 | shadcn counterparts identified and linked | `parameters.shadcn` on 56 components |
| 9 | Context badges where relevant | context tags |
| 10 | Copy contextualised | `docs/content-guide.md`; atoms generic, the rest realistic |
| 11 | Docs: UX + implementation | Usage section (`parameters.guide`) on every component |
| 12 | Specified component changes | Badge, Date Picker, Carousel, overlays, Empty State, Label, Live Voice Session, Mic Button, Quick Reply, Message Bubble, Rating, Clarifying Question |
| 13 | Dead infrastructure removed | mic-ring CSS, BubbleReactions, Typing Indicator / Memory Chip / Memory In Use files, span subcomponents' exports |
| 14 | Figma updated | §9 |
| 15 | Final global search clean | no stale names, imports, stories or tags (retired tags are only listed so lint can reject them) |
| 16 | Simpler than before | 4 components removed or merged (Live Voice Session, Mic Button, Typing Indicator, Memory Chip + Memory In Use → 1); 9 span-only subcomponents and 2 state subcomponents became props; 2 recomposed on UI parts; one taxonomy instead of sections × categories |
