import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from './button'
import { Checkbox } from './checkbox'
import { Icon, PencilIcon, Trash2Icon } from './icon'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8254-1575'
/** Q3 launch tasks (Issue Tracker); hours are the estimate. */
const ROWS = [
  { id: '1', name: 'Finalize pricing page', value: 'Sam Ortiz', hours: 12 },
  { id: '2', name: 'Send beta invites', value: 'Maya Chen', hours: 4 },
  { id: '3', name: 'Ship onboarding email', value: 'Sam Ortiz', hours: 6 },
  { id: '4', name: 'Fix sync conflicts on mobile', value: 'Priya Shah', hours: 16 },
  { id: '5', name: 'Review launch deck', value: 'Leo Park', hours: 8 },
]
const TOTAL = ROWS.reduce((sum, row) => sum + row.hours, 0)

type DemoProps = {
  /** Figma `type`. */
  variant?: 'contained' | 'ghost'
  /** Figma `show checkbox`. */
  selectable?: boolean
  actions?: boolean
  footer?: boolean
  caption?: boolean
}

function DemoTable({
  variant = 'contained',
  selectable = true,
  actions = true,
  footer = false,
  caption = false,
}: DemoProps) {
  const [selected, setSelected] = useState<string[]>(['2'])
  const all = selected.length === ROWS.length
  return (
    <div className="w-200">
      <Table variant={variant}>
        {caption && <TableCaption>Q3 launch tasks from Issue Tracker</TableCaption>}
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead>
                <Checkbox
                  aria-label="Select all"
                  checked={all ? true : selected.length ? 'indeterminate' : false}
                  onCheckedChange={(c) => setSelected(c === true ? ROWS.map((r) => r.id) : [])}
                />
              </TableHead>
            )}
            <TableHead>Task</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Estimate (h)</TableHead>
            {actions && (
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => {
            const isSelected = selected.includes(row.id)
            return (
              <TableRow key={row.id} data-state={isSelected ? 'selected' : undefined}>
                {selectable && (
                  <TableCell>
                    <Checkbox
                      aria-label={row.name}
                      checked={isSelected}
                      onCheckedChange={(c) =>
                        setSelected((s) => (c === true ? [...s, row.id] : s.filter((id) => id !== row.id)))
                      }
                    />
                  </TableCell>
                )}
                <TableCell>
                  <a
                    href={`#${row.id}`}
                    className="rounded-sm type-text-sm-semibold underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
                  >
                    {row.name}
                  </a>
                </TableCell>
                <TableCell>{row.value}</TableCell>
                <TableCell className="text-right tabular-nums">{row.hours}</TableCell>
                {actions && (
                  <TableCell className="py-2">
                    <div className="flex justify-end gap-1">
                      <Button size="icon-sm" variant="ghost" intent="neutral" aria-label={`Edit ${row.name}`}>
                        <Icon icon={PencilIcon} />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        intent="destructive"
                        aria-label={`Delete ${row.name}`}
                      >
                        <Icon icon={Trash2Icon} />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
        {footer && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={(selectable ? 1 : 0) + 2}>Total</TableCell>
              <TableCell className="text-right tabular-nums">{TOTAL}</TableCell>
              {actions && <TableCell />}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}

const meta = preview.meta({
  title: 'Organisms/Table',
  tags: ['organism'],
  component: DemoTable,
  parameters: {
    shadcn: 'table',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'table · type', values: 'contained · ghost', code: '`variant` prop on `Table`' },
      {
        property: 'table cells · type',
        values: 'default · header · link · checkbox · actions · slot',
        code: 'header = `TableHead`; the others are `TableCell` content (a link, a `Checkbox`, icon `Button`s, any component)',
      },
      { property: 'table cells · label', values: 'text', code: 'children' },
      { property: 'table cells · slot', values: 'slot', code: 'children' },
      { property: 'table cells · show icon', values: 'boolean', code: 'an `<Icon>` child, or not' },
      { property: 'table cells · state', values: 'default', code: 'nothing (only default is drawn)' },
    ],
    guide: {
      use: [
        'Structured records the user scans and compares by column: launch tasks, metrics, sources, usage.',
        'Rows with selection (a Checkbox column, `data-state="selected"`) and row actions (icon Buttons at the end).',
        '`variant="ghost"` inside a Card or a message; `contained` on a page.',
      ],
      avoid: [
        'A small table inside an assistant answer: use Content Blocks (it renders Markdown tables). Key–value details: use a description list or Item rows.',
        'Layout of non-tabular content: use a grid or Item list. Data inside a message: use Widget Table; key numbers: Widget Metric Card.',
      ],
      content: [
        'Short, specific column headers in sentence case (“Task”, “Owner”, “Estimate (h)”); include units in the header, not in every cell.',
        'Right-align numbers with `tabular-nums`; add a `TableCaption` that says what the data is (“Q3 launch tasks from Issue Tracker”).',
      ],
      a11y: [
        'It is a semantic `<table>`: headers are `TableHead` (`<th>`), so screen readers announce the column for each cell.',
        'Name every row checkbox and action after the row (“Edit Send beta invites”); give the action column a visually hidden header.',
        'Selection is shown by the checkbox state, not only the row tint.',
      ],
    },
    docs: {
      description: {
        component:
          'A data table (shadcn/ui Table, semantic `<table>`): `variant` contained (framed, row dividers) or ghost (no frame, rounded row hover). Header cells use `TableHead`; mark selected rows with `data-state="selected"`. Cells hold any content: a checkbox, a link, actions (icon buttons) or a component. For sorting, filtering and pagination, drive it from your data (e.g. TanStack Table).',
      },
    },
  },
  args: { variant: 'contained', selectable: true, actions: true, footer: false, caption: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['contained', 'ghost'] },
    selectable: { control: 'boolean' },
    actions: { control: 'boolean' },
    footer: { control: 'boolean' },
    caption: { control: 'boolean' },
  },
})

export const Default = meta.story()

Default.test('a table with headers; row selection updates the header checkbox', async ({ canvas }) => {
  const table = canvas.getByRole('table')
  await expect(within(table).getAllByRole('columnheader').length).toBeGreaterThan(3)
  await expect(canvas.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
    'data-state',
    'indeterminate',
  )
  await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all' }))
  await expect(canvas.getByRole('checkbox', { name: 'Fix sync conflicts on mobile' })).toBeChecked()
})

/** Figma type=ghost. */
export const Ghost = meta.story({ args: { variant: 'ghost', caption: true } })

/** shadcn TableFooter (totals). */
export const WithFooter = meta.story({ args: { footer: true, selectable: false } })
