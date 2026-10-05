// Everything Anvil UI covers, grouped like the Figma file and docs/roadmap.md. Whether an item is
// available (and where it links) is read from Storybook's index at runtime, so this list only
// changes when the scope changes. `title` is the Storybook title the item has (or will have).

export type CatalogItem = { name: string; title: string }
export type CatalogArea = {
  id: string
  name: string
  description: string
  items: CatalogItem[]
}

const c = (name: string, title = `Components/${name}`): CatalogItem => ({ name, title })
const f = (name: string): CatalogItem => ({ name, title: `Foundations/${name}` })
const a = (name: string, group = 'Primitives'): CatalogItem => ({
  name,
  title: `Agent Builder/${group}/${name}`,
})
const ag = (name: string): CatalogItem => ({ name, title: `Agent Builder/${name}` })
const kit = (section: string, names: string[]): CatalogItem[] =>
  names.map((name) => ({ name, title: `Agent Builder/Core Kit/${section}/${name}` }))

export const catalog: CatalogArea[] = [
  {
    id: 'foundations',
    name: 'Foundations',
    description: 'Tokens pulled from Figma: color, type, spacing, radius, elevation and icons.',
    items: [f('Colors'), f('Typography'), f('Spacing'), f('Radius'), f('Elevation'), f('Icon')],
  },
  {
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
      c('Link', 'Anvil/Link'),
      c('Badge'),
      c('Kbd'),
    ],
  },
  {
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
    id: 'navigation',
    name: 'Navigation',
    description: 'Moving between views, sections and pages.',
    items: [c('Sidebar'), c('Tabs'), c('Breadcrumb'), c('Pagination'), c('Accordion')],
  },
  {
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
  {
    id: 'agent',
    name: 'Agent Builder',
    description:
      'Parts for conversational agents. Primitives (shadcn chat set) build the Core Kit; patterns, surfaces and templates compose it.',
    items: [
      a('Message'),
      a('Bubble'),
      a('Attachment'),
      a('Marker'),
      a('Message Scroller'),
      ag('Agent Patterns'),
      ag('Surfaces'),
      ag('Templates'),
    ],
  },
  {
    id: 'kit-shell',
    name: 'Core Kit · Shell',
    description: 'The chat around the thread: welcome, model picker, sharing and projects.',
    items: kit('Shell', [
      'Starter Prompt Card',
      'Welcome State',
      'Model and Tools Picker',
      'Share Dialog',
      'Project Setup',
      'Project Header',
    ]),
  },
  {
    id: 'kit-input',
    name: 'Core Kit · Input',
    description: 'Composing a prompt: text, files, voice and suggested replies.',
    items: [
      ...kit('Input', ['Prompt Input']),
      // Figma prompt attachment = the Attachment primitive.
      { name: 'Prompt Attachment', title: 'Agent Builder/Primitives/Attachment' },
      ...kit('Input', [
        'Voice Waveform',
        'Live Voice Session',
        'Quick Reply',
        'Quick Reply Group',
        'Follow-up Suggestions',
        'Attachment Menu',
        'Drop Overlay',
        'Mic Button',
        'Response Controls',
        'Clarifying Question',
      ]),
    ],
  },
  {
    id: 'kit-messages',
    name: 'Core Kit · Messages',
    description: 'A turn in the thread and what it contains.',
    items: kit('Messages', [
      'Message Row',
      'Message Edit',
      'Message Actions',
      'Regenerate Menu',
      'Content Block',
      'File Output Card',
      'Tool Log Line',
      'Streaming Placeholder',
    ]),
  },
  {
    id: 'kit-states',
    name: 'Core Kit · Agent states',
    description: 'What the agent is doing right now: thinking, typing, calling tools.',
    items: kit('Agent States', [
      'Pulse Dot',
      'Text Shimmer',
      'Typing Indicator',
      'Thinking Panel',
      'Tool Call Item',
      'Tool Call Accordion',
    ]),
  },
  {
    id: 'kit-sources',
    name: 'Core Kit · Sources',
    description: 'Citations and the sources behind an answer.',
    items: kit('Sources', [
      'Citation Chip',
      'Citation Hovercard',
      'Citation Drawer',
      'Citation Source Item',
      'Source Card',
    ]),
  },
  {
    id: 'kit-system',
    name: 'Core Kit · System & context',
    description: 'Notices, approvals, memory and connected apps.',
    items: kit('System & Context', [
      'System Banner',
      'Approval Card',
      'Memory Chip',
      'Memory Manager',
      'Connector Card',
      'Instructions Banner',
      'Memory in Use',
    ]),
  },
  {
    id: 'kit-widgets',
    name: 'Core Kit · Widgets & artifacts',
    description: 'Rich output inside the thread: metrics, tables, media and artifacts.',
    items: kit('Widgets & Artifacts', [
      'Artifact Panel',
      'Widget Metric Card',
      'Widget Metric Group',
      'Widget Table',
      'Widget Media',
      'Widget Audio',
      'Image Generation Card',
    ]),
  },
  {
    id: 'kit-feedback',
    name: 'Core Kit · Feedback & surveys',
    description: 'Asking the user how it went.',
    items: kit('Feedback & Surveys', ['Feedback Reason', 'Rating', 'NPS', 'Survey', 'Poll']),
  },
]
