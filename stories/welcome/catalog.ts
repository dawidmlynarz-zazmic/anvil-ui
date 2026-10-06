// Everything Anvil UI covers, grouped like the Storybook sidebar: Foundations, then the levels
// (Atoms, Molecules, Organisms, Agent Builder; docs/system-audit.md). Inside a level, areas group
// related components. Whether an item is available (and where it links) is read from Storybook's
// index at runtime, so this list only changes when the scope changes. `title` is the Storybook
// title the item has (or will have). Figma names that live elsewhere in code are aliases to it.

import type { LevelTitle } from '../../.storybook/taxonomy'

export type CatalogItem = { name: string; title: string }
export type CatalogArea = {
  /** The sidebar group the area's components live in. */
  section: 'Foundations' | LevelTitle
  id: string
  name: string
  description: string
  items: CatalogItem[]
}

const at =
  (level: 'Foundations' | LevelTitle) =>
  (...names: string[]): CatalogItem[] =>
    names.map((name) => ({ name, title: `${level}/${name}` }))
const foundation = at('Foundations')
const atom = at('Atoms')
const molecule = at('Molecules')
const organism = at('Organisms')
const builder = at('Agent Builder')
/** A Figma name that is part of another component in code. */
const alias = (name: string, title: string): CatalogItem => ({ name, title })

