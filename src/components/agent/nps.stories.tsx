import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Nps } from './nps'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-2049'

const meta = preview.meta({
  title: 'Agent Builder/NPS',
  tags: ['agent-builder', 'feedback'],
  component: Nps,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'unanswered · answered',
        code: '`score` / `defaultScore` / `onScoreChange` (answered shows the follow-up)',
      },
      { property: 'question', values: 'text', code: '`question` prop' },
      { property: 'scale', values: '0–10', code: 'Rating Scale numbers `min` 0 `max` 10' },
      { property: 'labels', values: 'text', code: '`lowLabel`, `highLabel` props' },
      {
        property: 'follow-up · textarea',
        values: 'text',
        code: '`followUp` (the Textarea label), `reason` / `defaultReason` / `onReasonChange`',
      },
      {
        property: 'footer',
        values: 'Not now · Next / Submit',
        code: '`onDismiss`; `onSubmit({ score, reason })` (Next, disabled, until scored)',
      },
    ],
    guide: {
      use: [
        'Measuring loyalty to the product, at a calm moment (after a completed task, never mid-flow).',
        'One score on 0–10, then one open follow-up about the reason; `onDismiss` lets the user skip.',
      ],
      avoid: [
        'Rating one answer or task: use Rating. Explaining a bad answer: use Feedback Reason.',
        'More than one question: use Survey. Choosing between options: use Poll.',
        'Asking often: show NPS at most once per period per user.',
      ],
      content: [
        'Question: the standard wording with the product name (“How likely are you to recommend Northwind Sync to a colleague?”).',
        '`lowLabel` / `highLabel`: “Not at all likely” and “Extremely likely”.',
        '`followUp`: one open question (“What’s the main reason for your score?”).',
      ],
      a11y: [
        'The card is a `group` named by the question; the 0–10 scale is a single-choice radio group named “Score”.',
        'The follow-up Textarea has a visible label; Next stays disabled until a score is picked.',
        'Scale ends are labelled in text, not only by position.',
      ],
    },
    docs: {
      description: {
        component:
          'Net Promoter Score (`@/components/agent/nps`): a 0–10 score, then the reason. `score` / `defaultScore` / `onScoreChange`, `reason` / `onReasonChange`, `onSubmit({ score, reason })`, `onDismiss` (Not now). Composed from Card, Rating Scale (shared with Rating), Textarea (with its label) and Shell Footer + Button.',
      },
    },
  },
  args: {
    question: 'How likely are you to recommend Northwind Sync to a colleague?',
    lowLabel: 'Not at all likely',
    highLabel: 'Extremely likely',
    followUp: 'What’s the main reason for your score?',
    onSubmit: fn(),
    onDismiss: fn(),
    onScoreChange: fn(),
  },
  argTypes: {
    question: { control: 'text' },
    score: { control: { type: 'number', min: 0, max: 10 } },
    lowLabel: { control: 'text' },
    highLabel: { control: 'text' },
    followUp: { control: 'text' },
    onScoreChange: { control: false, table: { category: 'Events' } },
    onReasonChange: { control: false, table: { category: 'Events' } },
    onSubmit: { control: false, table: { category: 'Events' } },
    onDismiss: { control: false, table: { category: 'Events' } },
  },
})

/** Pick a score, give a reason, Submit. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-160">
      <Nps {...args} />
    </div>
  ),
})

Default.test('Next waits for a score; Submit sends score and reason', async ({ canvas, args }) => {
  await expect(canvas.getByRole('button', { name: 'Next' })).toBeDisabled()
  await userEvent.click(canvas.getByRole('radio', { name: '9' }))
  await expect(args.onScoreChange).toHaveBeenCalledWith(9)
  await userEvent.type(
    canvas.getByRole('textbox', { name: 'What’s the main reason for your score?' }),
    'Sync saves my team hours every week.',
  )
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({
    score: 9,
    reason: 'Sync saves my team hours every week.',
  })
})

/** Figma state: unanswered and answered. */
export const States = meta.story({
  render: (args) => (
    <div className="flex w-160 flex-col gap-4">
      <Nps {...args} />
      <Nps {...args} defaultScore={9} defaultReason="Sync saves my team hours every week." />
    </div>
  ),
})

States.test('Not now dismisses', async ({ canvas, args }) => {
  await userEvent.click(canvas.getAllByRole('button', { name: 'Not now' })[0])
  await expect(args.onDismiss).toHaveBeenCalledOnce()
})
