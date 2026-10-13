import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ChangeItem, ChangeReview } from './change-review'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10720-1735'
const FIGMA_ITEM = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10720-1755'

const IMPACT = [
  { label: 'Time', value: '+4 min' },
  { label: 'Sources', value: '+8' },
  { label: 'Cost', value: '+$0.60' },
]

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Change Review',
  tags: ['agent-builder'],
  component: ChangeReview,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'review · accepted', code: '`status` prop' },
      {
        property: 'change (item)',
        values: 'added · changed · removed · unchanged',
        code: '`ChangeItem` `change` prop (a word at the end says it too)',
      },
      { property: 'reason', values: 'text on agent tint', code: '`reason` prop (a full-bleed Alert)' },
      { property: 'impact', values: 'time · sources · cost', code: '`impact` prop (Value Stacks)' },
      {
        property: 'footer',
        values: 'keep · edit · accept · undo',
        code: '`onKeep` · `onEdit` · `onAccept`; accepted: `acceptedNote` · `onUndo`',
      },
    ],
    guide: {
      use: [
        'When the agent wants to change a plan that is already approved and running: say why, show what changes and what it costs, and ask.',
        'Show the unchanged steps too, muted, so the change reads in context.',
        'After acceptance keep the card with an Undo.',
      ],
      avoid: [
        'Reviewing the first plan: use Task Plan.',
        'A document edit: use Document Canvas suggested changes.',
        'Changes that need no approval: say it in a Tool Log Line.',
      ],
      content: [
        'The reason says what the agent found and what it suggests, in two sentences.',
        'Item titles name the step; the detail says what changed and why (“saves about 3 minutes”).',
        'Impact is a signed difference (“+4 min”, “+$0.60”).',
      ],
      a11y: [
        'Each change is named in words at the end of its row (Added · Changed · Removed), not only by colour or glyph.',
        'The changes are a named list; the reason is a note, not an alert, so it does not interrupt.',
      ],
    },
    docs: {
      description: {
        component:
          'A mid-task change for approval (`@/components/agent/change-review`, on Task Card): `status` review · accepted, `reason`, `ChangeItem` children (`change` added · changed · removed · unchanged), `impact`, `onKeep` · `onEdit` · `onAccept`, `acceptedNote`, `onUndo`.',
      },
    },
  },
  args: {
    status: 'review' as const,
    title: 'Plan update',
    subtitle: 'I found something that changes the plan',
    reason:
      'Two sources say annual plans drop the per-seat price by about 20%. That changes the comparison, so I suggest adding a step for it.',
    impact: IMPACT,
    acceptedNote: 'Accepted · 14:07 · step 3 starts next',
    onKeep: fn(),
    onEdit: fn(),
    onAccept: fn(),
    onUndo: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['review', 'accepted'] },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    reason: { control: 'text' },
    impact: { control: 'object' },
    acceptedNote: { control: 'text' },
    keepLabel: { control: 'text' },
    acceptLabel: { control: 'text' },
    children: { control: false },
    onKeep: { control: false, table: { category: 'Events' } },
    onEdit: { control: false, table: { category: 'Events' } },
    onAccept: { control: false, table: { category: 'Events' } },
    onUndo: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <ChangeReview {...args}>
      <ChangeItem title="Map the competitors" detail="Done · 9 sources" />
      <ChangeItem title="Collect team-plan prices" detail="Done · 14 sources" />
      <ChangeItem
        change="added"
        title="Compare annual discounts"
        detail="Annual billing as a price lever for each plan."
      />
      <ChangeItem
        change="changed"
        title="Recommend positioning"
        detail="Now includes the annual-plan angle"
      />
      <ChangeItem
        change="removed"
        title="Scan social media sentiment"
        detail="Low value for this question; saves about 3 minutes."
      />
    </ChangeReview>
  ),
})

/** Figma state review. */
export const Default = meta.story()

Default.test('names each change in words and offers the decision', async ({ canvas, args }) => {
  await expect(canvas.getByText('Added')).toBeVisible()
  await expect(canvas.getByText('Changed')).toBeVisible()
  await expect(canvas.getByText('Removed')).toBeVisible()
  await expect(canvas.getByRole('note')).toHaveTextContent('annual plans')
  await userEvent.click(canvas.getByRole('button', { name: 'Keep original plan' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Accept changes' }))
  await expect(args.onKeep).toHaveBeenCalledOnce()
  await expect(args.onAccept).toHaveBeenCalledOnce()
})

/** Figma state accepted: the note and Undo. */
export const Accepted = meta.story({
  args: { status: 'accepted', subtitle: 'Plan updated · research continuing' },
})

Accepted.test('can be undone', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
  await expect(args.onUndo).toHaveBeenCalledOnce()
})

/** Figma change: added, changed, removed, unchanged. */
export const Items = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_ITEM } },
  render: () => (
    <ul className="grid w-120 gap-3">
      <ChangeItem change="added" title="Step or item" detail="What changed and why." />
      <ChangeItem change="changed" title="Step or item" detail="What changed and why." />
      <ChangeItem change="removed" title="Step or item" detail="What changed and why." />
      <ChangeItem change="unchanged" title="Step or item" detail="What changed and why." />
    </ul>
  ),
})
