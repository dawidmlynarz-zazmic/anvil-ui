import preview from '#.storybook/preview'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Calendar } from './calendar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10944-273'
// A fixed month so stories and tests do not change with the date.
const MONTH = new Date(2026, 9, 1)

type DemoProps = {
  /** Figma `mode`. */
  mode?: 'single' | 'range'
  numberOfMonths?: number
  showOutsideDays?: boolean
  captionLayout?: 'label' | 'dropdown'
  disablePast?: boolean
}

function DemoCalendar({
  mode = 'single',
  numberOfMonths = 1,
  showOutsideDays = true,
  captionLayout = 'label',
  disablePast = false,
}: DemoProps) {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 15))
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 12),
    to: new Date(2026, 9, 16),
  })
  const shared = {
    defaultMonth: MONTH,
    today: new Date(2026, 9, 5),
    numberOfMonths,
    showOutsideDays,
    captionLayout,
    disabled: disablePast ? { before: new Date(2026, 9, 5) } : undefined,
    startMonth: new Date(2026, 0, 1),
    endMonth: new Date(2027, 11, 31),
  }
  return mode === 'range' ? (
    <Calendar mode="range" selected={range} onSelect={setRange} {...shared} />
  ) : (
    <Calendar mode="single" selected={date} onSelect={setDate} {...shared} />
  )
}

const meta = preview.meta({
  title: 'Molecules/Calendar',
  tags: ['molecule'],
  component: DemoCalendar,
  parameters: {
    shadcn: 'calendar',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'mode', values: 'single · range', code: '`mode` prop (react-day-picker; also `multiple`)' },
    ],
    docs: {
      description: {
        component:
          'A month grid (shadcn/ui Calendar on react-day-picker): `mode` single · range (· multiple), `numberOfMonths`, `captionLayout` label or dropdown, `disabled` days. Arrow keys move between days, PageUp / PageDown between months. Inside a Popover it is the Date Picker.',
      },
    },
  },
  args: {
    mode: 'single',
    numberOfMonths: 1,
    showOutsideDays: true,
    captionLayout: 'label',
    disablePast: false,
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['single', 'range'] },
    numberOfMonths: { control: 'inline-radio', options: [1, 2] },
    captionLayout: { control: 'inline-radio', options: ['label', 'dropdown'] },
    showOutsideDays: { control: 'boolean' },
    disablePast: { control: 'boolean' },
  },
})

export const Default = meta.story()

Default.test('a day is selected; clicking another selects it', async ({ canvas }) => {
  const grid = canvas.getByRole('grid')
  await expect(within(grid).getByRole('button', { name: /October 15th, 2026/ })).toHaveAttribute(
    'data-selected-single',
    'true',
  )
  await userEvent.click(within(grid).getByRole('button', { name: /October 20th, 2026/ }))
  await waitFor(() =>
    expect(
      within(canvas.getByRole('grid')).getByRole('button', { name: /October 20th, 2026/ }),
    ).toHaveAttribute('data-selected-single', 'true'),
  )
})

Default.test('arrow keys move between days', async ({ canvas }) => {
  within(canvas.getByRole('grid'))
    .getByRole('button', { name: /October 15th, 2026/ })
    .focus()
  await userEvent.keyboard('{ArrowRight}')
  await expect(canvas.getByRole('button', { name: /October 16th, 2026/ })).toHaveFocus()
})

/** Figma mode=range: start, middle and end. */
export const Range = meta.story({ args: { mode: 'range' } })

/** Two months side by side. */
export const TwoMonths = meta.story({ args: { mode: 'range', numberOfMonths: 2 } })

/** Disabled (past) days and the month / year dropdowns. */
export const Disabled = meta.story({ args: { disablePast: true, captionLayout: 'dropdown' } })

Disabled.test('past days cannot be picked', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: /October 2nd, 2026/ })).toBeDisabled()
})
