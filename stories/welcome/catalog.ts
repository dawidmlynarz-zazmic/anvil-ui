// Everything Anvil UI covers, grouped by tier like the Storybook sidebar (Foundations, then UI
// Components, Agent Primitives, Agent Blocks, Agent Templates) and, inside an agent tier, by the
// Figma section the component comes from. Whether an item is available (and where it links) is
// read from Storybook's index at runtime, so this list only changes when the scope changes. `title`
// is the Storybook title the item has (or will have).

import type { TierTag } from '../../.storybook/tiers'

export type CatalogItem = { name: string; title: string }
export type CatalogArea = {
  /** Foundations, or the tier the area's components belong to. */
  tier: 'foundations' | TierTag
  id: string
  name: string
  description: string
  items: CatalogItem[]
}

const c = (name: string): CatalogItem => ({ name, title: `UI Components/${name}` })
const f = (name: string): CatalogItem => ({ name, title: `Foundations/${name}` })
const section =
  (tier: 'Agent Primitives' | 'Agent Blocks', name: string) =>
  (names: string[]): CatalogItem[] =>
    names.map((item) => ({ name: item, title: `${tier}/${name}/${item}` }))
const prim = (name: string, names: string[]) => section('Agent Primitives', name)(names)
const block = (name: string, names: string[]) => section('Agent Blocks', name)(names)

