import { useState } from 'react'
import { format } from 'date-fns'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { DatePicker, DatePickerContent, DatePickerTrigger } from '@/components/ui/date-picker'

import { TaskSettings } from './task-settings'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10720-1427'

const DEPTHS = [
  { value: 'quick', label: 'Quick scan', estimate: 'Estimated ~5 min · 15 sources' },
  { value: 'standard', label: 'Standard', estimate: 'Estimated ~15 min · 40–60 sources' },
  { value: 'exhaustive', label: 'Exhaustive', estimate: 'Estimated ~45 min · 150+ sources' },
]

const SOURCES = [
  { id: 'pricing', label: 'Pricing pages' },
  { id: 'analysts', label: 'Analyst reports' },
  { id: 'news', label: 'News' },
  { id: 'reviews', label: 'Customer reviews' },
  { id: 'filings', label: 'Company filings' },
  { id: 'social', label: 'Social media' },
  {
    id: 'internal',
    label: 'Internal documents',
    action: (
      <Button variant="outline" intent="neutral" size="xs">
        Connect Google Drive
      </Button>
    ),
  },
]

function PublishedAfter() {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 9, 1))
  return (
    <DatePicker>
      <DatePickerTrigger aria-label="Published after" className="w-auto">
        {date ? format(date, 'MMM yyyy') : undefined}
      </DatePickerTrigger>
      <DatePickerContent>
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </DatePickerContent>
    </DatePicker>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Task Settings',
  tags: ['agent-builder'],
  component: TaskSettings,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'depth',
        values: 'quick · standard · exhaustive',
        code: '`depth` / `defaultDepth` / `onDepthChange`, one Tab per entry of `depths`',
      },
      {
        property: 'source rows',
        values: 'label + switch (+ action)',
        code: '`sources` (+ `action`), `enabled` / `defaultEnabled` / `onEnabledChange`',
      },
      {
        property: 'published after',
        values: 'date field',
        code: '`dateLabel` + `dateField` (a Date Picker)',
      },
      {
        property: 'estimate · apply',
        values: 'text · button',
        code: 'the depth’s `estimate` in the footer · `onApply`',
      },
    ],
    guide: {
      use: [
        'Before or during a task, to choose how deep the agent goes and what it may use.',
        'A depth preset first (it changes the estimate), then the sources or tools as switches.',
        'Put connections that are not set up as an `action` on their row (“Connect Google Drive”).',
      ],
      avoid: [
        'Hard caps on time and cost: use Run Limits.',
        'A preference that applies everywhere: use a settings page.',
        'A long list of options: group them, or use a Combobox.',
      ],
      content: [
        'Depth names say how much work (“Quick scan”, “Standard”, “Exhaustive”); the estimate gives time and volume.',
        'Source labels are plain nouns (“Pricing pages”). The footer button says what it does: “Apply scope”.',
      ],
      a11y: [
        'Depth is a tab list; each source is a Switch named by its row, and a connect button stays a separate, named button.',
        '“5 of 7 on” is text, so the count is read; the estimate updates with the depth.',
      ],
    },
    docs: {
      description: {
        component:
          'A depth preset plus the sources the agent may use (`@/components/agent/task-settings`, on Task Card): `depths`, `depth`, `sources`, `enabled`, `dateLabel` + `dateField`, `onApply`.',
      },
    },
  },
  args: {
    title: 'Research scope',
    subtitle: 'Choose how deep to go and what I may use',
    depths: DEPTHS,
    defaultDepth: 'standard',
    sources: SOURCES,
    defaultEnabled: ['pricing', 'analysts', 'news', 'reviews', 'filings'],
    dateLabel: 'Only use sources published after',
    onApply: fn(),
    onDepthChange: fn(),
    onEnabledChange: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    depths: { control: 'object' },
    depth: { control: false },
    defaultDepth: { control: 'inline-radio', options: ['quick', 'standard', 'exhaustive'] },
    sources: { control: false },
    enabled: { control: false },
    defaultEnabled: { control: 'object' },
    dateLabel: { control: 'text' },
    dateField: { control: false },
    applyLabel: { control: 'text' },
    onApply: { control: false, table: { category: 'Events' } },
    onDepthChange: { control: false, table: { category: 'Events' } },
    onEnabledChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => <TaskSettings {...args} dateField={<PublishedAfter />} />,
})

/** Depth and the starting switches are in Controls. */
export const Default = meta.story()

Default.test('the depth changes the estimate; switches change the count', async ({ canvas, args }) => {
  await expect(canvas.getByText('Estimated ~15 min · 40–60 sources')).toBeVisible()
  await userEvent.click(canvas.getByRole('tab', { name: 'Quick scan' }))
  await expect(canvas.getByText('Estimated ~5 min · 15 sources')).toBeVisible()
  await expect(args.onDepthChange).toHaveBeenCalledWith('quick')
  await expect(canvas.getByText('5 of 7 on')).toBeVisible()
  await userEvent.click(canvas.getByRole('switch', { name: 'Social media' }))
  await expect(canvas.getByText('6 of 7 on')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Apply scope' }))
  await expect(args.onApply).toHaveBeenCalledOnce()
})

/** Figma depth exhaustive. */
export const Exhaustive = meta.story({ args: { defaultDepth: 'exhaustive' } })
