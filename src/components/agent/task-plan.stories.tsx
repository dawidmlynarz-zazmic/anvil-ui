import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { TaskPlan, TaskPlanStep } from './task-plan'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10711-327'
const FIGMA_STEP = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10711-347'

const STEPS = [
  {
    title: 'Map the competitors',
    description: 'List the sync tools teams compare and where each sells.',
    tags: ['Pricing pages', 'News'],
  },
  {
    title: 'Collect team-plan prices',
    description: 'Pull per-seat prices and annual discounts for each plan tier.',
    tags: ['Pricing pages', 'Analyst reports'],
  },
  {
    title: 'Compare feature limits',
    description: 'Storage, history and admin controls that change what a plan is worth.',
    tags: ['Pricing pages'],
  },
  {
    title: 'Check customer sentiment',
    description: 'What reviewers say about value for money.',
    tags: ['Customer reviews'],
  },
  {
    title: 'Recommend positioning',
    description: 'Where Northwind Sync can win, with the numbers behind it.',
    tags: ['Analyst reports'],
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Task Plan',
  tags: ['agent-builder'],
  component: TaskPlan,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'review · approved', code: '`status` prop' },
      {
        property: 'step (default · hover · focus)',
        values: 'numbered row',
        code: '`TaskPlanStep`: hover / focus-within show the edit and remove buttons (`onEdit`, `onRemove`)',
      },
      {
        property: 'drag handle',
        values: 'icon',
        code: 'not built: reordering needs keyboard moves and a drag library (flagged)',
      },
      {
        property: 'footer',
        values: 'estimate · edit plan · approve · view progress',
        code: '`note` · `onEdit` · `onApprove`; approved: `approvedNote` · `onViewProgress`',
      },
    ],
    guide: {
      use: [
        'To show the steps the agent will take, in order, and ask for approval before the work starts (research, itinerary, workflow, checklist).',
        'Let people edit or remove a step, or add one, while the plan is in review.',
        'After approval keep the card in the thread; View progress goes to the running task.',
      ],
      avoid: [
        'A change to a plan that is already running: use Change Review.',
        'Live progress of the steps: use Progress Timeline.',
        'Approving one action: use Approval Card.',
      ],
      content: [
        'Step titles are verbs (“Map the competitors”); the description says how the agent will do it, in one line.',
        'Tags name the sources or tools the step uses. The footer estimate gives time and volume (“Estimated 15 min · up to 60 sources”).',
      ],
      a11y: [
        'The steps are an ordered list; the edit and remove buttons name their step (“Edit step: Map the competitors”) and show on focus as well as hover.',
        'The status Badge says Needs approval or Approved in words.',
      ],
    },
    docs: {
      description: {
        component:
          'The plan the agent proposes (`@/components/agent/task-plan`, on Task Card): `TaskPlan` (`status` review · approved, `note`, `approvedNote`, `onEdit`, `onApprove`, `onAddStep`, `onViewProgress`) with `TaskPlanStep` rows (`index`, `title`, `description`, `tags`, `onEdit`, `onRemove`).',
      },
    },
  },
  args: {
    status: 'review' as const,
    title: 'Research plan',
    subtitle: '5 steps · ~15 min · 40–60 sources',
    note: 'Estimated 15 min · up to 60 sources',
    approvedNote: 'Approved · research running',
    onAddStep: fn(),
    onEdit: fn(),
    onApprove: fn(),
    onViewProgress: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['review', 'approved'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    note: { control: 'text' },
    approvedNote: { control: 'text' },
    addStepLabel: { control: 'text' },
    editLabel: { control: 'text' },
    approveLabel: { control: 'text' },
    children: { control: false },
    onAddStep: { control: false, table: { category: 'Events' } },
    onEdit: { control: false, table: { category: 'Events' } },
    onApprove: { control: false, table: { category: 'Events' } },
    onViewProgress: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <TaskPlan {...args}>
      {STEPS.map((step, index) => (
        <TaskPlanStep
          key={step.title}
          index={index + 1}
          {...step}
          onEdit={args.status === 'review' ? fn() : undefined}
          onRemove={args.status === 'review' ? fn() : undefined}
        />
      ))}
    </TaskPlan>
  ),
})

/** Status and the text are in Controls; hover a step to edit or remove it. */
export const Default = meta.story()

Default.test('edits a step, adds one and approves', async ({ canvas, args }) => {
  await expect(canvas.getAllByRole('listitem').length).toBeGreaterThan(5)
  await expect(canvas.getByRole('button', { name: 'Edit step: Map the competitors' })).toBeInTheDocument()
  await userEvent.click(canvas.getByRole('button', { name: 'Add step' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Approve plan' }))
  await expect(args.onAddStep).toHaveBeenCalledOnce()
  await expect(args.onApprove).toHaveBeenCalledOnce()
})

/** Figma state approved: read-only steps and View progress. */
export const Approved = meta.story({ args: { status: 'approved' } })

Approved.test('is read-only and links to progress', async ({ canvas, args }) => {
  await expect(canvas.queryByRole('button', { name: /^Edit step/ })).toBeNull()
  await expect(canvas.queryByRole('button', { name: 'Add step' })).toBeNull()
  await userEvent.click(canvas.getByRole('button', { name: 'View progress' }))
  await expect(args.onViewProgress).toHaveBeenCalledOnce()
})

/** Figma step states: default and hover (the row with its edit and remove buttons). */
export const Step = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_STEP } },
  render: () => (
    <ol className="flex w-120 flex-col gap-4">
      <TaskPlanStep index={1} {...STEPS[0]} />
      <TaskPlanStep
        index={2}
        {...STEPS[1]}
        className="bg-muted *:last:opacity-100"
        onEdit={() => {}}
        onRemove={() => {}}
      />
    </ol>
  ),
})
