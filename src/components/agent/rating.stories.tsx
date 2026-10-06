import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { Rating } from './rating'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-1937'

const meta = preview.meta({
  title: 'Agent Builder/Rating',
  tags: ['agent-builder', 'feedback'],
  component: Rating,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'type', values: 'stars · faces · csat', code: '`kind` prop' },
      {
        property: 'state',
        values: 'unrated · rated',
        code: '`value` / `defaultValue` (rated shows the thanks line and Add a comment)',
      },
      { property: 'question', values: 'text', code: '`question` prop' },
      { property: 'labels (csat)', values: 'text', code: '`lowLabel`, `highLabel` props' },
      { property: 'thanks', values: 'part / meta item', code: '`thanks` prop' },
      { property: 'button', values: 'Add a comment', code: 'pass `onCommentSubmit` or not' },
      {
        property: 'comment · state',
        values: 'collapsed · expanded · submitted',
        code: '`commentStatus` / `defaultCommentStatus` / `onCommentStatusChange`',
      },
    ],
    guide: {
      use: [
        'Right after the agent finishes a task: one quick satisfaction check on that answer or flow.',
        '`kind` stars or faces for a quick feeling; csat when you report a 1–5 satisfaction score.',
        'Pass `onCommentSubmit` to offer Add a comment once rated: collapsed → expanded (Textarea + Submit) → submitted, which closes the form and thanks the user. Cancel or Escape collapses it again.',
      ],
      avoid: [
        'Asking why an answer was bad (after a thumbs-down): use Feedback Reason.',
        'Loyalty on a 0–10 scale: use NPS. Several questions in a row: use Survey.',
        'Asking the user to choose between options: use Poll.',
      ],
      content: [
        'Question: short, about this task, in the agent’s voice (“How did I do?”).',
        'csat `lowLabel` / `highLabel` name the ends of the scale (“Very unsatisfied”, “Very satisfied”).',
        '`thanks`: short and specific (“Thanks! Anything we could do better?”); `commentSent` confirms the comment (“Thanks for the comment.”).',
        'The comment is optional: keep the placeholder a question (“What could be better?”).',
      ],
      a11y: [
        'The scale is a single-choice radio group named by the question; each option has a text name (“4 of 5”, “Good”).',
        'The thanks line is `role="status"`, so the rating and the sent comment are announced.',
        'Add a comment is a disclosure (`aria-expanded`); the Textarea takes focus when it opens, and Cancel / Escape return focus to the trigger.',
        'Faces and stars carry their meaning in their names, not only their shape or colour.',
      ],
    },
    docs: {
      description: {
        component:
          'A satisfaction check after a task (`@/components/agent/rating`): `kind` stars · faces · csat (1–5), `value` / `defaultValue` / `onValueChange`; once rated it thanks the user and, with `onCommentSubmit`, offers Add a comment (collapsed → expanded → submitted, on Collapsible). Composed from Card, Rating Scale, Collapsible, Textarea, Icon and Button.',
      },
    },
  },
  args: {
    kind: 'stars' as const,
    question: 'How did I do?',
    onValueChange: fn(),
    onCommentSubmit: fn(),
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['stars', 'faces', 'csat'] },
    question: { control: 'text' },
    value: { control: { type: 'number', min: 1, max: 5 } },
    lowLabel: { control: 'text' },
    highLabel: { control: 'text' },
    thanks: { control: 'text' },
    onValueChange: { control: false, table: { category: 'Events' } },
    commentStatus: { control: 'inline-radio', options: ['collapsed', 'expanded', 'submitted'] },
    commentPlaceholder: { control: 'text' },
    commentSent: { control: 'text' },
    onCommentSubmit: { control: false, table: { category: 'Events' } },
    onCommentStatusChange: { control: false, table: { category: 'Events' } },
  },
})

/** Kind and question are in Controls. Pick a rating. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-100">
      <Rating {...args} />
    </div>
  ),
})

Default.test('rate, comment, submit', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('radio', { name: '4 of 5' }))
  await expect(args.onValueChange).toHaveBeenCalledWith(4)
  await expect(canvas.getByRole('status')).toHaveTextContent('Thanks!')
  const trigger = canvas.getByRole('button', { name: 'Add a comment' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(trigger)
  const field = canvas.getByRole('textbox', { name: 'Comment' })
  await expect(field).toHaveFocus()
  await expect(canvas.getByRole('button', { name: 'Submit' })).toBeDisabled()
  await userEvent.type(field, 'The timeline section was too long.')
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  await expect(args.onCommentSubmit).toHaveBeenCalledWith('The timeline section was too long.')
  await expect(canvas.getByRole('status')).toHaveTextContent('Thanks for the comment.')
  await waitFor(() => expect(canvas.queryByRole('textbox')).toBeNull())
  await expect(canvas.queryByRole('button', { name: 'Add a comment' })).toBeNull()
})

Default.test('Cancel collapses it and returns focus', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('radio', { name: '5 of 5' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Add a comment' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }))
  await waitFor(() => expect(canvas.queryByRole('textbox')).toBeNull())
  await waitFor(() => expect(canvas.getByRole('button', { name: 'Add a comment' })).toHaveFocus())
  await expect(args.onCommentSubmit).not.toHaveBeenCalled()
})

/** The comment flow: collapsed (Add a comment) → expanded (Textarea + Submit) → submitted. */
export const Comment = meta.story({
  render: (args) => (
    <div className="grid w-210 grid-cols-3 items-start gap-4">
      {(['collapsed', 'expanded', 'submitted'] as const).map((status) => (
        <Rating key={status} {...args} defaultValue={4} defaultCommentStatus={status} />
      ))}
    </div>
  ),
})

/** Figma type × state: stars, faces and CSAT, unrated and rated. */
export const Kinds = meta.story({
  render: (args) => (
    <div className="grid w-210 grid-cols-2 items-start gap-4">
      {(['stars', 'faces', 'csat'] as const).map((kind) => (
        <div key={kind} className="contents">
          <Rating
            {...args}
            kind={kind}
            question={kind === 'csat' ? 'How satisfied are you with this answer?' : args.question}
          />
          <Rating
            {...args}
            kind={kind}
            question={kind === 'csat' ? 'How satisfied are you with this answer?' : args.question}
            defaultValue={4}
          />
        </div>
      ))}
    </div>
  ),
})

Kinds.test('faces and scores are single choice', async ({ canvas }) => {
  const [faces] = canvas.getAllByRole('radio', { name: 'Good' })
  await userEvent.click(faces)
  await expect(faces).toHaveAttribute('aria-checked', 'true')
  const [three] = canvas.getAllByRole('radio', { name: '3' })
  await userEvent.click(three)
  await expect(three).toHaveAttribute('aria-checked', 'true')
})
