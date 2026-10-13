import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { QuestionSet } from './question-set'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10711-145'

const QUESTIONS = [
  { id: 'regions', question: 'Which regions matter most?', options: ['US', 'EU', 'UK', 'All of them'] },
  { id: 'plans', question: 'Include free and trial plans?', options: ['Yes', 'No'] },
  {
    id: 'sources',
    question: 'Preferred source types?',
    options: ['Pricing pages', 'Analyst reports', 'News', 'Customer reviews'],
    multiple: true,
  },
]

const meta = preview.meta({
  title: 'Agent Builder/Tasks/Question Set',
  tags: ['agent-builder'],
  component: QuestionSet,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'unanswered · answered',
        code: 'the answers themselves: `value` / `defaultValue`, not a prop',
      },
      {
        property: 'questions',
        values: 'text + option chips',
        code: '`questions` prop (`multiple` per question)',
      },
      { property: 'answered count', values: 'text', code: '`answeredLabel` (outline Badge in the header)' },
      {
        property: 'footer',
        values: 'skip · continue / update',
        code: '`onSkip` · `onSubmit`; `submitLabel` → `answeredSubmitLabel`',
      },
    ],
    guide: {
      use: [
        'Two to four quick questions before a task starts, when the answers sharpen the brief (preferences, intake, a short quiz).',
        'Use `multiple` for “pick any” questions; one choice is the default.',
        'Let people skip: the agent can proceed with defaults.',
      ],
      avoid: [
        'One question that needs a decision before anything continues: use Clarifying Question.',
        'Open-ended answers: ask in the chat.',
        'More than four questions: ask the most useful ones now and the rest later.',
      ],
      content: [
        'Questions are short and specific (“Which regions matter most?”); options are one to three words.',
        'The submit button says what happens (“Continue”, then “Update brief” once answers change the brief).',
      ],
      a11y: [
        'Each question is a fieldset named by its text; options are toggle buttons with `aria-pressed`.',
        'The count in the header is text (“1 of 3 answered”); Continue is disabled until one question is answered.',
      ],
    },
    docs: {
      description: {
        component:
          'A short set of questions answered with chips (`@/components/agent/question-set`, on Task Card): `questions`, `value` / `defaultValue` / `onValueChange`, `answeredLabel`, `onSkip`, `onSubmit`, `submitLabel` · `answeredSubmitLabel`.',
      },
    },
  },
  args: {
    title: 'Before I start',
    subtitle: '3 quick questions to sharpen the brief',
    questions: QUESTIONS,
    submitLabel: 'Continue',
    answeredSubmitLabel: 'Update brief',
    onSkip: fn(),
    onSubmit: fn(),
    onValueChange: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    questions: { control: 'object' },
    value: { control: false },
    defaultValue: { control: 'object' },
    submitLabel: { control: 'text' },
    answeredSubmitLabel: { control: 'text' },
    skipLabel: { control: 'text' },
    answeredLabel: { control: false },
    onSkip: { control: false, table: { category: 'Events' } },
    onSubmit: { control: false, table: { category: 'Events' } },
    onValueChange: { control: false, table: { category: 'Events' } },
  },
})

/** Pick chips; Continue wakes up once something is answered. */
export const Default = meta.story()

Default.test('counts answers and enables Continue', async ({ canvas, args }) => {
  await expect(canvas.getByText('0 of 3 answered')).toBeVisible()
  await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled()
  await userEvent.click(canvas.getByRole('button', { name: 'EU' }))
  await expect(canvas.getByRole('button', { name: 'EU' })).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas.getByText('1 of 3 answered')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Update brief' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({ regions: ['EU'] })
})

Default.test('one choice per question, several where multiple', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'US' }))
  await userEvent.click(canvas.getByRole('button', { name: 'EU' }))
  await expect(canvas.getByRole('button', { name: 'US' })).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(canvas.getByRole('button', { name: 'News' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Customer reviews' }))
  await expect(canvas.getByRole('button', { name: 'News' })).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas.getByRole('button', { name: 'Customer reviews' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

/** Figma state answered. */
export const Answered = meta.story({
  args: { defaultValue: { regions: ['EU'], plans: ['Yes'], sources: ['Pricing pages'] } },
})

Answered.test('shows the answers and the updated label', async ({ canvas }) => {
  await expect(canvas.getByText('3 of 3 answered')).toBeVisible()
  await expect(canvas.getByRole('button', { name: 'Update brief' })).toBeEnabled()
})
