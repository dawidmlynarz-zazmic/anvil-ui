import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { AccessibilityIcon } from '@/components/ui/icon'

import { SlotList, type Slot } from './slot-list'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-16284'

const SLOTS: Slot[] = [
  {
    id: '1430',
    time: '14:30',
    label: 'Matinee',
    price: '$29 – $95',
    availability: 'limited',
    availabilityLabel: '12 seats left',
    badge: (
      <Badge variant="subtle" tone="neutral" size="sm">
        Captioned
      </Badge>
    ),
  },
  {
    id: '1930',
    time: '19:30',
    label: 'Evening',
    price: '$39 – $125',
    availability: 'good',
    availabilityLabel: 'Good availability',
  },
  {
    id: '2200',
    time: '22:00',
    label: 'Late',
    price: '$29 – $79',
    availability: 'sold-out',
    availabilityLabel: 'Sold out',
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Slot List',
  tags: ['agent-builder'],
  component: SlotList,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state (time slot)',
        values: 'default · hover · selected · disabled · focus',
        code: 'Choice Card selectors; selected is the radio, sold-out slots are `disabled`',
      },
      {
        property: 'state (slot list)',
        values: 'loaded · loading · empty',
        code: '`status` prop (plus `error`)',
      },
      {
        property: 'time · label · price · availability · badge',
        values: 'text',
        code: '`Slot` `time` · `label` · `price` · `availabilityLabel` · `badge`',
      },
      { property: 'change date', values: 'button', code: '`changeDateLabel` + `onChangeDate`' },
    ],
    guide: {
      use: [
        'The times on a date the user has already chosen: tours, appointments, delivery windows, shows.',
        'Show the price range and what is left on every slot, and disable the ones that are gone instead of hiding them.',
        'Always offer “Change date” so a poor day is one tap from a better one.',
      ],
      avoid: [
        'Choosing the date: use Availability Calendar.',
        'More than about eight slots: group by part of the day or use a Select.',
        'Slots that do not exclude each other: use checkbox Choice Cards.',
      ],
      content: [
        'The title is the date in full (“Saturday 17 October”); the line under it says where and how many options.',
        'Availability is written (“Good availability”, “12 seats left”, “Sold out”); `note` carries day-specific access or policy.',
        'Empty copy points to the next day with openings and offers it (“See Thursday”).',
      ],
      a11y: [
        'The slots are a radio group named by the date; each is a Choice Card whose name reads time, label, price and availability.',
        'Sold-out slots are disabled and say so in text; loading is a status region.',
      ],
    },
    docs: {
      description: {
        component:
          'The times on a chosen date (`@/components/agent/slot-list`): a header (`title`, `subtitle`, “Change date”), an optional `note`, and `slots` as radio Choice Cards with the price and availability. `value` / `defaultValue` / `onValueChange` choose the slot; `status` loaded · loading · empty · error. Built on Card, Radio Group, Choice Card, Marker, Button, Skeleton and Empty State.',
      },
    },
  },
  args: {
    title: 'Saturday 17 October',
    subtitle: 'Lyric Hall · 3 options',
    note: 'The 14:30 matinee is captioned. Relaxed performance on 1 Nov.',
    noteIcon: AccessibilityIcon,
    slots: SLOTS,
    defaultValue: '1930',
    status: 'loaded' as const,
    emptyDescription: 'The next day with openings is Thursday.',
    emptyActionLabel: 'See Thursday',
    errorDescription: 'Times didn’t load. Your date choice is kept.',
    onChangeDate: fn(),
    onValueChange: fn(),
    onEmptyAction: fn(),
    onRetry: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    note: { control: 'text' },
    status: { control: 'inline-radio', options: ['loaded', 'loading', 'empty', 'error'] },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    emptyActionLabel: { control: 'text' },
    errorTitle: { control: 'text' },
    errorDescription: { control: 'text' },
    slots: { control: false },
    noteIcon: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChangeDate: { control: false, table: { category: 'Events' } },
    onValueChange: { control: false, table: { category: 'Events' } },
    onEmptyAction: { control: false, table: { category: 'Events' } },
    onRetry: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story) => (
      <div className="w-145 max-w-full">
        <Story />
      </div>
    ),
  ],
})

/** Loaded with the evening slot chosen; loading, empty and error are in Controls. */
export const Default = meta.story()

Default.test('choosing a slot, change date, sold out is disabled', async ({ canvas, args }) => {
  await expect(canvas.getByRole('radio', { name: /19:30/ })).toBeChecked()
  await expect(canvas.getByRole('radio', { name: /22:00/ })).toBeDisabled()
  await userEvent.click(canvas.getByText('14:30'))
  await expect(args.onValueChange).toHaveBeenCalledWith('1430')
  await userEvent.click(canvas.getByRole('button', { name: 'Change date' }))
  await expect(args.onChangeDate).toHaveBeenCalledOnce()
})

/** Figma state: loading · empty, and error. */
export const States = meta.story({
  decorators: [],
  render: (args) => (
    <div className="flex w-145 max-w-full flex-col gap-6">
      <SlotList {...args} title="Loading times" status="loading" />
      <SlotList {...args} title="No times" status="empty" />
      <SlotList {...args} title="Times failed" status="error" />
    </div>
  ),
})
