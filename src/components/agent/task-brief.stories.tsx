import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { TaskBrief } from './task-brief'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10711-3'

const FIELDS = [
  {
    label: 'Objective',
    value: 'Compare team-plan pricing for sync tools and find where Northwind Sync can win',
  },
  { label: 'Audience', value: 'Launch team; board-level summary' },
  { label: 'Time range', value: 'Last 12 months' },
  { label: 'Geography', value: 'US and EU' },
  { label: 'Depth', value: 'Standard · 40–60 sources' },
  { label: 'Out of scope', value: 'Enterprise contracts, reseller pricing' },
]

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Task Brief',
  tags: ['agent-builder'],
  component: TaskBrief,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'review · approved', code: '`status` prop' },
      { property: 'question', values: 'text', code: '`questionLabel` + `question` props' },
      {
        property: 'fields (objective, audience, …)',
        values: 'label + value pairs',
        code: '`fields` prop (Value Stacks in two columns)',
      },
      {
        property: 'footer actions',
        values: 'edit · refine · approve · edit brief',
        code: '`onEdit` · `onRefine` · `onApprove`; approved shows `approvedNote` and Edit brief',
      },
    ],
    guide: {
      use: [
        'Before the agent starts a task with scope: restate it and let the user approve, edit or refine it.',
        'Show the few fields that define the task (objective, audience, range, depth, what is out), not every setting.',
        'After approval the same card stays in the thread, with Edit brief still available while the task runs.',
      ],
      avoid: [
        'Approving a single action with side effects: use Approval Card.',
        'The steps of the work: use Task Plan.',
        'Asking open questions to fill the brief: use Question Set or Clarifying Question.',
      ],
      content: [
        'The question is the task in one sentence (“What does the agent do?”), written as the agent will do it.',
        'Field labels are short nouns; values are specific (“Last 12 months”, not “Recent”).',
        'The approved note says when and what is still editable (“Approved · 14:02 · you can still edit while it runs”).',
      ],
      a11y: [
        'It is an article named by its title; the status Badge says Needs approval or Approved in words.',
        'Approve & start is the only brand action; Edit and Refine are ordinary buttons with names.',
      ],
    },
    docs: {
      description: {
        component:
          'The brief the agent shows before it acts (`@/components/agent/task-brief`, on Task Card): `status` review · approved, `question`, `fields`, `onEdit` · `onRefine` · `onApprove`, `approvedNote`.',
      },
    },
  },
  args: {
    status: 'review' as const,
    title: 'Research brief',
    subtitle: 'Review before I start · ~15 min',
    questionLabel: 'Research question',
    question: 'How do team plans for sync tools compare on price, and where can Northwind Sync win?',
    fields: FIELDS,
    approvedNote: 'Approved · 14:02 · you can still edit while it runs',
    onEdit: fn(),
    onRefine: fn(),
    onApprove: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['review', 'approved'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    questionLabel: { control: 'text' },
    question: { control: 'text' },
    fields: { control: 'object' },
    approveLabel: { control: 'text' },
    approvedNote: { control: 'text' },
    icon: { control: false },
    onEdit: { control: false, table: { category: 'Events' } },
    onRefine: { control: false, table: { category: 'Events' } },
    onApprove: { control: false, table: { category: 'Events' } },
  },
})

/** Status and the text are in Controls. */
export const Default = meta.story()

Default.test('edits, refines and approves', async ({ canvas, args }) => {
  await expect(canvas.getByText('Needs approval')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Edit' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Refine' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Approve & start' }))
  await expect(args.onEdit).toHaveBeenCalledOnce()
  await expect(args.onRefine).toHaveBeenCalledOnce()
  await expect(args.onApprove).toHaveBeenCalledOnce()
})

/** Figma state approved: the note, and the brief stays editable. */
export const Approved = meta.story({ args: { status: 'approved', subtitle: 'Approved · running' } })

Approved.test('can still be edited', async ({ canvas, args }) => {
  await expect(canvas.getByText('Approved', { selector: '[data-slot=task-status]' })).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Edit brief' }))
  await expect(args.onEdit).toHaveBeenCalledOnce()
})
