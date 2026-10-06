import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { FeedbackReason } from './feedback-reason'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-1783'

const REASONS = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7']

const meta = preview.meta({
  title: 'Agent Builder/Feedback Reason',
  tags: ['agent-builder', 'feedback'],
  component: FeedbackReason,
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
    docs: {
      description: {
        component:
          'Asks why after a thumbs-down (`@/components/agent/feedback-reason`): pick one or more `reasons`, add a comment, Send feedback (`onSubmit({ reasons, comment })`); `status` submitted thanks the user with Undo. Composed from Card, Shell Header / Footer, Quick Reply Filter, Textarea, Button, Item and Icon Tile.',
      },
    },
  },
  args: {
    status: 'open' as const,
    title: 'Title',
    reasons: REASONS,
    defaultSelected: ['Label 1'],
    note: 'Subtitle',
    submittedTitle: 'Title',
    submittedDescription: 'Subtitle',
    onSubmit: fn(),
    onCancel: fn(),
    onClose: fn(),
    onUndo: fn(),
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['open', 'submitted'] },
    title: { control: 'text' },
    note: { control: 'text' },
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

/** Status and text are in Controls. Pick reasons, type, Send feedback. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-120">
      <FeedbackReason {...args} />
    </div>
  ),
})

Default.test('sends the picked reasons and the comment', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Label 3' }))
  await expect(canvas.getByRole('button', { name: 'Label 3' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.type(canvas.getByRole('textbox', { name: 'Comment' }), 'Value')
  await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({ reasons: ['Label 1', 'Label 3'], comment: 'Value' })
})

/** Figma state: open and submitted. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="flex w-120 flex-col gap-4">
      <FeedbackReason {...args} />
      <FeedbackReason {...args} status="submitted" />
    </div>
  ),
})

Statuses.test('submitted announces and offers Undo', async ({ canvas, args }) => {
  await expect(canvas.getByRole('status')).toHaveTextContent('Title')
  await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
  await expect(args.onUndo).toHaveBeenCalledOnce()
})

function Flow() {
  const [sent, setSent] = useState(false)
  return (
    <FeedbackReason
      status={sent ? 'submitted' : 'open'}
      title="Title"
      reasons={REASONS}
      note="Subtitle"
      submittedTitle="Title"
      submittedDescription="Subtitle"
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
