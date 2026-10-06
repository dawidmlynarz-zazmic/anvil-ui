// Everything Anvil UI covers, grouped like the Storybook sidebar (Foundations, then UI
// Components, Agent Primitives, Agent Blocks, Agent Templates) and, inside an agent section, by the
// Figma section the component comes from. Whether an item is available (and where it links) is
// read from Storybook's index at runtime, so this list only changes when the scope changes. `title`
// is the Storybook title the item has (or will have).

import type { SectionTitle } from '../../.storybook/taxonomy'

export type CatalogItem = { name: string; title: string }
export type CatalogArea = {
  /** The sidebar section the area's components live in. */
  section: 'Foundations' | SectionTitle
  id: string
  name: string
  description: string
  items: CatalogItem[]
}

const c = (name: string): CatalogItem => ({ name, title: `UI Components/${name}` })
const f = (name: string): CatalogItem => ({ name, title: `Foundations/${name}` })
const section =
  (parent: 'Agent Primitives' | 'Agent Blocks', name: string) =>
  (names: string[]): CatalogItem[] =>
    names.map((item) => ({ name: item, title: `${parent}/${name}/${item}` }))
const prim = (name: string, names: string[]) => section('Agent Primitives', name)(names)
const block = (name: string, names: string[]) => section('Agent Blocks', name)(names)

export const catalog: CatalogArea[] = [
  {
    section: 'Foundations',
    id: 'foundations',
    name: 'Foundations',
    description: 'Tokens pulled from Figma: color, type, spacing, radius, elevation and icons.',
    items: [f('Colors'), f('Typography'), f('Spacing'), f('Radius'), f('Elevation'), f('Icon')],
  },
  {
    section: 'UI Components',
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
    section: 'UI Components',
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
    section: 'UI Components',
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
    section: 'UI Components',
    id: 'feedback',
    name: 'Feedback',
    description: 'Status, progress and messages about what the system or agent is doing.',
    items: [c('Alert'), c('Toast'), c('Progress'), c('Spinner'), c('Skeleton'), c('Empty')],
  },
  {
    section: 'UI Components',
    id: 'navigation',
    name: 'Navigation',
    description: 'Moving between views, sections and pages.',
    items: [c('Sidebar'), c('Tabs'), c('Breadcrumb'), c('Pagination'), c('Accordion')],
  },
  {
    section: 'UI Components',
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
      c('Icon Tile'),
      c('Code Block'),
    ],
  },
  // Agent Primitives: elements and composites.
  {
    section: 'Agent Primitives',
    id: 'primitives-shell',
    name: 'Shell',
    description: 'Small parts of the chat around the thread.',
    items: prim('Shell', ['Starter Prompt Card', 'Project Header']),
  },
  {
    section: 'Agent Primitives',
    id: 'primitives-input',
    name: 'Input',
    description:
      'Parts of the composer and replies: quick replies, suggestions, voice, files and stop / continue.',
    items: [
      // Figma prompt attachment = the shadcn Attachment primitive.
      { name: 'Prompt Attachment', title: 'Agent Primitives/Input/Attachment' },
      ...prim('Input', [
        'Quick Reply',
        'Follow-up Suggestions',
        'Mic Button',
        'Voice Waveform',
        'Drop Overlay',
        'Attachment Menu',
        'Response Controls',
      ]),
      // Quick reply group lives in the Quick Reply story.
      { name: 'Quick Reply Group', title: 'Agent Primitives/Input/Quick Reply' },
    ],
  },
  {
    section: 'Agent Primitives',
    id: 'primitives-messages',
    name: 'Messages',
    description: 'The pieces of a turn: bubbles, markers, content, actions, edits, files and streaming.',
    items: prim('Messages', [
      'Message',
      'Bubble',
      'Marker',
      'Message Scroller',
      'Content Block',
      'Message Actions',
      'Message Edit',
      'Regenerate Menu',
      'File Output Card',
      'Tool Log Line',
      'Streaming Placeholder',
    ]),
  },
  {
    section: 'Agent Primitives',
    id: 'primitives-states',
    name: 'Agent states',
    description: 'What the agent is doing right now: indicators, reasoning and tool calls.',
    items: prim('Agent States', [
      'Pulse Dot',
      'Text Shimmer',
      'Typing Indicator',
      'Thinking Panel',
      'Tool Call Item',
    ]),
  },
  {
    section: 'Agent Primitives',
    id: 'primitives-sources',
    name: 'Sources',
    description: 'Citation chips, previews and source rows.',
    items: prim('Sources', ['Citation Chip', 'Citation Hovercard', 'Citation Source Item', 'Source Card']),
  },
  {
    section: 'Agent Primitives',
    id: 'primitives-system',
    name: 'System & context',
    description: 'Notices and memory markers.',
    items: [
      // Figma system banner = Alert, size sm (audit M2).
      { name: 'System Banner', title: 'UI Components/Alert' },
      ...prim('System & Context', ['Instructions Banner', 'Memory Chip', 'Memory In Use', 'Action Status']),
    ],
  },
  {
    section: 'Agent Primitives',
    id: 'primitives-widgets',
    name: 'Widgets & artifacts',
    description: 'Single pieces of rich output.',
    items: prim('Widgets & Artifacts', ['Widget Metric Card']),
  },
  {
    section: 'Agent Primitives',
    id: 'primitives-feedback',
    name: 'Feedback & surveys',
    description: 'A single rating control.',
    items: prim('Feedback & Surveys', ['Rating']),
  },
  // Agent Blocks: features.
  {
    section: 'Agent Blocks',
    id: 'blocks-shell',
    name: 'Shell',
    description: 'The chat around the thread: welcome, model picker, sharing and projects.',
    items: block('Shell', ['Welcome State', 'Model and Tools Picker', 'Share Dialog', 'Project Setup']),
  },
  {
    section: 'Agent Blocks',
    id: 'blocks-input',
    name: 'Input',
    description: 'The composer, live voice and answering the agent’s questions.',
    items: block('Input', ['Prompt Input', 'Live Voice Session', 'Clarifying Question']),
  },
  {
    section: 'Agent Blocks',
    id: 'blocks-messages',
    name: 'Messages',
    description: 'A full turn in the thread.',
    items: block('Messages', ['Message Row']),
  },
  {
    section: 'Agent Blocks',
    id: 'blocks-states',
    name: 'Agent states',
    description: 'A run of tool calls, grouped.',
    items: block('Agent States', ['Tool Call Accordion']),
  },
  {
    section: 'Agent Blocks',
    id: 'blocks-sources',
    name: 'Sources',
    description: 'The full list of sources behind an answer.',
    items: block('Sources', ['Citation Drawer']),
  },
  {
    section: 'Agent Blocks',
    id: 'blocks-system',
    name: 'System & context',
    description: 'Approvals, connected apps and memory management.',
    items: block('System & Context', ['Approval Card', 'Connector Card', 'Memory Manager']),
  },
  {
    section: 'Agent Blocks',
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
    section: 'Agent Blocks',
    id: 'blocks-feedback',
    name: 'Feedback & surveys',
    description: 'Asking the user how it went.',
    items: block('Feedback & Surveys', ['Feedback Reason', 'NPS', 'Survey', 'Poll']),
  },
  {
    section: 'Agent Blocks',
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
    section: 'Agent Templates',
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
