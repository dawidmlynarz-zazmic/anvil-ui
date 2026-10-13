import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { TaskSummary } from './task-summary'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10715-1193'

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Task Summary',
  tags: ['agent-builder'],
  component: TaskSummary,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'metrics', values: '4 × stat', code: '`stats` prop (Value Stacks on a muted strip)' },
      {
        property: 'key takeaways',
        values: 'numbered text + confidence',
        code: '`takeaways` prop (`confidence` high · medium · low)',
      },
      {
        property: 'deliverable',
        values: 'title, meta, export, open',
        code: '`deliverable` · `onExport` · `onOpen`',
      },
      { property: 'suggested follow-ups', values: 'quick replies', code: '`followUps` · `onFollowUp`' },
    ],
    guide: {
      use: [
        'When a long task finishes: what was done in numbers, what was found, what was produced, and what to do next.',
        'Give each takeaway a confidence so the user knows which to trust.',
        'End with follow-ups the user is likely to want, as one-tap replies.',
      ],
      avoid: [
        'The progress of a running task: use Progress Timeline.',
        'Only a file the agent made: use File Output Card.',
        'A long report: link to it (Open report) instead of repeating it.',
      ],
      content: [
        'Stats are counts with a noun (“47 sources read”); takeaways are one sentence each.',
        'Follow-ups are actions in the user’s voice (“Compare with the US plans”), at most three.',
      ],
      a11y: [
        'Confidence is a Badge with words (and hidden “confidence”), not only a coloured dot.',
        'Takeaways are an ordered list; the buttons name what they do (Export, Open report).',
      ],
    },
    docs: {
      description: {
        component:
          'The outcome of a task (`@/components/agent/task-summary`, on Task Card): `stats`, `takeaways`, `deliverable`, `followUps`, with `onExport`, `onOpen` and `onFollowUp`.',
      },
    },
  },
  args: {
    title: 'Task complete',
    subtitle: 'Research · delivered 14:22 · 12m 33s',
    stats: [
      { label: 'sources read', value: '47' },
      { label: 'sources cited', value: '22' },
      { label: 'findings', value: '18' },
      { label: 'gaps noted', value: '3' },
    ],
    takeaways: [
      {
        text: 'Annual billing cuts the per-seat price by about 20% at most tools; Northwind Sync is the only one that does not.',
        confidence: 'high' as const,
      },
      {
        text: 'Free tiers cap history at 30 days, so history length is the main upgrade driver.',
        confidence: 'medium' as const,
      },
      {
        text: 'Admin controls are bundled differently at every vendor, which makes a like-for-like comparison hard.',
        confidence: 'medium' as const,
      },
    ],
    deliverable: { title: 'Deliverable', meta: 'Report · 14 pages' },
    followUps: [
      'Break this down by plan tier',
      'Compare with enterprise pricing',
      'Turn this into a 5-slide deck',
    ],
    onExport: fn(),
    onOpen: fn(),
    onFollowUp: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    stats: { control: 'object' },
    takeaways: { control: 'object' },
    deliverable: { control: 'object' },
    followUps: { control: 'object' },
    takeawaysLabel: { control: 'text' },
    followUpsLabel: { control: 'text' },
    openLabel: { control: 'text' },
    onExport: { control: false, table: { category: 'Events' } },
    onOpen: { control: false, table: { category: 'Events' } },
    onFollowUp: { control: false, table: { category: 'Events' } },
  },
})

/** Metrics, takeaways, the deliverable and follow-ups. */
export const Default = meta.story()

Default.test('shows the outcome and acts on it', async ({ canvas, args }) => {
  await expect(canvas.getByText('sources read')).toBeVisible()
  await expect(canvas.getAllByText(/confidence/)).toHaveLength(3)
  await userEvent.click(canvas.getByRole('button', { name: 'Export' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Open report' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Turn this into a 5-slide deck' }))
  await expect(args.onExport).toHaveBeenCalledOnce()
  await expect(args.onOpen).toHaveBeenCalledOnce()
  await expect(args.onFollowUp).toHaveBeenCalledWith('Turn this into a 5-slide deck')
})

/** Only the headline: no deliverable or follow-ups. */
export const Minimal = meta.story({
  args: { deliverable: undefined, followUps: undefined, takeaways: undefined },
})
