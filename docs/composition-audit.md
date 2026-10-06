# Composition audit (2026-10-05)

How Anvil's components are built from each other, in code and in Figma, and what to merge or
streamline. Evidence:
- **Code:** the import graph of `src/components/**`.
- **Figma:** the instances nested inside every Core Kit component (read from the file).

## 1. Categories

The four levels from atomic design, under plain names. A component's category says **how it is
built**; its sidebar section (UI Components · Agent Primitives · Agent Blocks · Agent Templates)
says **where it lives**.

| Category | Rule | Examples |
| --- | --- | --- |
| **Element** | Can't be split further without losing its meaning. Uses no other design-system component except `Icon`. | Button, Badge, Input, Pulse Dot, Bubble, Citation Chip |
| **Composite** | A few elements working as one unit with one job. No internal sections (header / body / footer). | Field, Input Group, Tooltip, Memory Chip, Tool Call Item, Message Actions |
| **Feature** | A distinct section of the interface: its own structure (header / body / footer) or its own flow, built from composites. | Dialog, Sidebar, Prompt Input, Message Row, Approval Card |
| **Template** | A page-level layout that places features. | Full screen chat, Side panel, Split canvas (planned) |

## 2. Classification

### UI Components (53)

| Category | Components |
| --- | --- |
| Element (20) | Avatar, Badge, Button, Checkbox, Chip, Input, Kbd, Label, Link, Progress, Radio Group, Resizable, Scroll Area, Separator, Skeleton, Slider, Spinner, Switch, Textarea, Toggle |
| Composite (24) | Accordion, Alert, Breadcrumb, Button Group, Card, Carousel, Combobox, Context Menu, Date Picker, Dropdown Menu, Empty, Field, Hover Card, Input Group, Input OTP, Pagination, Popover, Select, Shell, Tabs, Toast, Toggle Group, Toolbar, Tooltip |
| Feature (9) | Alert Dialog, Calendar, Command, Dialog, Drawer, Menubar, Sheet, Sidebar, Table |

### Agent Primitives (23)

| Category | Components |
| --- | --- |
| Element (9) | Bubble, Citation Chip, Content Block, Mic Button, Pulse Dot, Quick Reply, Text Shimmer, Typing Indicator, Voice Waveform |
| Composite (14) | Attachment, Citation Source Item, Drop Overlay, Instructions Banner, Marker, Memory Chip, Memory In Use, Message, Message Scroller, Source Card, Streaming Placeholder, System Banner, Tool Call Item, Tool Log Line |

### Agent Blocks (18)

| Category | Components |
| --- | --- |
| Composite (9) | Attachment Menu, Citation Hovercard, File Output Card, Follow-up Suggestions, Message Actions, Message Edit, Regenerate Menu, Response Controls, Thinking Panel |
| Feature (9) | Approval Card, Citation Drawer, Clarifying Question, Connector Card, Live Voice Session, Memory Manager, Message Row, Prompt Input, Tool Call Accordion |

**Inconsistencies:**
- Nine Agent Blocks are composites, the same level as most Agent Primitives.
- Thinking Panel (a block) and Tool Call Item (a primitive) have the same anatomy (§4 M7).

### Shared parts Figma has and code doesn't

Figma's Approval Card, Connector Card, Clarifying Question, Memory Manager, Source Card and the
planned widgets are assembled from shared parts. Code rebuilds each part inside every card.

| Figma part | Category | In code today |
| --- | --- | --- |
| status badge | Element | Hand-built in Approval Card, Connector Card, Citation Confidence, Source Card, Live Voice Session; `ToolbarCount` stand-in |
| part / icon tile | Element | Hand-built in Approval Card, Connector Card, Clarifying Question, File Output Card, Instructions Banner, Memory Manager |
| part / card header · part / card footer | Composite | `ApprovalCardFooter` and `ConnectorCardFooter` are copies; headers are inline in every card |
| action status | Composite | `ApprovalCardStatus` and `ConnectorCardStatus` are copies |
| part / key value row · part / check row | Composite | `ApprovalCardField` · `ConnectorCardPermission` |
| part / inline note | Composite | Approval Card `note` (Figma says built on Alert) |
| part / meta item, value stack, stat tile, legend item, list item, rating display | Element / Composite | Not needed yet; Widgets, Feedback and Agent Patterns use them |

## 3. Relationship gaps

Larger components that don't use the smaller ones they should be built from.

