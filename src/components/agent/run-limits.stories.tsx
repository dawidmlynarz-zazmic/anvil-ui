import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ClockIcon, DollarSignIcon, FileTextIcon, WrenchIcon } from '@/components/ui/icon'

import { RunLimits, type Limit } from './run-limits'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10720-1245'

const REVIEW: Limit[] = [
  {
    id: 'time',
    icon: ClockIcon,
    label: 'Time',
    value: 15,
    min: 5,
    max: 30,
    display: '15 min',
    hint: 'Estimated 12–15 min',
  },
  {
    id: 'sources',
    icon: FileTextIcon,
    label: 'Sources',
    value: 60,
    min: 10,
    max: 100,
    display: '60 max',
    hint: 'Stops reading after 60 sources',
  },
  {
    id: 'calls',
    icon: WrenchIcon,
    label: 'Tool calls',
    value: 150,
    min: 25,
    max: 300,
    display: '150 max',
    hint: 'Searches, page reads and extractions',
  },
  {
    id: 'cost',
    icon: DollarSignIcon,
    label: 'Cost cap',
    value: 10,
    min: 1,
    max: 20,
    display: '$10.00',
    hint: 'Estimated $4.80 for this plan',
  },
]

const RUNNING: Limit[] = [
  { ...REVIEW[0], used: 11.7, usedDisplay: '11m 40s / 15 min' },
  { ...REVIEW[1], used: 43, usedDisplay: '43 / 60', hint: 'Stops reading after 60 sources' },
  { ...REVIEW[2], used: 92, usedDisplay: '92 / 150', hint: 'Searches, page reads and extractions' },
  {
    ...REVIEW[3],
    used: 9,
    usedDisplay: '$9.00 / $10.00',
    near: true,
    hint: 'You are close to the cost cap.',
  },
].map((l, i) => ({ ...l, max: [15, 60, 150, 10][i] }))

function Editable() {
  const [limits, setLimits] = useState(REVIEW)
  return (
    <RunLimits
      title="Budget & limits"
      subtitle="Set limits before I start"
      badge="Standard depth"
      limits={limits}
      onLimitChange={(id, value) =>
        setLimits((all) =>
          all.map((l) =>
            l.id === id
              ? {
                  ...l,
                  value,
                  display: id === 'cost' ? `$${value}.00` : `${value}${id === 'time' ? ' min' : ' max'}`,
                }
              : l,
          ),
        )
      }
      onReset={() => setLimits(REVIEW)}
      onSave={fn()}
    />
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Run Limits',
  tags: ['agent-builder'],
  component: RunLimits,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'review · near limit', code: '`status` prop: review · near-limit' },
      {
        property: 'limits (time, sources, tool calls, cost)',
        values: 'rows',
        code: '`limits` prop: Slider in review, Progress while running',
      },
      {
        property: 'header badge',
        values: 'text',
        code: '`badge` (outline “Standard depth”; warning “90% of cost cap” near the limit)',
      },
      {
        property: 'warning · actions',
        values: 'text · buttons',
        code: '`warning` · Reset to defaults / Save limits · Wrap up now / `extendLabel`',
      },
    ],
    guide: {
      use: [
        'To let people cap time, volume, tool calls and cost before a long task, and to show how close a running task is to those caps.',
        'In review: sliders, a hint under each, Reset and Save. While running: progress against each cap.',
        'When a cap is close, say so, say what it means, and offer Wrap up now or Extend.',
      ],
      avoid: [
        'Choosing which sources the agent may use: use Task Settings.',
        'Showing the progress of the steps: use Progress Timeline.',
        'A single usage meter for an account: use Progress in a settings page.',
      ],
      content: [
        'Labels are the thing being capped (“Time”, “Sources”, “Cost cap”); hints say what happens at the cap.',
        'The warning gives the consequence (“At this rate the run needs about $1.40 more to finish all steps.”).',
        '“Extend by $5” names the amount, so nobody agrees to an open-ended spend.',
      ],
      a11y: [
        'Each slider and progress bar is named by its row label; the value is also text at the end of the row.',
        'The near-limit state is said in words (badge, hint and note), not only by the orange bar.',
      ],
    },
    docs: {
      description: {
        component:
          'Caps for a task and how close it is to them (`@/components/agent/run-limits`, on Task Card): `status` review · near-limit, `limits` (value, display, hint, used), `badge`, `warning`, `onLimitChange`, `onReset`, `onSave`, `onWrapUp`, `onExtend`, `extendLabel`. The sliders use the agent tone.',
      },
    },
  },
  args: {
    status: 'review' as const,
    title: 'Budget & limits',
    subtitle: 'Set limits before I start',
    badge: 'Standard depth',
    limits: REVIEW,
    onLimitChange: fn(),
    onReset: fn(),
    onSave: fn(),
    onWrapUp: fn(),
    onExtend: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['review', 'near-limit'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: 'text' },
    limits: { control: 'object' },
    warning: { control: 'text' },
    extendLabel: { control: 'text' },
    onLimitChange: { control: false, table: { category: 'Events' } },
    onReset: { control: false, table: { category: 'Events' } },
    onSave: { control: false, table: { category: 'Events' } },
    onWrapUp: { control: false, table: { category: 'Events' } },
    onExtend: { control: false, table: { category: 'Events' } },
  },
})

/** Figma state review: set the caps, then save. */
export const Default = meta.story({ render: () => <Editable /> })

Default.test('sliders set the caps; reset restores them', async ({ canvas }) => {
  const time = canvas.getByRole('slider', { name: /Time/ })
  time.focus()
  await userEvent.keyboard('{ArrowRight}')
  await expect(canvas.getByText('16 min')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Reset to defaults' }))
  await expect(canvas.getByText('15 min')).toBeVisible()
})

/** Figma state near limit: progress against each cap, a note and the two ways out. */
export const NearLimit = meta.story({
  args: {
    status: 'near-limit',
    subtitle: 'Running · 11m 40s',
    badge: '90% of cost cap',
    limits: RUNNING,
    warning: 'At this rate the run needs about $1.40 more to finish all steps.',
    extendLabel: 'Extend by $5',
  },
})

NearLimit.test('says what is close and offers a way out', async ({ canvas, args }) => {
  await expect(canvas.getByText('90% of cost cap')).toBeVisible()
  await expect(canvas.getByRole('note')).toHaveTextContent('about $1.40 more')
  await expect(canvas.getAllByRole('progressbar')).toHaveLength(4)
  await userEvent.click(canvas.getByRole('button', { name: 'Wrap up now' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Extend by $5' }))
  await expect(args.onWrapUp).toHaveBeenCalledOnce()
  await expect(args.onExtend).toHaveBeenCalledOnce()
})
