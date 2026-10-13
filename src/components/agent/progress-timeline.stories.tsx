import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ProgressTimeline, type TimelineStep } from './progress-timeline'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10713-365'

const RUNNING: TimelineStep[] = [
  {
    id: '1',
    status: 'done',
    title: 'Map the competitors',
    detail: '9 sources · 3 findings',
    duration: '2m 05s',
  },
  {
    id: '2',
    status: 'done',
    title: 'Collect team-plan prices',
    detail: '14 sources · 5 findings',
    duration: '3m 18s',
  },
  {
    id: '3',
    status: 'running',
    title: 'Compare feature limits',
    detail: 'Reading 3 of 8 sources · pricing.example, plans.example',
    duration: '1m 12s',
  },
  { id: '4', status: 'waiting', title: 'Check customer sentiment', detail: 'Waiting for step 3' },
  { id: '5', status: 'waiting', title: 'Recommend positioning', detail: 'Waiting for step 4' },
]
const PAUSED: TimelineStep[] = RUNNING.map((s) =>
  s.id === '3'
    ? {
        ...s,
        status: 'failed',
        detail: '2 sources blocked by paywall · resume to try alternatives',
        duration: '0m 48s',
      }
    : s,
)
const COMPLETE: TimelineStep[] = [
  RUNNING[0],
  RUNNING[1],
  {
    id: '3',
    status: 'done',
    title: 'Compare feature limits',
    detail: '11 sources · 4 findings',
    duration: '2m 51s',
  },
  {
    id: '4',
    status: 'done',
    title: 'Check customer sentiment',
    detail: '8 sources · 3 findings',
    duration: '1m 57s',
  },
  {
    id: '5',
    status: 'done',
    title: 'Recommend positioning',
    detail: '5 sources · 3 scenarios',
    duration: '2m 22s',
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Progress Timeline',
  tags: ['agent-builder'],
  component: ProgressTimeline,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'running · paused · complete', code: '`status` prop' },
      {
        property: 'step state',
        values: 'done · running · failed · waiting',
        code: '`steps[].status` (a tile marker on a Timeline)',
      },
      { property: 'progress · summary', values: 'bar + text', code: '`progress` (0–100) · `summary`' },
      { property: 'paused note', values: 'text on warning tint', code: '`pausedNote` (shown while paused)' },
      {
        property: 'footer actions',
        values: 'pause · resume · stop · wrap up · review',
        code: '`onPause` · `onResume` · `onStop` · `onWrapUp` · `onSummary` · `onReview`',
      },
    ],
    guide: {
      use: [
        'To follow a long task step by step while it runs, with the controls to pause, stop or wrap up.',
        'After approval of the Task Plan: the same steps, now with status, detail and time.',
        'When complete, the footer leads to the outcome (Review outline) and the run summary.',
      ],
      avoid: [
        'The plan before it is approved: use Task Plan.',
        'A feed of every single action: use Activity Feed.',
        'One short tool call: use Tool Log Line or Tool Call Item in the thread.',
      ],
      content: [
        'Step titles match the plan. Detail says what is happening or the result (“Reading 3 of 8 sources”).',
        'The summary gives the counts people care about (“Step 3 of 5 · 27 sources read · 8 findings”).',
        'A paused note reassures (“Nothing is lost; resume any time”).',
      ],
      a11y: [
        'The steps are an ordered list; each step’s state is also in its text or glyph name, and the header Badge says the run state in words.',
        'The progress bar is named “Progress”; the spinner on a running step is decorative.',
      ],
    },
    docs: {
      description: {
        component:
          'Live step-by-step execution (`@/components/agent/progress-timeline`, on Task Card + Timeline): `status` running · paused · complete, `progress`, `summary`, `pausedNote`, `steps`, and the footer callbacks.',
      },
    },
  },
  args: {
    status: 'running' as const,
    title: 'Researching',
    subtitle: 'Team-plan pricing · 5 steps',
    badge: '6m 12s',
    progress: 52,
    summary: 'Step 3 of 5 · 27 sources read · 8 findings',
    pausedNote: 'Paused by you at 14:09. Nothing is lost; resume any time.',
    steps: RUNNING,
    reviewLabel: 'Review outline',
    onPause: fn(),
    onResume: fn(),
    onStop: fn(),
    onWrapUp: fn(),
    onSummary: fn(),
    onReview: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['running', 'paused', 'complete'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: 'text' },
    progress: { control: { type: 'range', min: 0, max: 100 } },
    summary: { control: 'text' },
    pausedNote: { control: 'text' },
    steps: { control: 'object' },
    reviewLabel: { control: 'text' },
    onPause: { control: false, table: { category: 'Events' } },
    onResume: { control: false, table: { category: 'Events' } },
    onStop: { control: false, table: { category: 'Events' } },
    onWrapUp: { control: false, table: { category: 'Events' } },
    onSummary: { control: false, table: { category: 'Events' } },
    onReview: { control: false, table: { category: 'Events' } },
  },
})

/** Figma state running. */
export const Default = meta.story()

Default.test('pauses, stops and wraps up', async ({ canvas, args }) => {
  await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
  await userEvent.click(canvas.getByRole('button', { name: 'Pause' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Wrap up now' }))
  await expect(args.onPause).toHaveBeenCalledOnce()
  await expect(args.onStop).toHaveBeenCalledOnce()
  await expect(args.onWrapUp).toHaveBeenCalledOnce()
})

/** Figma state paused: the note, a failed step, and Resume. */
export const Paused = meta.story({
  args: {
    status: 'paused',
    badge: 'Paused · 6m 12s',
    progress: 44,
    steps: PAUSED,
    summary: 'Paused at step 3 · 23 sources read · 8 findings',
  },
})

Paused.test('says it is paused and offers Resume', async ({ canvas, args }) => {
  await expect(canvas.getByRole('note')).toHaveTextContent('Nothing is lost')
  await userEvent.click(canvas.getByRole('button', { name: 'Resume' }))
  await expect(args.onResume).toHaveBeenCalledOnce()
})

/** Figma state complete: every step done, and the way to the outcome. */
export const Complete = meta.story({
  args: {
    status: 'complete',
    title: 'Research complete',
    badge: 'Complete · 12m 33s',
    progress: 100,
    steps: COMPLETE,
    summary: '5 of 5 steps · 47 sources read · 18 findings',
  },
})

Complete.test('leads to the outcome', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Review outline' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Run summary' }))
  await expect(args.onReview).toHaveBeenCalledOnce()
  await expect(args.onSummary).toHaveBeenCalledOnce()
})