| # | Gap | Code | Figma |
| --- | --- | --- | --- |
| C1 | Prompt Input and Live Voice Session draw their own mic button instead of using Mic Button | ✗ | ✗ |
| C2 | Mic Button and Live Voice Session controls are raw `<button>`s, not Button (icon, circle) | ✗ | — |
| C3 | Quick Reply's code comment says "built on Button", but it's a raw `<button>`. Its filter type is a toggle chip, i.e. Chip | ✗ | ✗ (no chip instance) |
| C4 | Follow-up Suggestions doesn't use Quick Reply or Chip | ✗ | ✗ |
| C5 | System Banner doesn't use Alert | ✗ | ✗ |
| C6 | Message Actions doesn't use Toolbar (roving focus between actions) | ✗ | — |
| C7 | Clarifying Question options are hand-built; they should be Choice Card (planned) | ✗ | ✗ |
| C8 | Content Block code is a styled `<pre>`; Figma nests Code Block (planned) | ✗ | ✓ |
| C9 | Drop Overlay is a dashed Empty state | ✗ | ✗ |
| C10 | Figma uses Choice Card as a generic list row (Memory Manager, Citation Drawer, Artifact Panel); a list item part fits better | — | ✗ |
| C11 | Chip and Link are used by no other component | ✗ | — |

Working well:
- Pulse Dot (used by 7 components) and Text Shimmer / Skeleton (Streaming Placeholder, Tool Log Line).
- Button (22 components).
- The shell header / footer (all overlays and Card).
- Collapsible (4 agent components).
- Dropdown Menu (both agent menus).
- Message Row composing Message, Bubble, Marker and Avatar.

## 4. Merge and streamline candidates

Each one applies to code and Figma.

| # | Candidate | Proposal | Code | Figma |
| --- | --- | --- | --- | --- |
| **M1** | Follow-up Suggestions ≈ Quick Reply | One Quick Reply family: `QuickReplyGroup` gets `label` and `layout` chips · list (Follow-up Suggestions' features). `QuickReply` (action) and `QuickReplyFilter` (toggle) are built on Chip. | Remove Follow-up Suggestions; Quick Reply composes Chip | Follow up suggestions → quick reply group with `layout`; quick reply nests chip |
| **M2** ✅ | System Banner ≈ Alert; inline note ≈ Alert | Alert gets `action`, `onDismiss` and a compact one-line `size`. System Banner and the inline note become Alert usages. | System Banner → Alert preset (or removed) | Descriptions name Alert; follow-up for design: add size sm · xs and action / dismiss to the alert set, then rebuild system banner and inline note from it |
| **M3** ✅ | Card header / footer ≈ shell header / footer | One header and one footer for overlays and cards. ShellHeader gets `media` (icon tile) and `trailing` (badge). ShellFooter gets `leading` and `note`. | Approval, Connector, Clarifying Question and Memory Manager become Card + ShellHeader + ShellFooter | Done in code; in Figma the parts stay (about 400 instances) and their descriptions name `ShellHeader` / `ShellFooter` variant card |
| **M4** ✅ | Approval / Connector status strips | One **Action Status** (executing · done · failed · expired · undone), as Figma already has | Two copies → one component | Already one component; no change |
| **M5** ✅ | Hand-built badges; Badge vs Status Badge | Build Status Badge once and use it everywhere. Better still, make it a Badge `variant="semantic"` with `tone`, `indicator` and `count`: one badge, as in shadcn | 6 copies → Badge; Citation Confidence and `ToolbarCount` removed | Done differently: kept two sets (398 instances on 12 pages made a set merge unsafe); status badge dropped its meaningless `variant` axis; both descriptions name `Badge` |
| **M6** ✅ | Hand-built icon tiles | One **Icon Tile** (tone × size × shape), as Figma has | 6 copies → one component | Already a part; promote it to public |
| **M7** | Thinking Panel ≈ Tool Call Item (Tool Log Line = compact) | Same anatomy: status icon, title, duration, expandable detail. One status vocabulary (running · done · failed; Thinking uses active · completed · failed today) and one shared collapsible base. | Unify statuses; share the trigger / content parts | Rename thinking panel `status` values; share a base row |
| **M8** | File Output Card ≈ Attachment | Both are file cards (icon, name, meta, progress, actions). File Output Card composed from Attachment, which also gives it the missing failed state | File Output Card on Attachment | File output card nests prompt attachment, or one file card with input · output |
| **M9** | `credibility` (Source Card) = `confidence` (citation chip / item / hovercard) | One name for one concept: `confidence` | Rename the Source Card prop | Rename the source card property |
| M10 | Memory Chip vs Memory In Use | Both are memory pills under a message (memory changed vs memory used). Could be one Memory Chip with `status` saved · updated · forgotten · used · unused. Low priority: they behave differently (one opens a popover). | Optional | Optional |
| M11 | shadcn **Item** | shadcn's Item (media, title, description, actions) fits most rows: Instructions Banner, Memory Manager rows, Citation Source Item, File Output Card, Project Header. Figma's icon tile already says "built on shadcn/ui: Item" | Add Item (no new dependency); rows compose it | Already referenced |

**Not merging**, though they look alike:
- Spinner, Pulse Dot, Typing Indicator and Text Shimmer: four distinct signals (UI busy, agent running, agent composing, text in progress).
- Hover Card, Popover and Tooltip.
- Marker and System Banner: an event line in the thread vs a notice with an action.
- Message Actions, Regenerate Menu and Response Controls: composition, not merge. Message Actions' retry opens Regenerate Menu.
