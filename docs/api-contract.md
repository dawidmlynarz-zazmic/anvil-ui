# Anvil UI — API Contract

Exported from the Figma page **API Contract** (node `10925:2`). Figma remains the master copy:
when it changes, re-export this file. Code, Storybook `argTypes` and Code Connect must use these
names.

Status: v0.6.1 · 1 Oct 2026 · Phases 1–4 applied plus structure cleanup; front-end review pending.
Target stack: React, Tailwind CSS v4, shadcn/ui (Radix), Storybook 9+.

## 1 · Property names

Every component property uses one of these names. A property that is not on this list is either design-only (section 4) or needs to be added here first.

| Property | Figma type | Allowed values | Code target | Replaces today |
| --- | --- | --- | --- | --- |
| variant | Variant | default · outline · ghost · link (per component) | cva variant | Button style · Alert dialog type · Tabs type + contained · Tooltip type |
| intent | Variant | neutral · brand · inverse · destructive | cva intent (Anvil extension) | Button / Icon button variant |
| tone | Variant | neutral · brand · info · success · warning · destructive · agent (Icon Tile adds surface · inverse, from Figma) | cva tone | Status badge status · Toast type · Alert tone · Icon tile tone |
| size | Variant | xs · sm · default · lg · icon · icon-xs · icon-sm · icon-lg | cva size | md → default on every component |
| shape | Variant | default · pill · circle | cva shape | Button shape · Icon button shape |
| side | Variant | top · right · bottom · left | Radix side | Tooltip position · new Sheet |
| align | Variant | start · center · end | Radix align | new (Tooltip, Popover, Dropdown) |
| orientation | Variant | horizontal · vertical | Radix orientation | new (Tabs, Radio group, Separator) |
| checked | Variant | false · true · indeterminate | Radix checked → data-[state=checked] | Checkbox type · Radio selected · Switch selected |
| pressed | Boolean | true / false | Radix pressed → data-[state=on] | Chip (on Toggle; Figma `pressed=true` variants added 5 Oct 2026) |
| open | Boolean | true / false | Radix open → data-[state=open] | Select state=active · Combobox state=open/closed (now a false · true axis) |
| disabled | Boolean | true / false | disabled / data-[disabled] | state=disabled (kept as state for visuals, see section 2) |
| loading | Boolean | true / false | loading prop (Anvil extension) | Alert dialog state=working |
| label, description, hint, title | Text | free text | children / props of the same name | input text → value · text → children |
| empty | Variant | false · true | none (design-only) | Combobox no-results view; Select / Text field placeholder look |
| content | Variant | default · logo | children | Chip variant |
| current | Variant | first · middle · last | none (layout of the current page) | Pagination position |
| status | Variant | running · done · failed … | status prop (Agent Builder components only) | Domain data on agent parts; allowed outside the Radix vocabulary |
| mode | Variant | single · range | react-day-picker mode · Slider value shape | new (Calendar, Slider) |
| with handle | Variant | false · true | ResizableHandle withHandle | new (Resizable) |

Pending addition (from the re-audit): `type` = *which sub-component or content kind* (avatar,
breadcrumbs, pagination, table, table cells, dropdown item, sidebar header and footer). In code it
selects a sub-component or rendering branch, e.g. dropdown item type radio → `DropdownMenuRadioItem`.

## 2 · State values

The Figma property named state shows how a component looks under each condition. It is never a code prop: each value maps to exactly one CSS or Radix selector, which developers write in the component classes.

| State value | CSS / Radix selector | When it appears | Retired names |
| --- | --- | --- | --- |
| default | (base classes) | Resting | — |
| hover | hover: | Pointer over an enabled control | — |
| focus | focus-visible: | Keyboard focus; uses the focus/ring effect style | focused · active (Text field) |
| pressed | active: | Pointer down | — |
| highlighted | data-[highlighted]: | Menu, Select and Combobox items under pointer or arrow keys | hover (on menu items) |
| disabled | disabled: · data-[disabled]: | Not interactive; paired with disabled = true in code | — |
| invalid | aria-invalid: | Failed validation; paired with an error message | error |
| open | data-[state=open]: | Trigger whose overlay is showing | active (Select) · open (Combobox state) |
| active | data-[active=true]: | Current item in a list or nav (Sidebar isActive) | — |

## 3 · Design-only properties

These exist only to help designers mock content in Figma. Developers do not build them as props, and Code Connect maps them to nothing.

