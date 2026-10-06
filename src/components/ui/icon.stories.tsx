import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from './button'
import {
  ArrowRightIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  CopyIcon,
  Icon,
  InfoIcon,
  type LucideIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=6294-8671'
const GLYPHS: [string, LucideIcon][] = [
  ['check', CheckIcon],
  ['x', XIcon],
  ['plus', PlusIcon],
  ['chevron-down', ChevronDownIcon],
  ['arrow-right', ArrowRightIcon],
  ['search', SearchIcon],
  ['settings', SettingsIcon],
  ['bell', BellIcon],
  ['copy', CopyIcon],
  ['trash-2', Trash2Icon],
  ['info', InfoIcon],
  ['circle-alert', CircleAlertIcon],
  ['sparkles', SparklesIcon],
]
const tones = ['neutral', 'brand', 'info', 'success', 'warning', 'destructive', 'agent'] as const

const meta = preview.meta({
  title: 'Design System/Atoms/Icon',
  tags: ['atom'],
  component: Icon,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    // Figma: the Icons (Lucide) page has glyphs only, no component properties.
    figmaProps: [],
    guide: {
      use: [
        'Every icon in the kit: inside Button, Badge, menus and agent components, or on its own next to text.',
        'Leave `size` unset inside components (they size their icons); set `size` xs (12px) or default (16px) only when it stands alone.',
        '`tone` for status and agent colours; otherwise it inherits the text colour.',
      ],
      avoid: [
        'Importing from `lucide-react` directly (ESLint blocks it): the stroke and size would drift from Figma.',
        'An icon on a tinted square or circle: use Icon Tile. An icon-only action: use Button `size="icon*"` with `aria-label`.',
      ],
      content: [
        'Pick the glyph that names the action or object (pencil = edit, trash = delete); keep one glyph per meaning across the product.',
      ],
      a11y: [
        'Decorative by default (`aria-hidden`): the text beside it names the thing.',
        'When the icon alone carries meaning, pass `label` (it becomes `role="img"` with that name).',
        'Colour never carries meaning alone: pair a status tone with text.',
      ],
    },
    docs: {
      description: {
        component:
          'The one icon abstraction: Lucide glyphs rendered at 16px with a constant 1.33px stroke (Figma Icons page). Import the component and glyphs from `@/components/ui/icon` — never from `lucide-react` (ESLint enforces it). Decorative by default (`aria-hidden`); pass `label` when the icon alone carries meaning. Without `size`, a container such as Button sizes it; `size` xs (12) · default (16) forces it. `tone` uses the status / agent base tones.',
      },
    },
  },
  args: { icon: SparklesIcon },
  argTypes: {
    icon: { table: { disable: true } },
    size: { control: 'inline-radio', options: [undefined, 'xs', 'default'] },
    tone: { control: 'select', options: tones },
    label: { control: 'text', description: 'Accessible name; without it the icon is decorative' },
    className: { table: { disable: true } },
  },
})

/** `size`, `tone` and `label` are in Controls. */
export const Default = meta.story()

Default.test('is decorative, 16px with a 1.33px stroke', async ({ canvasElement }) => {
  const svg = canvasElement.querySelector('[data-slot=icon]')!
  await expect(svg).toHaveAttribute('aria-hidden', 'true')
  await expect(svg.getAttribute('width')).toBe('16')
  await expect(svg.getAttribute('stroke-width')).toBe('1.33')
})

/** A few Lucide glyphs at the default 16px (the Figma library holds the full Lucide set). */
export const Glyphs = meta.story({
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-4">
      {GLYPHS.map(([name, glyph]) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-md p-3 inset-ring inset-ring-overlay-8"
        >
          <Icon icon={glyph} />
          <span className="type-code-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
})

/** `size` xs (12px) · default (16px); the stroke stays 1.33px. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex items-center gap-4 text-foreground">
      <Icon icon={SparklesIcon} size="xs" />
      <Icon icon={SparklesIcon} size="default" />
    </div>
  ),
})

/** `tone` maps to the status and agent base tones (Figma: "fills, icons"). */
export const Tones = meta.story({
  render: () => (
    <div className="flex items-center gap-4">
      {tones.map((tone) => (
        <Icon key={tone} icon={CircleAlertIcon} tone={tone} />
      ))}
    </div>
  ),
})

/** With `label` the icon is announced (role="img"); without it, it is hidden from assistive tech. */
export const Accessible = meta.story({
  args: { icon: CircleAlertIcon, label: 'Label', tone: 'destructive' },
})

Accessible.test('is announced with its label', async ({ canvas }) => {
  await expect(canvas.getByRole('img', { name: 'Label' })).toBeInTheDocument()
})

/** Inside components the container sizes the icon: Button xs → 12px, other sizes → 16px. */
export const InComponents = meta.story({
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="xs">
        <Icon icon={PlusIcon} />
        Add
      </Button>
      <Button size="sm">
        <Icon icon={PlusIcon} />
        Add
      </Button>
      <Button size="icon" variant="outline" intent="neutral" aria-label="Settings">
        <Icon icon={SettingsIcon} />
      </Button>
    </div>
  ),
})

InComponents.test('the container sizes the icon; the stroke stays constant', async ({ canvasElement }) => {
  const [xs, sm] = canvasElement.querySelectorAll('[data-slot=icon]')
  await expect(xs.getBoundingClientRect().width).toBe(12)
  await expect(sm.getBoundingClientRect().width).toBe(16)
  // Constant 1.33px stroke at both sizes (Figma), via non-scaling-stroke.
  for (const svg of [xs, sm]) {
    await expect(getComputedStyle(svg.firstElementChild!).vectorEffect).toBe('non-scaling-stroke')
  }
})