export const catalog: CatalogArea[] = [
  {
    tier: 'foundations',
    id: 'foundations',
    name: 'Foundations',
    description: 'Tokens pulled from Figma: color, type, spacing, radius, elevation and icons.',
    items: [f('Colors'), f('Typography'), f('Spacing'), f('Radius'), f('Elevation'), f('Icon')],
  },
  {
    tier: 'ui-component',
    id: 'actions',
    name: 'Actions',
    description: 'Buttons and the small controls that trigger or toggle something.',
    items: [
      c('Button'),
      c('Button Group'),
      c('Toggle'),
      c('Toggle Group'),
      c('Toolbar'),
      c('Chip'),
      c('Link'),
      c('Badge'),
      c('Kbd'),
    ],
  },
  {
    tier: 'ui-component',
    id: 'forms',
    name: 'Forms',
    description: 'Inputs with the field anatomy built in: label, hint, error and every state.',
    items: [
      c('Label'),
      c('Field'),
      c('Input'),
      c('Textarea'),
      c('Input Group'),
      c('Select'),
      c('Combobox'),
      c('Input OTP'),
      c('Checkbox'),
      c('Radio Group'),
      c('Switch'),
      c('Slider'),
      c('Choice Card'),
      c('Stepper'),
      c('Calendar'),
      c('Date Picker'),
    ],
  },
  {
    tier: 'ui-component',
    id: 'overlays',
    name: 'Overlays',
    description: 'Layers above the page. They share the shell header and footer.',
    items: [
      c('Dialog'),
      c('Alert Dialog'),
      c('Sheet'),
      c('Drawer'),
      c('Popover'),
      c('Hover Card'),
      c('Tooltip'),
      c('Dropdown Menu'),
      c('Context Menu'),
      c('Menubar'),
      c('Command'),
    ],
  },
  {
    tier: 'ui-component',
    id: 'feedback',
    name: 'Feedback',
    description: 'Status, progress and messages about what the system or agent is doing.',
    items: [
      c('Alert'),
      c('Toast'),
      c('Progress'),
      c('Spinner'),
      c('Skeleton'),
      c('Empty'),
      c('Status Badge'),
    ],
  },
  {
    tier: 'ui-component',
    id: 'navigation',
    name: 'Navigation',
    description: 'Moving between views, sections and pages.',
    items: [c('Sidebar'), c('Tabs'), c('Breadcrumb'), c('Pagination'), c('Accordion')],
  },
  {
    tier: 'ui-component',
    id: 'layout',
    name: 'Layout & data',
    description: 'Surfaces and structures for content, lists and data.',
    items: [
      c('Card'),
      c('Separator'),
      c('Scroll Area'),
      c('Resizable'),
      c('Table'),
      c('Carousel'),
      c('Avatar'),
      c('Code Block'),
    ],
  },
  // Agent Primitives: one message part, indicator, chip or row.
  {
    tier: 'agent-primitive',
    id: 'primitives-shell',
    name: 'Shell',
    description: 'Small parts of the chat around the thread.',
    items: prim('Shell', ['Starter Prompt Card', 'Project Header']),
  },
  {
    tier: 'agent-primitive',
    id: 'primitives-input',
    name: 'Input',
    description: 'Parts of the composer: files, voice and quick replies.',
    items: [
      // Figma prompt attachment = the shadcn Attachment primitive.
      { name: 'Prompt Attachment', title: 'Agent Primitives/Input/Attachment' },
      ...prim('Input', ['Quick Reply', 'Mic Button', 'Voice Waveform', 'Drop Overlay']),
      // Quick reply group lives in the Quick Reply story.
      { name: 'Quick Reply Group', title: 'Agent Primitives/Input/Quick Reply' },
    ],
  },
  {
    tier: 'agent-primitive',
    id: 'primitives-messages',
    name: 'Messages',
    description: 'The pieces of a turn: bubbles, markers, content and streaming.',
    items: prim('Messages', [
      'Message',
      'Bubble',
      'Marker',
      'Message Scroller',
      'Content Block',
      'Tool Log Line',
      'Streaming Placeholder',
    ]),
  },
  {
    tier: 'agent-primitive',
    id: 'primitives-states',
    name: 'Agent states',
    description: 'Indicators for what the agent is doing right now.',
    items: prim('Agent States', ['Pulse Dot', 'Text Shimmer', 'Typing Indicator', 'Tool Call Item']),
  },
  {
    tier: 'agent-primitive',
    id: 'primitives-sources',
    name: 'Sources',
    description: 'Citation chips and source rows.',
    items: prim('Sources', ['Citation Chip', 'Citation Source Item', 'Source Card']),
  },
  {
    tier: 'agent-primitive',
    id: 'primitives-system',
    name: 'System & context',
    description: 'Notices and memory markers.',
    items: prim('System & Context', ['System Banner', 'Instructions Banner', 'Memory Chip', 'Memory In Use']),
  },
  {
    tier: 'agent-primitive',
    id: 'primitives-widgets',
    name: 'Widgets & artifacts',
    description: 'Single pieces of rich output.',
    items: prim('Widgets & Artifacts', ['Widget Metric Card']),
  },
  {
    tier: 'agent-primitive',
    id: 'primitives-feedback',
    name: 'Feedback & surveys',
    description: 'A single rating control.',
    items: prim('Feedback & Surveys', ['Rating']),
  },
  // Agent Blocks: composed, interactive agent features.
  {
    tier: 'agent-block',
    id: 'blocks-shell',
    name: 'Shell',
    description: 'The chat around the thread: welcome, model picker, sharing and projects.',
    items: block('Shell', ['Welcome State', 'Model and Tools Picker', 'Share Dialog', 'Project Setup']),
  },
  {
    tier: 'agent-block',
    id: 'blocks-input',
    name: 'Input',
    description: 'Composing a prompt and answering the agent.',
    items: block('Input', [
      'Prompt Input',
      'Attachment Menu',
      'Live Voice Session',
      'Follow-up Suggestions',
      'Response Controls',
      'Clarifying Question',
    ]),
  },
  {
    tier: 'agent-block',
    id: 'blocks-messages',
    name: 'Messages',
    description: 'A full turn in the thread and what you can do with it.',
    items: block('Messages', [
      'Message Row',
      'Message Edit',
      'Message Actions',
      'Regenerate Menu',
      'File Output Card',
    ]),
  },
  {
    tier: 'agent-block',
    id: 'blocks-states',
    name: 'Agent states',
    description: 'Reasoning and tool calls, expandable.',
    items: block('Agent States', ['Thinking Panel', 'Tool Call Accordion']),
  },
  {
    tier: 'agent-block',
    id: 'blocks-sources',
    name: 'Sources',
    description: 'Source previews and the full list behind an answer.',
    items: block('Sources', ['Citation Hovercard', 'Citation Drawer']),
  },
  {
    tier: 'agent-block',
    id: 'blocks-system',
    name: 'System & context',
    description: 'Approvals, connected apps and memory management.',
    items: block('System & Context', ['Approval Card', 'Connector Card', 'Memory Manager']),
  },
  {
    tier: 'agent-block',
    id: 'blocks-widgets',
    name: 'Widgets & artifacts',
    description: 'Rich output inside the thread: tables, media and artifacts.',
    items: block('Widgets & Artifacts', [
      'Artifact Panel',
      'Widget Metric Group',
      'Widget Table',
      'Widget Media',
      'Widget Audio',
      'Image Generation Card',
    ]),
  },
  {
    tier: 'agent-block',
    id: 'blocks-feedback',
    name: 'Feedback & surveys',
    description: 'Asking the user how it went.',
    items: block('Feedback & Surveys', ['Feedback Reason', 'NPS', 'Survey', 'Poll']),
  },
  {
    tier: 'agent-block',
    id: 'blocks-patterns',
    name: 'Agent patterns',
    description: 'Task and commerce flows from the Figma Agent Patterns page, built from Core Kit parts.',
    items: [
      'Task Lifecycle',
      'Evidence & Decisions',
      'Catalog & Offers',
      'Scheduling',
      'Checkout',
      'After Purchase',
      'Trust & Preferences',
    ].map((name) => ({ name, title: `Agent Blocks/${name}` })),
  },
  // Agent Templates: surfaces and full layouts.
  {
    tier: 'agent-template',
    id: 'templates',
    name: 'Surfaces & templates',
    description: 'Where the agent lives: full screen, side panel, popover, split canvas and more.',
    items: [
      'Full Screen',
      'Side Panel',
      'Popover & Launcher',
      'Split Canvas',
      'Inline Assist',
      'Command Palette',
      'Proactive',
      'Ambient Overlay',
    ].map((name) => ({ name, title: `Agent Templates/${name}` })),
  },
]
