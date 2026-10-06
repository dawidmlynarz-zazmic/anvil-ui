import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Survey, type SurveyQuestion } from './survey'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10726-2241'

const QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    kind: 'single',
    question: 'How often do you use the assistant?',
    options: ['Every day', 'A few times a week', 'A few times a month', 'Rarely'],
  },
  {
    id: 'q2',
    kind: 'multiple',
    question: 'What do you use it for?',
    hint: 'Select all that apply.',
    options: ['Research', 'Writing drafts', 'Summarizing files', 'Data and charts', 'Planning projects'],
  },
  {
    id: 'q3',
    kind: 'text',
    question: 'What would make the assistant more useful?',
    placeholder: 'Tell us in a sentence or two',
  },
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
    guide: {
      use: [
        'A short study inside the chat: two to five questions about how people use the product.',
        'One question per step with progress, so it never feels long; let users Skip any question.',
      ],
      avoid: [
        'A single score: use Rating (one task) or NPS (loyalty). A single choice for a group: use Poll.',
        'Why one answer was bad: use Feedback Reason.',
        'Long research surveys: link out to a full form instead of a card in the thread.',
      ],
      content: [
        '`title` names the survey (“Quick survey”); `estimate` sets expectations (“about 1 min”).',
        'Questions are plain and about the user (“How often do you use the assistant?”); `hint` only when the answer type needs it (“Select all that apply.”).',
        'Done: thank the user and say what happens next.',
      ],
      a11y: [
        'Each step is a FieldSet whose legend is the question; options use Radio Group or Checkboxes with labels.',
        'Progress is a labelled progress bar (“Survey progress”) plus the “1 of 3” text.',
        'The done state is `role="status"`, so finishing is announced.',
      ],
    },
    docs: {
      description: {
        component:
          'A short in-chat survey (`@/components/agent/survey`), one question per step with progress: `questions` of `kind` single (Radio Group) · multiple (Checkboxes) · text (Textarea); Back, Skip, Next and Submit (`onSubmit(answers)`), then a done state with Close. `step` and `answers` can be controlled. Composed from Card, Shell Header / Footer, Progress, FieldSet, Radio Group, Checkbox, Label, Textarea, Empty, Icon Tile and Button.',
      },
    },
  },
  args: {
    title: 'Quick survey',
    questions: QUESTIONS,
    estimate: 'about 1 min',
    doneTitle: 'Thanks for your answers',
    doneDescription: 'The Northwind Labs team reads every response.',
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
  await userEvent.click(canvas.getByRole('radio', { name: 'A few times a week' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
  await userEvent.click(canvas.getByRole('checkbox', { name: 'Research' }))
  await userEvent.click(canvas.getByRole('checkbox', { name: 'Summarizing files' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Next' }))
  await userEvent.type(canvas.getByRole('textbox'), 'Remember my launch checklist.')
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({
    q1: 'A few times a week',
    q2: ['Research', 'Summarizing files'],
    q3: 'Remember my launch checklist.',
  })
  await expect(canvas.getByRole('status')).toHaveTextContent('Thanks for your answers')
  await userEvent.click(canvas.getByRole('button', { name: 'Close' }))
  await expect(args.onClose).toHaveBeenCalledOnce()
})

/** Figma step: single, multiple, text and complete. */
export const Steps = meta.story({
  render: (args) => (
    <div className="grid w-290 grid-cols-2 items-start gap-4">
      <Survey {...args} defaultAnswers={{ q1: 'A few times a week', q2: ['Research', 'Writing drafts'] }} />
      <Survey {...args} defaultStep={1} defaultAnswers={{ q2: ['Research', 'Writing drafts'] }} />
      <Survey {...args} defaultStep={2} />
      <Survey {...args} defaultStep={3} />
    </div>
  ),
})

Steps.test('Back returns to the previous step', async ({ canvas }) => {
  const [, second] = canvas.getAllByRole('button', { name: 'Back' })
  await userEvent.click(second)
  await expect(canvas.getAllByRole('radio', { name: 'Every day' })).toHaveLength(2)
})
