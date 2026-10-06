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
  title: 'Design System/Molecules/Calendar',
  tags: ['molecule'],
  component: DemoCalendar,
  parameters: {
    shadcn: 'calendar',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'mode', values: 'single · range', code: '`mode` prop (react-day-picker; also `multiple`)' },
    ],
    guide: {
      use: [
        'Choosing a date or range when seeing the month helps: scheduling a launch review, picking a report period.',
        'Inline in a panel or Card when the calendar is the main task; inside a Popover it becomes the Date Picker.',
        '`disabled` days for dates that can’t be chosen (past dates, weekends) instead of failing on submit.',
      ],
      avoid: [
        'A compact form field: use Date Picker. Well-known dates far away (a birth date): a Text field with a format hint is faster.',
        'Picking a time: pair it with a time Select or Text field; Calendar has no time.',
      ],
      content: [
        'Show the chosen value outside the grid in a readable format (“Tue, Oct 14”), formatted with date-fns.',
        'Explain why days are disabled in a nearby description.',
      ],
      a11y: [
        'Arrow keys move between days, PageUp / PageDown between months, Home / End to the week edges.',
        'Days are buttons with full-date labels; today and the selection are announced, not only colored.',
      ],
    },
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
