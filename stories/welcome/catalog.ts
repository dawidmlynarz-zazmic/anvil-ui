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
const a = (name: string): CatalogItem => ({ name, title: `Agent/${name}` })

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
      c('Link'),
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
    items: [c('Alert'), c('Toast'), c('Progress'), c('Skeleton'), c('Empty'), c('Status Badge')],
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
    description: 'Parts for conversational agents: messages, attachments, markers and surfaces.',
    items: [
      a('Message'),
      a('Bubble'),
      a('Attachment'),
      a('Marker'),
      a('Message Scroller'),
      a('Agent Patterns'),
      a('Surfaces'),
      a('Templates'),
    ],
  },
]
