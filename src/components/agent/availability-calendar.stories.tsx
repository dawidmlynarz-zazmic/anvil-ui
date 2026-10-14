import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { AvailabilityCalendar, type AvailabilityMap } from './availability-calendar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10668-16157'

// October 2026: sold out on the 10th and 24th, limited at the end of each week, from $29.
function october(): AvailabilityMap {
  const map: AvailabilityMap = {}
  for (let day = 3; day <= 31; day += 1) {
    const key = `2026-10-${String(day).padStart(2, '0')}`
    if (day === 10 || day === 24) map[key] = { level: 'unavailable' }
    else if (day % 7 === 2 || day === 9 || day === 16 || day === 30)
      map[key] = { level: 'limited', price: day === 16 || day === 30 ? '$45' : '$39' }
    else map[key] = { level: 'available', price: '$29' }
  }
  return map
}
const AVAILABILITY = october()
const OCT = new Date(2026, 9, 1)

const meta = preview.meta({
  title: 'Agent Builder/Catalog & scheduling/Availability Calendar',
  tags: ['agent-builder'],
  component: AvailabilityCalendar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'availability (availability day)',
        values: 'available · limited · unavailable · none',
        code: '`availability` map: `level` available · limited · unavailable; a day with no entry is none',
      },
      {
        property: 'state (availability day)',
        values: 'default · selected · today · hover · focus',
        code: '`selected` · `today` · `hover:` / focus selectors',
      },
      {
        property: 'state (date picker)',
        values: 'loaded · loading · empty',
        code: '`status` prop (plus `error`)',
      },
    ],
    guide: {
      use: [
        'Choosing a date when availability and price differ by day: tickets, stays, appointments, deliveries.',
        'Give `availability` for the month shown (`yyyy-MM-dd` → level and from-price); keep the legend so the bars are explained.',
        'Follow with Slot List for the times on the chosen day.',
      ],
      avoid: [
        'A plain date with no availability: use Date Picker.',
        'A date range with availability on each night: pass a range-aware Calendar instead.',
        'Choosing a time: use Slot List.',
      ],
      content: [
        'The title is the month; the line under it names the item and place (“Paper Kingdoms · Lyric Hall”).',
        'Prices are from-prices (“$29”) and the legend says so (“Prices from, per ticket”).',
        'Empty copy says when availability resumes and offers to jump there (“Go to November”).',
      ],
      a11y: [
        'Each day is a button named with its date and availability (“Saturday 17 October, limited, $39”); days without availability are disabled. Availability is also written (“Sold out”), never colour alone.',
        'Arrow keys move between days; Previous / Next month are labelled buttons; loading is a status region.',
      ],
    },
    docs: {
      description: {
        component:
          'A month with per-day availability and from-price (`@/components/agent/availability-calendar`): the shadcn Calendar (react-day-picker) with a custom day button, a header with Previous / Next month, a legend and loaded · loading · empty · error states. `availability` maps `yyyy-MM-dd` to `{ level, price }`; `month`, `selected` and `onSelect` are controlled or not. Built on Card, Calendar, Legend Item, Button, Skeleton and Empty State.',
      },
    },
  },
  args: {
    defaultMonth: OCT,
    today: OCT,
    availability: AVAILABILITY,
    subtitle: 'Paper Kingdoms · Lyric Hall',
    legendNote: 'Prices from, per ticket',
    status: 'loaded' as const,
    emptyDescription: 'The next availability starts in November.',
    emptyActionLabel: 'Go to November',
    errorDescription: 'Availability didn’t load. Your selection is kept.',
    onSelect: fn(),
    onMonthChange: fn(),
    onEmptyAction: fn(),
    onRetry: fn(),
  },
  argTypes: {
    subtitle: { control: 'text' },
    status: { control: 'inline-radio', options: ['loaded', 'loading', 'empty', 'error'] },
    legend: { control: 'boolean' },
    legendNote: { control: 'text' },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    emptyActionLabel: { control: 'text' },
    errorTitle: { control: 'text' },
    errorDescription: { control: 'text' },
    availability: { control: false },
    month: { control: false },
    defaultMonth: { control: false },
    selected: { control: false },
    today: { control: false },
    onSelect: { control: false, table: { category: 'Events' } },
    onMonthChange: { control: false, table: { category: 'Events' } },
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

/** October 2026; loading, empty and error are in Controls. */
export const Default = meta.story()

Default.test('picks a day, names its availability, moves between months', async ({ canvas, args }) => {
  await expect(canvas.getByRole('heading', { name: 'October 2026' })).toBeVisible()
  await expect(canvas.getByRole('button', { name: /Saturday 10 October, Sold out/ })).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: /Saturday 17 October/ }))
  await expect(args.onSelect).toHaveBeenCalled()
  await userEvent.click(canvas.getByRole('button', { name: 'Next month' }))
  await expect(canvas.getByRole('heading', { name: 'November 2026' })).toBeVisible()
  await expect(args.onMonthChange).toHaveBeenCalled()
})

function Picking() {
  const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 9, 17))
  return (
    <AvailabilityCalendar
      defaultMonth={OCT}
      today={OCT}
      availability={AVAILABILITY}
      selected={selected}
      onSelect={setSelected}
      subtitle="Paper Kingdoms · Lyric Hall"
      legendNote="Prices from, per ticket"
    />
  )
}

/** A selected day (Figma availability day selected). */
export const Selected = meta.story({
  decorators: [],
  render: () => (
    <div className="w-145 max-w-full">
      <Picking />
    </div>
  ),
})

/** Figma state: loading · empty, and error. */
export const States = meta.story({
  decorators: [],
  render: (args) => (
    <div className="flex w-145 max-w-full flex-col gap-6">
      <AvailabilityCalendar {...args} title="Loading" status="loading" />
      <AvailabilityCalendar {...args} title="Empty" status="empty" />
      <AvailabilityCalendar {...args} title="Error" status="error" />
    </div>
  ),
})
