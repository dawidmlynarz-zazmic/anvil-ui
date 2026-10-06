import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Survey, type SurveyQuestion } from './survey'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-2241'

const QUESTIONS: SurveyQuestion[] = [
  { id: 'q1', kind: 'single', question: 'Title', options: ['Label 1', 'Label 2', 'Label 3', 'Label 4'] },
  {
    id: 'q2',
    kind: 'multiple',
    question: 'Title',
    hint: 'Subtitle',
    options: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'],
  },
  { id: 'q3', kind: 'text', question: 'Title', placeholder: 'Placeholder' },
]

const meta = preview.meta({
  title: 'Agent Builder/Survey',
  tags: ['agent-builder', 'feedback'],
  component: Survey,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'step',
        values: 'single · multiple · text · complete',
        code: '`step` / `defaultStep` / `onStepChange` over `questions` (each with `kind` single · multiple · text); `questions.length` = complete',
      },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'progress label', values: 'text', code: 'step count + `estimate`; "Done" when complete' },
      { property: 'progress', values: 'brand · success', code: 'Progress sm, success when complete' },
      {
        property: 'question · hint · options',
        values: 'text',
        code: '`question`, `hint`, `options` per question',
      },
      {
        property: 'footer',
        values: 'Back · Skip · Next / Submit · Close',
        code: '`onSubmit(answers)` on the last step, `onClose` when done',
      },
      { property: 'complete · title · detail', values: 'text', code: '`doneTitle`, `doneDescription`' },
    ],
    docs: {
      description: {
        component:
          'A short in-chat survey (`@/components/agent/survey`), one question per step with progress: `questions` of `kind` single (Radio Group) · multiple (Checkboxes) · text (Textarea); Back, Skip, Next and Submit (`onSubmit(answers)`), then a done state with Close. `step` and `answers` can be controlled. Composed from Card, Shell Header / Footer, Progress, FieldSet, Radio Group, Checkbox, Label, Textarea, Empty, Icon Tile and Button.',
      },
    },
  },
  args: {
    title: 'Title',
    questions: QUESTIONS,
    estimate: 'Subtitle',
    doneTitle: 'Title',
    doneDescription: 'Subtitle',
    onSubmit: fn(),
    onClose: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    estimate: { control: 'text' },
    step: { control: { type: 'number', min: 0, max: 3 } },
    doneTitle: { control: 'text' },
    doneDescription: { control: 'text' },
    questions: { control: false },
    answers: { control: false },
    defaultAnswers: { control: false },
    onStepChange: { control: false, table: { category: 'Events' } },
    onAnswersChange: { control: false, table: { category: 'Events' } },
    onSubmit: { control: false, table: { category: 'Events' } },
    onClose: { control: false, table: { category: 'Events' } },
  },
})

/** Answer, Next, Submit. `step` is in Controls. */
export const Default = meta.story({
  render: (args) => (
    <div className="w-140">
      <Survey {...args} />
    </div>
  ),
})

Default.test('walks the steps and submits the answers', async ({ canvas, args }) => {
  await expect(canvas.getByRole('button', { name: 'Back' })).toBeDisabled()
  await userEvent.click(canvas.getByRole('radio', { name: 'Label 2' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
  await userEvent.click(canvas.getByRole('checkbox', { name: 'Label 1' }))
  await userEvent.click(canvas.getByRole('checkbox', { name: 'Label 3' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
  await userEvent.type(canvas.getByRole('textbox'), 'Value')
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({ q1: 'Label 2', q2: ['Label 1', 'Label 3'], q3: 'Value' })
  await expect(canvas.getByRole('status')).toHaveTextContent('Title')
  await userEvent.click(canvas.getByRole('button', { name: 'Close' }))
  await expect(args.onClose).toHaveBeenCalledOnce()
})

/** Figma step: single, multiple, text and complete. */
export const Steps = meta.story({
  render: (args) => (
    <div className="grid w-290 grid-cols-2 items-start gap-4">
      <Survey {...args} defaultAnswers={{ q1: 'Label 2', q2: ['Label 1', 'Label 2'] }} />
      <Survey {...args} defaultStep={1} defaultAnswers={{ q2: ['Label 1', 'Label 2'] }} />
      <Survey {...args} defaultStep={2} />
      <Survey {...args} defaultStep={3} />
    </div>
  ),
})

Steps.test('Back returns to the previous step', async ({ canvas }) => {
  const [, second] = canvas.getAllByRole('button', { name: 'Back' })
  await userEvent.click(second)
  await expect(canvas.getAllByRole('radio', { name: 'Label 1' })).toHaveLength(2)
})
