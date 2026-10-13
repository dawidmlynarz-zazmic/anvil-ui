import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { FeedbackReason } from './feedback-reason'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-1783'

const REASONS = [
  'Inaccurate',
  'Not helpful',
  'Out of date',
  'Too long',
  'Didn’t follow instructions',
  'Other',
]

type DemoProps = React.ComponentProps<typeof FeedbackReason> & {
  /** Story toggles for the optional parts: each is a prop you pass or leave out. */
  showNote?: boolean
  showCancel?: boolean
  showClose?: boolean
}

function Demo({ showNote, showCancel, showClose, ...props }: DemoProps) {
  return (
    <FeedbackReason
      {...props}
      note={showNote ? props.note : undefined}
      onCancel={showCancel ? props.onCancel : undefined}
      onClose={showClose ? props.onClose : undefined}
    />
  )
}

const ALL = { showNote: true, showCancel: true, showClose: true }

const meta = preview.meta({
  title: 'Agent Builder/Feedback/Feedback Reason',
  tags: ['agent-builder', 'feedback'],
  component: Demo,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'state', values: 'open · submitted', code: '`status` prop' },
      { property: 'title', values: 'text', code: '`title` prop (open), `submittedTitle` (submitted)' },
      {
        property: 'reasons',
        values: 'quick reply (suggestion · applied)',
        code: '`reasons`; applied = `selected` / `defaultSelected` / `onSelectedChange` (Quick Reply Filter)',
      },
      {
        property: 'textarea',
        values: 'text',
        code: '`comment` / `defaultComment` / `onCommentChange`, `placeholder`',
      },
      { property: 'note', values: 'text', code: '`note` prop' },
      {
        property: 'footer',
        values: 'Cancel · Send feedback',
        code: '`onCancel`, `onSubmit({ reasons, comment })`',
      },
      { property: 'close', values: 'icon button', code: 'pass `onClose` or not' },
      {
        property: 'submitted · detail · Undo',
        values: 'text · button',
        code: '`submittedDescription`, `onUndo`',
      },
    ],
    guide: {
      use: [
        'Right after a thumbs-down on an answer: ask what went wrong, in the thread.',
        'Let the user pick several `reasons` and add an optional comment, then confirm with Undo.',
      ],
      avoid: [
        'A general satisfaction check after a task: use Rating. Loyalty on 0–10: use NPS.',
        'Several questions or a structured study: use Survey. A group decision: use Poll.',
        'Reporting harmful content: that needs its own report flow, not a feedback card.',
      ],
      content: [
        'Title: a direct question (“What went wrong?”).',
        'Reasons: two or three words each, sentence case (“Out of date”, “Didn’t follow instructions”); end with “Other”.',
        '`note` says where feedback goes (“Your feedback and this conversation are shared with the Northwind Labs team.”).',
        'Submitted: thank the user and say what happens next (“Thanks for the feedback” · “I’ll use it to improve future answers.”).',
      ],
      a11y: [
        'The card is a `group` named by its title; reasons are a list of toggle buttons with `aria-pressed`.',
        'The comment Textarea is labelled “Comment”; Close, Cancel and Send feedback are labelled buttons.',
        'The submitted row is `role="status"`, so the confirmation is announced.',
      ],
    },
    docs: {
      description: {
        component:
          'Asks why after a thumbs-down (`@/components/agent/feedback-reason`): pick one or more `reasons`, add a comment, Send feedback (`onSubmit({ reasons, comment })`); `status` submitted thanks the user with Undo. Composed from Card, Shell Header / Footer, Quick Reply Filter, Textarea, Button, Item and Icon Tile.',
      },
    },
  },
  args: {
    status: 'open' as const,
    title: 'What went wrong?',
    reasons: REASONS,
    defaultSelected: ['Inaccurate'],
    note: 'Your feedback and this conversation are shared with the Northwind Labs team.',
    submittedTitle: 'Thanks for the feedback',
    submittedDescription: 'I’ll use it to improve future answers.',
    onSubmit: fn(),
    onCancel: fn(),
    onClose: fn(),
    onUndo: fn(),
    showNote: false,
    showCancel: false,
    showClose: false,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['open', 'submitted'] },
    title: { control: 'text' },
    note: { control: 'text' },
    showNote: { control: 'boolean', description: 'Story toggle: pass `note` or not' },
    showCancel: { control: 'boolean', description: 'Story toggle: pass `onCancel` or not' },
    showClose: {
      control: 'boolean',
      description: 'Story toggle: pass `onClose` (the header close button) or not',
    },
    placeholder: { control: 'text' },
    submittedTitle: { control: 'text' },
    submittedDescription: { control: 'text' },
    reasons: { control: false },
    selected: { control: false },
    defaultSelected: { control: false },
    onSelectedChange: { control: false, table: { category: 'Events' } },
    onCommentChange: { control: false, table: { category: 'Events' } },
    onSubmit: { control: false, table: { category: 'Events' } },
    onCancel: { control: false, table: { category: 'Events' } },
    onClose: { control: false, table: { category: 'Events' } },
    onUndo: { control: false, table: { category: 'Events' } },
  },
})

/** Reasons, a comment and Send feedback. The note, Cancel and the close button are toggles in Controls. Pick reasons, type, send. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-120">
      <Demo {...args} />
    </div>
  ),
})

/** Every optional part on: the note, Cancel and the close button. The edge case, not the default. */
export const Full = meta.story({
  args: ALL,
  render: (args) => (
    <div className="w-120">
      <Demo {...args} />
    </div>
  ),
})

Default.test('sends the picked reasons and the comment', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Out of date' }))
  await expect(canvas.getByRole('button', { name: 'Out of date' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.type(canvas.getByRole('textbox', { name: 'Comment' }), 'The pricing is from last quarter.')
  await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({
    reasons: ['Inaccurate', 'Out of date'],
    comment: 'The pricing is from last quarter.',
  })
})

/** Figma state: open and submitted. */
export const Statuses = meta.story({
  args: ALL,
  render: (args) => (
    <div className="flex w-120 flex-col gap-4">
      <Demo {...args} />
      <Demo {...args} status="submitted" />
    </div>
  ),
})

Statuses.test('submitted announces and offers Undo', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Thanks for the feedback')
  await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
  await expect(args.onUndo).toHaveBeenCalledOnce()
})

function Flow() {
  const [sent, setSent] = useState(false)
  return (
    <FeedbackReason
      status={sent ? 'submitted' : 'open'}
      title="What went wrong?"
      reasons={REASONS}
      note="Your feedback and this conversation are shared with the Northwind Labs team."
      submittedTitle="Thanks for the feedback"
      submittedDescription="I’ll use it to improve future answers."
      onSubmit={() => setSent(true)}
      onCancel={() => {}}
      onUndo={() => setSent(false)}
    />
  )
}

/** Send feedback switches to submitted; Undo goes back. */
export const Flowing = meta.story({
  name: 'Flow',
  render: () => (
    <div className="w-120">
      <Flow />
    </div>
  ),
})

Flowing.test('send then undo', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
  await expect(canvas.getByRole('button', { name: 'Send feedback' })).toBeVisible()
})
