import preview from '#.storybook/preview'
import { format } from 'date-fns'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Calendar } from './calendar'
import { DatePicker, DatePickerContent, DatePickerTrigger } from './date-picker'
import { Field, FieldLabel } from './field'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10944-397'

type DemoProps = {
  /** Calendar `mode`: one date, or a start and end date. */
  mode?: 'single' | 'range'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Story: start with a value. */
  withValue?: boolean
  id?: string
}

/** Formats a range for the trigger: “Oct 1 – Oct 14, 2026”, or the start while the end is open. */
function formatRange(range: DateRange | undefined) {
  if (!range?.from) return undefined
  // react-day-picker sets the end to the start on the first click: still picking the end.
  if (!range.to || range.to.getTime() === range.from.getTime())
    return `${format(range.from, 'MMM d, yyyy')} – …`
  return `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d, yyyy')}`
}

function DemoDatePicker({ mode = 'single', open, onOpenChange, withValue = false, id }: DemoProps) {
  const [date, setDate] = useState<Date | undefined>(withValue ? new Date(2026, 9, 15) : undefined)
  const [range, setRange] = useState<DateRange | undefined>(
    withValue ? { from: new Date(2026, 9, 1), to: new Date(2026, 9, 14) } : undefined,
  )
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  return (
    <DatePicker open={isOpen} onOpenChange={setOpen}>
      <DatePickerTrigger
        id={id}
        placeholder={mode === 'range' ? 'Pick a date range' : 'Pick a date'}
        className={mode === 'range' ? 'w-72' : 'w-60'}
      >
        {mode === 'range' ? formatRange(range) : date ? format(date, 'PPP') : undefined}
      </DatePickerTrigger>
      <DatePickerContent>
        {mode === 'range' ? (
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            defaultMonth={range?.from ?? new Date(2026, 9, 1)}
            onSelect={(next) => {
              setRange(next)
              // Close once both ends are picked (a second click on the start day keeps it open).
              if (next?.from && next.to && next.from.getTime() !== next.to.getTime()) setOpen(false)
            }}
          />
        ) : (
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date ?? new Date(2026, 9, 1)}
            onSelect={(next) => {
              setDate(next)
              setOpen(false)
            }}
          />
        )}
      </DatePickerContent>
    </DatePicker>
  )
}

const meta = preview.meta({
  title: 'Molecules/Date Picker',
  tags: ['molecule'],
  component: DemoDatePicker,
  parameters: {
    shadcn: 'date-picker',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'open', values: 'false · true', code: '`open` prop on `DatePicker` (Popover root)' },
      {
        property: 'calendar · mode',
        values: 'single · range',
        code: 'the Calendar inside: `mode="single"` or `mode="range"` (+ `numberOfMonths={2}`)',
      },
    ],
    guide: {
      use: [
        'A date field in a form or filter: “Send on” (single), “Report period” (range).',
        'Range: put `mode="range"` and `numberOfMonths={2}` on the Calendar; the first click sets the start, the second the end, and the popover closes once both are set. Show “Oct 1 – Oct 14, 2026” on the trigger, and the start with “– …” while the end is still open.',
        'When the value matters more than the month view; the Calendar opens only on demand.',
      ],
      avoid: [
        'When the calendar is the main content: use Calendar inline.',
        'Relative choices (“Last 7 days”, “This quarter”): use Select or Toggle Group presets.',
      ],
      content: [
        'The trigger shows the formatted value (“October 15th, 2026” · “Oct 1 – Oct 14, 2026”) or a hint (“Pick a date”, “Pick a date range”) when empty.',
        'Label it with `Field` + `FieldLabel`; add a description for limits (“Weekdays only”).',
      ],
      a11y: [
        'The trigger is a Button; the popover is a `dialog` named by the trigger and traps focus.',
        'Escape closes it and returns focus to the trigger; arrow keys move between days.',
      ],
    },
    docs: {
      story: { inline: false, height: '420px' },
      description: {
        component:
          'Pick a date or a date range: shadcn/ui’s Date Picker pattern — an outline Button with a calendar icon (`DatePickerTrigger`) opening a Calendar in a Popover (`DatePicker`, `DatePickerContent`). Single selection uses `mode="single"` and closes on pick; range selection uses `mode="range"` with two months and closes once the end is picked. States: empty (placeholder), open, a value, a range in progress (start only), a complete range; disabled days come from the Calendar. Format the value with date-fns. Give it a label with Field + FieldLabel.',
      },
    },
  },
  args: { mode: 'single' as const, open: false, withValue: false },
  argTypes: {
    mode: { control: 'inline-radio', options: ['single', 'range'] },
    open: { control: 'boolean' },
    withValue: { control: 'boolean', description: 'Story: start with a value' },
    onOpenChange: { control: false, table: { category: 'Events' } },
    id: { table: { disable: true } },
  },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Figma open=false: the trigger with its placeholder. */
export const Default = meta.story()

Default.test('the trigger opens the calendar; a day sets the value', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Pick a date/ }))
  const grid = await body(canvasElement).findByRole('grid')
  await userEvent.click(within(grid).getByRole('button', { name: /October 20th, 2026/ }))
  await waitFor(() => expect(body(canvasElement).queryByRole('grid')).toBeNull())
  await expect(canvas.getByRole('button', { name: /October 20th, 2026/ })).toBeInTheDocument()
})

/** Figma open=true. */
export const Open = meta.story({ args: { open: true, withValue: true } })

/** Range selection: two months; the first pick sets the start, the second the end. */
export const Range = meta.story({ args: { mode: 'range' } })

Range.test('picks a start and an end, then closes', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Pick a date range/ }))
  const grids = await body(canvasElement).findAllByRole('grid')
  await expect(grids).toHaveLength(2)
  await userEvent.click(within(grids[0]).getByRole('button', { name: /October 5th, 2026/ }))
  await expect(canvas.getByRole('button', { name: /Oct 5, 2026 – …/ })).toBeInTheDocument()
  // The calendar re-renders after the first pick: query it again.
  const [october] = await body(canvasElement).findAllByRole('grid')
  await userEvent.click(within(october).getByRole('button', { name: /October 12th, 2026/ }))
  await waitFor(() => expect(body(canvasElement).queryAllByRole('grid')).toHaveLength(0))
  await expect(canvas.getByRole('button', { name: /Oct 5 – Oct 12, 2026/ })).toBeInTheDocument()
})

/** A chosen range, open: start and end in --primary, the days between in --accent. */
export const RangeOpen = meta.story({ args: { mode: 'range', open: true, withValue: true } })

/** With a label (Field + FieldLabel): “Send on” and “Report period”. */
export const InField = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <Field className="w-60">
        <FieldLabel htmlFor="date-picker-send">Send on</FieldLabel>
        <DemoDatePicker id="date-picker-send" />
      </Field>
      <Field className="w-72">
        <FieldLabel htmlFor="date-picker-period">Report period</FieldLabel>
        <DemoDatePicker id="date-picker-period" mode="range" />
      </Field>
    </div>
  ),
})
