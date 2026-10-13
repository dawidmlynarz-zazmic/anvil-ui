import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Input } from '@/components/ui/input'

import { ElementSpotlight } from './element-spotlight'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10752-6557'

const STATUSES = ['referenced', 'filling', 'filled', 'review'] as const
const LABELS = {
  referenced: 'Northwind Labs is looking here',
  filling: 'Filling…',
  filled: 'Filled from your profile',
  review: 'Check this',
} as const

const meta = preview.meta({
  title: 'Agent Builder/In-page assist/Element Spotlight',
  tags: ['agent-builder'],
  component: ElementSpotlight,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'referenced · filling · filled · needs review',
        code: '`status` prop: referenced · filling · filled · review',
      },
      { property: 'tag text', values: 'text', code: '`label` prop (each status has a default)' },
      {
        property: 'size',
        values: 'resize to the element',
        code: 'wrap the element (`children`) or size it from the host',
      },
    ],
    guide: {
      use: [
        'To show which element of the host page the assistant is reading or filling, so people can follow along.',
        'Move through the statuses as work progresses: referenced → filling → filled, or review when the value needs a check.',
        'Pair it with Co-browse Bar, which holds Pause and Stop while the assistant acts.',
      ],
      avoid: [
        'A tooltip or a tour step: use Popover.',
        'Dimming the rest of the page: that is the overlay scrim, not this.',
        'Highlighting more than one element at a time; it becomes noise.',
      ],
      content: [
        'The tag says who or what: “Northwind Labs is looking here”, “Filled from your profile”, “Check this”.',
        'Keep it to a few words; it sits above the element and must not cover its label.',
      ],
      a11y: [
        'The tag is a polite status, so a new state is announced without moving focus.',
        'Colour is never the only signal: each status has its own glyph and words.',
        'The highlight does not block the element: it stays operable by keyboard and pointer.',
      ],
    },
    docs: {
      description: {
        component:
          'A highlight around an element on the host page (`@/components/agent/element-spotlight`): `status` referenced · filling · filled · review draws a 2px border in the status colour and a pill tag 6px above, right-aligned, with the `label`. Wrap the element, or size it from the host.',
      },
    },
  },
  args: { status: 'referenced', label: LABELS.referenced },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    label: { control: 'text' },
    children: { control: false },
  },
  render: (args) => (
    <div className="w-90 pt-8">
      <ElementSpotlight {...args}>
        <Input aria-label="Email" defaultValue="maya.chen@northwind.example" className="border-0" />
      </ElementSpotlight>
    </div>
  ),
})

/** Status and the tag text are in Controls. */
export const Default = meta.story()

Default.test('names its state in the tag', async ({ canvas }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Northwind Labs is looking here')
})

/** Figma state: referenced, filling, filled, needs review. */
export const Statuses = meta.story({
  render: () => (
    <div className="grid w-200 grid-cols-2 gap-x-10 gap-y-12 pt-8">
      {STATUSES.map((status) => (
        <ElementSpotlight key={status} status={status} label={LABELS[status]}>
          <Input
            aria-label={`Email, ${status}`}
            defaultValue="maya.chen@northwind.example"
            className="border-0"
          />
        </ElementSpotlight>
      ))}
    </div>
  ),
})

Statuses.test('each status says what it is', async ({ canvas }) => {
  await expect(canvas.getAllByRole('status')).toHaveLength(4)
  await expect(canvas.getByText('Filled from your profile')).toBeVisible()
  await expect(canvas.getByText('Check this')).toBeVisible()
})