export const catalog: CatalogArea[] = [
  {
    section: 'Foundations',
    id: 'foundations',
    name: 'Foundations',
    description: 'Tokens pulled from Figma: color, type, spacing, radius, elevation and motion.',
    items: foundation('Colors', 'Typography', 'Spacing', 'Radius', 'Elevation', 'Motion'),
  },
  // Atoms: one element, context-agnostic.
  {
    section: 'Atoms',
    id: 'atoms-controls',
    name: 'Controls',
    description: 'What people press, type into or switch.',
    items: atom(
      'Button',
      'Toggle',
      'Input',
      'Textarea',
      'Checkbox',
      'Radio Group',
      'Switch',
      'Slider',
      'Label',
      'Link',
      'Chip',
    ),
  },
  {
    section: 'Atoms',
    id: 'atoms-display',
    name: 'Display',
    description: 'Labels, status and structure.',
    items: atom(
      'Icon',
      'Badge',
      'Kbd',
      'Avatar',
      'Icon Tile',
      'Progress',
      'Spinner',
      'Skeleton',
      'Separator',
      'Scroll Area',
      'Sparkline',
    ),
  },
  {
    section: 'Atoms',
    id: 'atoms-agent',
    name: 'Agent atoms',
    description: 'The smallest agent parts: a bubble, a marker, status motion and a citation.',
    items: atom(
      'Message Bubble',
      'Marker',
      'Pulse Dot',
      'Text Shimmer',
      'Step Status Icon',
      'Voice Waveform',
      'Citation Chip',
    ),
  },
  // Molecules: a few atoms with one job.
  {
    section: 'Molecules',
    id: 'molecules-forms',
    name: 'Forms',
    description: 'Fields with the label, hint and error built in, and the controls that group inputs.',
    items: molecule(
      'Field',
      'Input Group',
      'Select',
      'Combobox',
      'Input OTP',
      'Toggle Group',
      'Button Group',
      'Calendar',
      'Date Picker',
      'Choice Card',
      'Stepper',
    ),
  },
  {
    section: 'Molecules',
    id: 'molecules-menus',
    name: 'Menus & popovers',
    description: 'Small layers anchored to a trigger.',
    items: molecule('Popover', 'Hover Card', 'Tooltip', 'Dropdown Menu', 'Context Menu'),
  },
  {
    section: 'Molecules',
    id: 'molecules-content',
    name: 'Content & feedback',
    description: 'Surfaces, rows, navigation and messages about what is happening.',
    items: [
      ...molecule(
        'Card',
        'Item',
        'Shell',
        'Alert',
        'Toast',
        'Empty State',
        'Tabs',
        'Accordion',
        'Breadcrumb',
        'Pagination',
        'Resizable',
      ),
      alias('System Banner', 'Molecules/Alert'),
    ],
  },
  {
    section: 'Molecules',
    id: 'molecules-agent',
    name: 'Agent molecules',
    description: 'Reusable agent parts: message pieces, replies, scales and status strips.',
    items: [
      ...molecule(
        'Message',
        'Message Actions',
        'Message Edit',
        'Quick Reply',
        'Attachment',
        'Rating Scale',
        'Action Status',
        'Citation Source Item',
        'Tool Log Line',
      ),
      alias('Prompt Attachment', 'Molecules/Attachment'),
      alias('Quick Reply Group', 'Molecules/Quick Reply'),
      alias('Follow-up Suggestions', 'Molecules/Quick Reply'),
      alias('Regenerate Menu', 'Molecules/Message Actions'),
    ],
  },
  // Organisms: complete, reusable sections.
  {
    section: 'Organisms',
    id: 'organisms-overlays',
    name: 'Overlays',
    description: 'Layers above the page. They share the shell header and footer.',
    items: organism('Dialog', 'Alert Dialog', 'Sheet', 'Drawer', 'Command', 'Menubar'),
  },
  {
    section: 'Organisms',
    id: 'organisms-layout',
    name: 'Layout & data',
    description: 'Navigation, tables, carousels and toolbars.',
    items: organism('Sidebar', 'Table', 'Carousel', 'Toolbar', 'Code Block'),
  },
  {
    section: 'Organisms',
    id: 'organisms-conversation',
    name: 'Conversation',
    description: 'The thread and the answer’s content.',
    items: organism('Message Scroller', 'Content Block'),
  },
  // Agent Builder: ready-to-use agent experiences, grouped by context.
  {
    section: 'Agent Builder',
    id: 'builder-input',
    name: 'Input',
    description: 'The composer, dropping files and answering the agent’s questions.',
    items: [
      ...builder('Prompt Input', 'Clarifying Question', 'Drop Overlay'),
      alias('Attachment Menu', 'Agent Builder/Prompt Input'),
      alias('Response Controls', 'Agent Builder/Prompt Input'),
    ],
  },
  {
    section: 'Agent Builder',
    id: 'builder-messages',
    name: 'Messages',
    description: 'A full turn in the thread.',
    items: builder('Message Row'),
  },
  {
    section: 'Agent Builder',
    id: 'builder-status',
    name: 'Agent status',
    description: 'What the agent is doing: placeholders, reasoning and tool calls.',
    items: [
      ...builder('Streaming Placeholder', 'Thinking Panel', 'Tool Call Item', 'Tool Call Accordion'),
      alias('Typing Indicator', 'Agent Builder/Streaming Placeholder'),
    ],
  },
  {
    section: 'Agent Builder',
    id: 'builder-sources',
    name: 'Sources',
    description: 'Previews, cards and the full list of sources behind an answer.',
    items: builder('Citation Hovercard', 'Source Card', 'Citation Drawer'),
  },
  {
    section: 'Agent Builder',
    id: 'builder-memory',
    name: 'Memory',
    description: 'Thread instructions and what the agent remembers.',
    items: [
      ...builder('Instructions Banner', 'Memory Notice', 'Memory Manager'),
      alias('Memory Chip', 'Agent Builder/Memory Notice'),
      alias('Memory In Use', 'Agent Builder/Memory Notice'),
    ],
  },
  {
    section: 'Agent Builder',
    id: 'builder-actions',
    name: 'Actions',
    description: 'Approvals and connected apps.',
    items: builder('Approval Card', 'Connector Card'),
  },
  {
    section: 'Agent Builder',
    id: 'builder-widgets',
    name: 'Widgets & artifacts',
    description: 'Rich output inside the thread: files, data, media and artifacts.',
    items: [
      ...builder(
        'File Output Card',
        'Widget Metric Card',
        'Widget Media',
        'Widget Table',
        'Image Generation Card',
        'Artifact Panel',
      ),
      alias('Widget Audio', 'Agent Builder/Widget Media'),
      alias('Widget Metric Group', 'Agent Builder/Widget Metric Card'),
    ],
  },
  {
    section: 'Agent Builder',
    id: 'builder-feedback',
    name: 'Feedback',
    description: 'Asking the user how it went.',
    items: builder('Rating', 'Feedback Reason', 'NPS', 'Survey', 'Poll'),
  },
  {
    section: 'Agent Builder',
    id: 'builder-shell',
    name: 'Shell',
    description: 'The chat around the thread: welcome, starters, model picker, sharing and projects.',
    items: builder(
      'Welcome State',
      'Starter Prompt Card',
      'Model and Tools Picker',
      'Share Dialog',
      'Project Header',
      'Project Setup',
    ),
  },
  {
    section: 'Agent Builder',
    id: 'builder-patterns',
    name: 'Agent patterns',
    description: 'Task and commerce flows from the Figma Agent Patterns page.',
    items: builder(
      'Task Lifecycle',
      'Evidence & Decisions',
      'Catalog & Offers',
      'Scheduling',
      'Checkout',
      'After Purchase',
      'Trust & Preferences',
    ),
  },
  {
    section: 'Agent Builder',
    id: 'builder-surfaces',
    name: 'Surfaces & templates',
    description: 'Where the agent lives: full screen, side panel, popover, split canvas and more.',
    items: builder(
      'Full Screen',
      'Side Panel',
      'Popover & Launcher',
      'Split Canvas',
      'Inline Assist',
      'Command Palette',
      'Proactive',
      'Ambient Overlay',
    ),
  },
]
