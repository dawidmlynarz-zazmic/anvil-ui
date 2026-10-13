# Quality pass — consistency and levels (2026-10-13)

> **Status 2026-10-13: decisions 1, 2 and 3 approved and done** (levels, `kind`, Task Card). Decision 4 (focus-stroke
> token, shadow mapping) and the smaller items in sections 2–4 are still open.

A code-level audit of all 157 component files and 149 story files, run by scripts (the levels scan and
the consistency scan are described at the end so they can be rerun). Nothing here has been changed yet:
each section ends with a recommendation and what it needs from the design lead. Motion was audited
separately (`docs/motion-foundations.md`, PR #180) and is clean; axe passes on all 1,790 story tests in
light and dark.

## 1. Levels: do atoms, molecules and organisms mean what we say?

Rules today (`.storybook/taxonomy.ts`): an **atom** is one element and uses no other Anvil component but
Icon; a **molecule** is a few atoms with one job; an **organism** is a complete, reusable section
(overlays, navigation, data). Each component's real imports were compared with its level.

| Finding | Components | Recommendation |
| --- | --- | --- |
| **Atoms that build on another component** | Input and Textarea (Field anatomy built in), Step Status Icon (on Pulse Dot) | Keep them atoms and amend the rule: *an atom may embed the Field anatomy and use other atoms*. Both are single elements to a user; moving them would put the most-used controls under Molecules. |
| **Molecules built on an organism** (inverted) | Combobox (on Command), Message Actions (on Toolbar) | Promote **Combobox → organism** (a searchable overlay list, like Command). Demote **Toolbar → molecule** (a row of Buttons with roving focus: a few atoms, one job), which fixes Message Actions and Selection Toolbar. |
| **Molecules built on nothing** | Accordion, Breadcrumb, Context Menu, Dropdown Menu, Empty State, Hover Card, Input OTP, Message, Resizable, Toast, Tabs, Tooltip | Fine as they are (compounds of several Radix parts), but the molecule description says “a few atoms”. Amend it: *a compound of parts with one job*, and state the overlay rule below. |
| **Overlays are split between molecule and organism** | molecule: Popover, Hover Card, Tooltip, Dropdown, Context Menu; organism: Dialog, Alert Dialog, Sheet, Drawer, Command | It is consistent once written down: *small overlays anchored to a trigger are molecules; modal and edge surfaces are organisms; persistent navigation (Sidebar, Menubar) is an organism.* Add that sentence to the taxonomy. |
| **Organism with no composition** | Content Block (68 lines, a markdown wrapper) | Demote to **molecule**. |
| **A shared building block with no home** | **Task Card** (14 patterns use it; no story, in the agent folder) | Promote to a documented Design System **molecule** with a story and let the older cards use it (section 3). Levels live in tags, not folders, so no file move is needed. |
| **Lint gap** | nothing stops a component being built on a higher level | Add a check to `scripts/check-stories.mjs`: a component may not import a higher level, with Command → Dialog (`CommandDialog`) as the single listed exception. |

Net: 3 moves (Combobox up, Toolbar and Content Block down), 1 promotion with a story (Task Card), 3
sentences added to the level descriptions, 1 new lint rule.

## 2. Naming and API consistency

| Finding | Where | Recommendation |
| --- | --- | --- |
| **`kind` vs Figma `type`**: the contract says `type` is “which sub-component or content kind” and not a prop, but code uses `kind` in Rating, Survey, File Output Card, Widget Media, Command Palette item, and `type` in Widget Error, Document Canvas | 8 components | Make `kind` the contract name (`type` clashes with the HTML attribute) and rename the three `type` props. **A public prop rename: needs your OK.** |
| `state` as a prop | Sidebar only (shadcn's own data attribute) | Leave. |
| `mode` | Inline Suggestion (replace · insert) | Fine: `mode` is in the contract. |
| Missing `data-slot` | Sonner, Spinner | Add, for tests and selectors. |
| Stories without a test | Shell, Shortcut Hint | Add a smoke test each. |
| Story without a `Default` | Message Edit | Rename or add one. |
| Components without a story | Task Card, Collapsible (Citation Confidence and menu styles are internal) | Task Card and Collapsible get stories. |

## 3. Re-drawn and duplicated structure (the reuse rule)

- **Five hand-built card shells**: Approval Card, Connector Card, Memory Manager and Insight Card each draw
  `article · rounded-xl · border · bg-card · shadow-sm · max-w-160`, the same shell Task Card has. Source
  Card and Document Canvas draw their own as well. **Recommendation:** one shell (the promoted Task Card)
  and refactor the four. It removes about 150 lines and keeps the radius, shadow and width in one place.
- **Raw `<button>` in components** (nine files). Seven are legitimate: they are the interactive element
  inside an Item or Card used `asChild` (Artifact Chip, Citation Source Item, Quick Reply, Starter Prompt
  Card, Chip) or the atom itself. Two should reuse: Message Row's inline **Retry** (use `Link asChild`, as
  Project Setup already does) and **Version History**'s radio row (use Item `asChild`).
- **Raw `<textarea>`** in Prompt Input: it is the Input Group control; leave.

## 4. Tokens and hard-coded values

- No hex colours anywhere. No hand-set font sizes.
- **`inset-ring-[1.5px]` ×9** (Input, Textarea, Select, Combobox, Input Group, Prompt Input): Figma's field
  focus stroke. Add one token or utility (`--stroke-focus`) so it is not a literal in nine places.
- `py-[3px]` in Element Spotlight → `py-0.75`; `max-w-[80%]` in Message Bubble and the Sidebar's
  `top-[5px]` offsets are shadcn leftovers: tokenise the first two, leave the Sidebar.
- **Shadows outside the tokens**: `shadow-md` ×4 and `shadow-xl` / `shadow-lg` in the Launcher. CLAUDE.md
  already says use `elevation/raised`; map them.
- Radius: 43 `rounded-lg`, 37 `rounded-xl`, 4 `rounded-2xl`: consistent by role (rows lg, cards xl,
  overlays 2xl). Disabled is 50% everywhere except the 30% Figma draws on checked controls.
- Focus: 49 uses of the `focus-ring` utility; the other focus styles are field strokes Figma draws.

## 5. What this audit cannot see

It is structural. It does not compare pixels to Figma. That is the second half of the quality pass and is
the first job of the playground's **state matrix** (see `docs/playground-outline.md`): every component
× variant × state × light/dark × four shell sizes, rendered in one place and diffed against the Figma
screenshot, so “looks the same” is checked by a machine and reviewed by a person.

## Decisions for the design lead

1. Approve the three moves (Combobox up; Toolbar and Content Block down) and the rule amendments.
2. Approve renaming the three `type` props to `kind` and adding `kind` to the API contract.
3. Approve promoting Task Card to a Design System molecule and refactoring the four hand-built cards.
4. Approve the focus-stroke token and the shadow mapping.

## How the scans work (rerun any time)

- *Levels*: for every story file, its level tag, and the Anvil components its source imports (looking
  through files without a story), compared with the level rules.
- *Consistency*: per component file, `data-slot`, raw `<button>` / `<textarea>`, hex colours, arbitrary
  `[…px]` values, prop names `state` · `kind` · `type` · `mode`, file size; per story file, tests and a
  `Default`. Candidates to become permanent lint checks: the higher-level import, `data-slot`, and a
  test per story file.