| Component | Property | Why it is design-only |
| --- | --- | --- |
| text field | show beamer | Draws a text caret; the browser renders it |
| text field | show highlight | Draws a text selection; the browser renders it |
| select, text field | empty | Derived from whether value is set; shown with placeholder text |
| sidebar | preset | Content presets for mock-ups; code receives the menu items as children |
| all | show … booleans | Hide or show an optional part; in code the part is rendered or omitted, so there is no boolean prop unless listed in section 1 |
| all | state | Visual state only; see section 2 for the selector each value becomes |
| text field, textarea, select | show label | Not a prop: off renders a bare Input / Textarea / Select; on renders Field + FieldLabel around it. Label text and marker live on the nested Label instance |
| label (nested in form controls) | state | Follows the parent control: disabled → disabled, invalid → invalid (data-invalid on Field) |

## 4 · Token decisions

| Decision | Affects | Reason | Status |
| --- | --- | --- | --- |
| Focus ring uses blue/50 (light) and blue/60 (dark) | border/focus → --ring | Previous blue/80 and blue/30 measured about 1.4:1 and 1.5:1; WCAG needs 3:1 | Applied |
| Radius base of 8; all radii derive from it | radius/* → calc(var(--radius) ± n) | Matches the shadcn formula; one change rethemes the system | Applied; mobile xl/2xl aligned to the formula |
| radius/full becomes 9999 | radius/full | 80 does not round elements taller than 80px | Applied; code syntax calc(infinity * 1px) |
| Mode-dependent spacing steps (lg–4xl) export as --space-* with a mobile override; fixed steps keep calc(var(--spacing) * n) | spacing/lg … spacing/4xl → var(--space-*) | One calc multiplier cannot express both modes; --space-* avoids Tailwind --spacing-* key collisions | Applied |
| Shadows bind to semantic shadow colors with a dark value | shadow/soft · shadow/medium · shadow/strong | Primitive black-alpha shadows disappear in dark mode | Applied |
| z-index, motion and tracking variables | z-index/*, motion/*, letter-spacing/* | Overlays inside host pages, consistent animation, scalable headings | Applied |
| primary/, secondary/ and destructive/ groups (were under button/) | --primary, --secondary, --destructive | They drive info, chart and sidebar tokens, not only buttons; code syntax unchanged | Applied |
| danger stays a status alias of destructive | status/danger/* → --danger | One public name per concept in components | Applied |
| Font-weight strings export as 400 / 500 / 600 | font-weight/* | CSS needs numbers; Figma needs style names | Export rule |
| Dialog backdrops use overlay/scrim; overlay/dim keeps its contrast-alpha mapping | overlay/scrim → var(--overlay) | overlay/dim is used for field borders, so its dark value stays white-alpha | Applied |
| Letter-spacing bound on every text style | letter-spacing/tighter · tight · normal → var(--tracking-*) | Headings −2 / −1 px, everything else 0 | Applied |
| Elevation styles as semantic roles on the shadow scale | elevation/raised (= shadow/lg) · elevation/modal (= shadow/xl) | Floating vs modal surfaces; Card stays flat | Applied to Dialog, Sheet, Drawer, Alert Dialog, Popover; rollout to menus pending |

## 5 · State coverage

Focus uses the focus/ring effect style; disabled uses 50% opacity (shadcn `disabled:opacity-50`) unless a base component has its own disabled look; invalid swaps the field border to destructive.

| Component | States | Notes |
| --- | --- | --- |
| button | default · hover · focus · disabled + loading (boolean) | loading shows a loader-circle spinner before the label |
| icon button | default · hover · focus · disabled | — |
| chip | default · hover · focus · disabled | — |
| select | default · hover · focus · disabled · invalid + open axis | — |
| combobox | default · focus · disabled · invalid + open and empty axes | — |
| text field, textarea | default · hover · focus · disabled · invalid | — |
| checkbox | default · hover · focus · disabled · invalid | invalid uses a destructive box border |
| radio button | default · hover · focus · disabled | — |
| switch | default · hover · focus · disabled | disabled = 50% opacity |
| tabs trigger | default · hover · focus · disabled | — |
| dropdown item, item slot | default · highlighted · disabled | highlighted covers keyboard focus |
| alert dialog | loading axis | action button uses Button loading |

## 6 · Components and their code targets

| Figma component · page | Variants | shadcn/ui target |
| --- | --- | --- |
| button, icon button · Button | variant × intent × size × state × shape; loading | Button (icon button = Button size icon*) |
| badge, status badge · Badge | tone × variant (default = solid · subtle · outline) × shape (default · pill) × size | Badge (next phase: `intent` and `variant="semantic"` removed; every tone has all three treatments) |
| label · Forms | marker none · required · optional × state default · disabled · invalid | Label / FieldLabel |
| text field · Forms | size × state × empty; nested Label; hint | Field + FieldLabel + Input + FieldDescription |
| textarea · Forms | state × empty | Field + FieldLabel + Textarea + FieldDescription |
| select · Forms | size × state × empty × open | Field + FieldLabel + Select |
| combobox · Forms | open × empty × state | Popover + Command |
| field · Forms | orientation vertical · horizontal × state default · invalid; control swap | Field, FieldLabel, FieldDescription, FieldError |
| checkbox · Forms | checked × state | Checkbox + Label |
| radio button · Forms | checked × state | RadioGroupItem + Label |
| switch · Forms | size × state × checked | Switch + Label |
| slider · Forms | mode single · range × state | Slider |
| dialog · Dialog · Sheet · Drawer | size sm · default · lg | Dialog |
| sheet · Dialog · Sheet · Drawer | side right · left · top · bottom; content slot | Sheet |
| drawer · Dialog · Sheet · Drawer | content slot | Drawer (vaul) |
| .shell header, .shell footer · Dialog · Sheet · Drawer | header bar · inline; footer bar · inline × end · between · stretch | DialogHeader / SheetHeader / … ; DialogFooter / … |
| overlay · Dialog · Sheet · Drawer | — | DialogOverlay / SheetOverlay / … |
| alert dialog · Alert Dialog | variant default · destructive × loading | AlertDialog |
| popover · Popover | show header, show footer, content slot | Popover |
| dropdown menu, dropdown item · Dropdown Menu | item type default · radio · checkbox · destructive × state | DropdownMenu (+ ContextMenu with the same items) |
| tooltip · Tooltip | side × variant | Tooltip |
| tabs · Tabs | variant line · contained × full width | Tabs |
| toast · Toast | tone × variant compact · extended | Sonner |
| command · Command | empty | Command (cmdk) |
| toggle, toggle group · Toggle | variant × size × pressed × state; group default · outline | Toggle, Toggle Group |
| .calendar day, calendar, date picker · Date Picker | 9 day states; mode single · range; open | Calendar, Date Picker |
| carousel · Carousel | current start · middle · end; show controls, show dots | Carousel (Embla) |
| accordion item, accordion · Accordion | open × state | Accordion, Collapsible |
| resizable · Resizable | orientation × with handle | Resizable |
| .menu trigger, menu · Menu | trigger state; open | Menubar |
| hover card · Cards (example, not a component) | card static (compact) + elevation/raised + avatar layout in slot 1 | HoverCard + Card content |
| sidebar + parts · Sidebar | mode expanded · icon · offcanvas; preset (design-only) | Sidebar |

## 7 · Code paths for Anvil and Agent Builder components

- Anvil compositions: `@/components/anvil/<name>` (e.g. `@/components/anvil/stepper`, `@/components/anvil/shell`).
- Agent Builder components: `@/components/agent/<name>` (e.g. `@/components/agent/prompt-input`), as written in each Core Kit component description.
- Agent Builder domain status uses `status` (§1). Exception: shadcn's chat-set **Attachment** keeps its own public `state` prop (idle · uploading · processing · error · done) — it is shadcn's API, not a Figma interaction state (decided 5 Oct 2026).

## 8 · Changelog (latest)

| Date | Version | Change |
| --- | --- | --- |
| 1 Oct 2026 | 0.6.1 | Renamed to Anvil; code paths now @/components/agent/<name> and @/components/anvil/<name> |
| 1 Oct 2026 | 0.6.0 | Label is the single label atom (nested in Text field, Textarea, Select, Checkbox, Radio, Switch, Field); Label gains invalid; hints unified; Field defaults to Combobox |
| 1 Oct 2026 | 0.5.0 | Slots on Sheet, Drawer, Popover; Context Menu merged into Dropdown Menu; Hover Card moved to Cards; Menubar → Menu; form pages merged into Forms |
| 1 Oct 2026 | 0.4.0 | 12 new primitive pages (Popover, Command, Textarea, Field, Toggle, Toggle Group, Calendar, Date Picker, Carousel, Accordion, Slider, Resizable, Menu) |
| 1 Oct 2026 | 0.3.0 | Focus, disabled, invalid, open and loading coverage; Modal split into Dialog, Sheet, Drawer |
| 1 Oct 2026 | 0.2.0 | Token fixes and renames |
| — | after 0.6.1 | Shell work: .shell header / .shell footer, elevation/raised and elevation/modal, Overlay, Alert Dialog and Popover rebuilt on shell parts (not yet logged in Figma) |
