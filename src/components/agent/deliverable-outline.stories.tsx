import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { DeliverableOutline } from './deliverable-outline'
import { TaskPlanStep } from './task-plan'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10714-1167'

const SECTIONS = [
  {
    title: 'Executive summary',
    description: 'What we found and what it means for pricing.',
    tags: ['~300 words'],
  },
  {
    title: 'How teams are charged today',
    description: 'Per-seat plans, tiers and annual discounts.',
    tags: ['~500 words', '1 chart'],
  },
  {
    title: 'Comparison by plan tier',
    description: 'Prices and limits for each tool, side by side.',
    tags: ['~500 words', '1 table'],
  },
  {
    title: 'Where Northwind Sync can win',
    description: 'Gaps in competitors’ plans and how to use them.',
    tags: ['~450 words'],
  },
  {
    title: 'Recommendation',
    description: 'Pricing options and the numbers behind them.',
    tags: ['~600 words', '1 table'],
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Evidence & decisions/Deliverable Outline',
  tags: ['agent-builder'],
  component: DeliverableOutline,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'review · approved', code: '`status` prop: review · writing' },
      {
        property: 'format · length',
        values: 'chip rows',
        code: '`formats` / `format` and `lengths` / `length` (controlled or default…)',
      },
      {
        property: 'sections',
        values: 'numbered steps with tags',
        code: '`TaskPlanStep` children (words and visuals as `tags`)',
      },
      {
        property: 'footer',
        values: 'add · edit · start / writing · view draft',
        code: '`onAddSection` · `onEdit` · `onStart`; `progress` · `onViewDraft`',
      },
    ],
    guide: {
      use: [
        'Before the agent writes a document, deck or brief: show its structure and format and let the user adjust them.',
        'Sections list how long each is and what visuals it has, so the user can judge the result before it is written.',
        'Once approved, the same card shows writing progress and leads to the draft.',
      ],
      avoid: [
        'Steps of work, not of a document: use Task Plan.',
        'A finished document: use Document Canvas.',
        'A single file the agent made: use File Output Card.',
      ],
      content: [
        'Section titles are the headings the reader will see; the description is one line on what goes in it.',
        'Tags are sizes: “~500 words”, “1 chart”. The subtitle totals them.',
      ],
      a11y: [
        'Format and length are groups of toggle buttons with `aria-pressed`; sections are an ordered list.',
        'Edit and remove buttons name their section and show on focus as well as hover. Progress is a status.',
      ],
    },
    docs: {
      description: {
        component:
          'The plan for a deliverable (`@/components/agent/deliverable-outline`, on Task Card + the Task Plan step): `status` review · writing, `formats`, `lengths`, `onAddSection`, `onEdit`, `onStart`, `progress`, `onViewDraft`, with `TaskPlanStep` sections.',
      },
    },
  },
  args: {
    status: 'review' as const,
    title: 'Report outline',
    subtitle: '5 sections · ~2,350 words · 3 visuals',
    formats: [
      { value: 'report', label: 'Report' },
      { value: 'brief', label: 'Executive brief' },
      { value: 'deck', label: 'Slide deck' },
    ],
    lengths: [
      { value: 'short', label: 'Short' },
      { value: 'standard', label: 'Standard' },
      { value: 'detailed', label: 'Detailed' },
    ],
    defaultFormat: 'report',
    defaultLength: 'standard',
    progress: 'Writing section 2 of 5 · about 4 min left',
    onAddSection: fn(),
    onEdit: fn(),
    onStart: fn(),
    onViewDraft: fn(),
    onFormatChange: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['review', 'writing'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    formats: { control: 'object' },
    lengths: { control: 'object' },
    format: { control: false },
    length: { control: false },
    defaultFormat: { control: 'text' },
    defaultLength: { control: 'text' },
    progress: { control: 'text' },
    children: { control: false },
    onAddSection: { control: false, table: { category: 'Events' } },
    onEdit: { control: false, table: { category: 'Events' } },
    onStart: { control: false, table: { category: 'Events' } },
    onViewDraft: { control: false, table: { category: 'Events' } },
    onFormatChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <DeliverableOutline {...args}>
      {SECTIONS.map((section, index) => (
        <TaskPlanStep
          key={section.title}
          index={index + 1}
          {...section}
          onEdit={args.status === 'review' ? fn() : undefined}
          onRemove={args.status === 'review' ? fn() : undefined}
        />
      ))}
    </DeliverableOutline>
  ),
})

/** Figma state review. */
export const Default = meta.story()

Default.test('changes the format and starts writing', async ({ canvas, args }) => {
  await expect(canvas.getByRole('button', { name: 'Report' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(canvas.getByRole('button', { name: 'Slide deck' }))
  await expect(args.onFormatChange).toHaveBeenCalledWith('deck')
  await expect(canvas.getByRole('button', { name: 'Report' })).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(canvas.getByRole('button', { name: 'Start writing' }))
  await expect(args.onStart).toHaveBeenCalledOnce()
})

/** Figma state approved: the agent is writing; View draft. */
export const Writing = meta.story({ args: { status: 'writing' } })

Writing.test('shows progress and leads to the draft', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Writing section 2 of 5')
  await userEvent.click(canvas.getByRole('button', { name: 'View draft' }))
  await expect(args.onViewDraft).toHaveBeenCalledOnce()
})
