import preview from '#.storybook/preview'
import { format } from 'date-fns'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Calendar } from './calendar'
import { DatePicker, DatePickerContent, DatePickerTrigger } from './date-picker'
import { Field, FieldLabel } from './field'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10944-397'

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Story: start with a value. */
  withValue?: boolean
  id?: string
}

function DemoDatePicker({ open, onOpenChange, withValue = false, id }: DemoProps) {
  const [date, setDate] = useState<Date | undefined>(withValue ? new Date(2026, 9, 15) : undefined)
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  return (
    <DatePicker open={isOpen} onOpenChange={setOpen}>
      <DatePickerTrigger id={id} placeholder="Placeholder" className="w-60">
        {date ? format(date, 'PPP') : undefined}
      </DatePickerTrigger>
      <DatePickerContent>
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date ?? new Date(2026, 9, 1)}
          onSelect={(next) => {
            setDate(next)
            setOpen(false)
          }}
        />
      </DatePickerContent>
    </DatePicker>
  )
}

const meta = preview.meta({
  title: 'Components/Date Picker',
  tags: ['ui-component'],
  component: DemoDatePicker,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '420px' },
      description: {
        component:
          'Pick a date: shadcn/ui’s Date Picker pattern — an outline Button with a calendar icon (`DatePickerTrigger`) opening a Calendar in a Popover (`DatePicker`, `DatePickerContent`). Format the value with date-fns. Give it a label with Field + FieldLabel.',
      },
    },
  },
  args: { open: false, withValue: false },
  argTypes: { onOpenChange: { table: { disable: true } }, id: { table: { disable: true } } },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Figma open=false: the trigger with its placeholder. */
export const Default = meta.story()

Default.test('the trigger opens the calendar; a day sets the value', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Placeholder/ }))
  const grid = await body(canvasElement).findByRole('grid')
  await userEvent.click(within(grid).getByRole('button', { name: /October 20th, 2026/ }))
  await waitFor(() => expect(body(canvasElement).queryByRole('grid')).toBeNull())
  await expect(canvas.getByRole('button', { name: /October 20th, 2026/ })).toBeInTheDocument()
})

/** Figma open=true. */
export const Open = meta.story({ args: { open: true, withValue: true } })

/** With a label (Field + FieldLabel). */
export const InField = meta.story({
  render: () => (
    <Field className="w-60">
      <FieldLabel htmlFor="date-picker-field">Label</FieldLabel>
      <DemoDatePicker id="date-picker-field" />
    </Field>
  ),
})
