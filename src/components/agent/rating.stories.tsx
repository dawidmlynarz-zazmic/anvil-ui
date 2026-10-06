import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Rating } from './rating'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-1937'

const meta = preview.meta({
  title: 'Agent Primitives/Feedback & Surveys/Rating',
  tags: ['composite'],
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
      { property: 'button', values: 'Add a comment', code: 'pass `onComment` or not' },
    ],
    docs: {
      description: {
        component:
          'A satisfaction check after a task (`@/components/agent/rating`): `kind` stars · faces · csat (1–5), `value` / `defaultValue` / `onValueChange`; once rated it thanks the user and, with `onComment`, offers Add a comment. Composed from Card, Rating Scale, Icon and Button.',
      },
    },
  },
  args: {
    kind: 'stars' as const,
    question: 'Title',
    onValueChange: fn(),
    onComment: fn(),
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['stars', 'faces', 'csat'] },
    question: { control: 'text' },
    value: { control: { type: 'number', min: 1, max: 5 } },
    lowLabel: { control: 'text' },
    highLabel: { control: 'text' },
    thanks: { control: 'text' },
    onValueChange: { control: false, table: { category: 'Events' } },
    onComment: { control: false, table: { category: 'Events' } },
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

Default.test('rating thanks the user and offers a comment', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('radio', { name: '4 of 5' }))
  await expect(args.onValueChange).toHaveBeenCalledWith(4)
  await expect(canvas.getByRole('status')).toHaveTextContent('Thanks!')
  await userEvent.click(canvas.getByRole('button', { name: 'Add a comment' }))
  await expect(args.onComment).toHaveBeenCalledOnce()
})

/** Figma type × state: stars, faces and CSAT, unrated and rated. */
export const Kinds = meta.story({
  render: (args) => (
    <div className="grid w-210 grid-cols-2 items-start gap-4">
      {(['stars', 'faces', 'csat'] as const).map((kind) => (
        <div key={kind} className="contents">
          <Rating {...args} kind={kind} />
          <Rating {...args} kind={kind} defaultValue={4} />
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
