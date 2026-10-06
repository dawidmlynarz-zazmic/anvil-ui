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
    docs: {
      description: {
        component:
          'Net Promoter Score (`@/components/agent/nps`): a 0–10 score, then the reason. `score` / `defaultScore` / `onScoreChange`, `reason` / `onReasonChange`, `onSubmit({ score, reason })`, `onDismiss` (Not now). Composed from Card, Rating Scale (shared with Rating), Textarea (with its label) and Shell Footer + Button.',
      },
    },
  },
  args: {
    question: 'Title',
    lowLabel: 'Subtitle',
    highLabel: 'Subtitle',
    followUp: 'Label',
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
  await userEvent.type(canvas.getByRole('textbox', { name: 'Label' }), 'Value')
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({ score: 9, reason: 'Value' })
})

/** Figma state: unanswered and answered. */
export const States = meta.story({
  render: (args) => (
    <div className="flex w-160 flex-col gap-4">
      <Nps {...args} />
      <Nps {...args} defaultScore={9} defaultReason="Value" />
    </div>
  ),
})

States.test('Not now dismisses', async ({ canvas, args }) => {
  await userEvent.click(canvas.getAllByRole('button', { name: 'Not now' })[0])
  await expect(args.onDismiss).toHaveBeenCalledOnce()
})
