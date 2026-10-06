import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { RatingScale } from './rating-scale'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-1937'

const meta = preview.meta({
  title: 'Design System/Molecules/Rating Scale',
  tags: ['molecule', 'feedback'],
  component: RatingScale,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'rating · type', values: 'stars · faces · csat', code: '`scale` stars · faces · numbers' },
      { property: 'nps · scale', values: '0–10', code: '`scale="numbers"` `min={0}` `max={10}`' },
      { property: 'labels', values: 'text', code: '`lowLabel`, `highLabel` (numbers)' },
    ],
    guide: {
      use: [
        'Asking for a score after an answer or a session: stars or faces for a quick rating, `numbers` 1–5 for CSAT, 0–10 for NPS.',
        'Inside the Rating and NPS feedback blocks, which add the question, the follow-up and Submit.',
      ],
      avoid: [
        'A one-tap verdict on a single answer: use the Good / Bad response buttons in Message Actions.',
        'Choosing between named options: use Radio Group or Choice Card. A value on a continuous range: use Slider.',
      ],
      content: [
        'End labels say what the extremes mean (“Not helpful” · “Very helpful”), not just numbers.',
        'Ask one specific question in the group’s name: “How helpful was this answer?”.',
      ],
      a11y: [
        'A radio group (Toggle Group, single): one Tab stop, arrow keys move between scores, each score is a named radio.',
        'Always pass `aria-label` (or `aria-labelledby` to the visible question).',
        'Stars and faces have text names, and the selected score is shown by more than color.',
      ],
    },
    docs: {
      description: {
        component:
          'A single-choice satisfaction scale (`@/components/agent/rating-scale`, on Toggle Group): `scale` stars · faces (1–5) · numbers (`min`–`max`, with `lowLabel` / `highLabel`); `value` / `defaultValue` / `onValueChange`. Rating and NPS are built on it. Arrow keys move between scores.',
      },
    },
  },
  args: {
    scale: 'numbers' as const,
    min: 1,
    max: 5,
    lowLabel: 'Not helpful',
    highLabel: 'Very helpful',
    'aria-label': 'How helpful was this answer?',
    onValueChange: fn(),
  },
  argTypes: {
    scale: { control: 'inline-radio', options: ['stars', 'faces', 'numbers'] },
    min: { control: { type: 'number', min: 0, max: 1 } },
    max: { control: { type: 'number', min: 5, max: 10 } },
    value: { control: { type: 'number', min: 0, max: 10 } },
    lowLabel: { control: 'text' },
    highLabel: { control: 'text' },
    onValueChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="w-120">
      <RatingScale {...args} />
    </div>
  ),
})

/** Scale, range and labels are in Controls. */
export const Default = meta.story()

Default.test('picks one score', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('radio', { name: '4' }))
  await expect(args.onValueChange).toHaveBeenCalledWith(4)
  await expect(canvas.getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'true')
})

/** Every scale: stars, faces, numbers 1–5 (CSAT) and 0–10 (NPS). */
export const Scales = meta.story({
  render: () => (
    <div className="flex w-120 flex-col gap-6">
      <RatingScale scale="stars" aria-label="Rate this answer" defaultValue={3} />
      <RatingScale scale="faces" aria-label="How was your session?" />
      <RatingScale
        aria-label="How satisfied are you with Assistant?"
        lowLabel="Very unsatisfied"
        highLabel="Very satisfied"
      />
      <RatingScale
        aria-label="How likely are you to recommend Assistant to a colleague?"
        min={0}
        max={10}
        defaultValue={9}
        lowLabel="Not likely"
        highLabel="Extremely likely"
      />
    </div>
  ),
})

Scales.test('the keyboard moves between scores', async ({ canvas }) => {
  const one = canvas.getAllByRole('radio', { name: '1' })[0]
  one.focus()
  await userEvent.keyboard('{ArrowRight}')
  await expect(canvas.getAllByRole('radio', { name: '2' })[0]).toHaveFocus()
})
