import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  ClarifyingAnswers,
  ClarifyingQuestion,
  type ClarifyingAnswersValue,
  type ClarifyingQuestionItem,
} from './clarifying-question'
import { MessageRow } from './message-row'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10732-2911'

/** Before drafting the onboarding email, the assistant asks three things. */
const QUESTIONS: ClarifyingQuestionItem[] = [
  {
    id: 'audience',
    title: 'Who is the email for?',
    description: 'I’ll match the examples to them.',
    options: [
      { value: 'beta', label: 'Beta partners (24)' },
      { value: 'trials', label: 'New trial sign-ups' },
      { value: 'customers', label: 'Existing customers' },
    ],
  },
  {
    id: 'tone',
    title: 'What tone should it have?',
    options: [
      { value: 'friendly', label: 'Friendly and short' },
      { value: 'formal', label: 'Formal' },
      { value: 'excited', label: 'Excited, launch-day energy' },
    ],
  },
  {
    id: 'cta',
    title: 'What should people do next?',
    options: [
      { value: 'start', label: 'Start the in-app checklist' },
      { value: 'call', label: 'Book an onboarding call' },
      { value: 'read', label: 'Read the launch post' },
    ],
  },
]

const ANSWERS: ClarifyingAnswersValue = { audience: 'beta', tone: 'friendly', cta: 'start' }

const meta = preview.meta({
  title: 'Agent Builder/Clarifying Question',
  tags: ['agent-builder', 'input'],
  component: ClarifyingQuestion,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'unanswered · answered',
        code: 'the answers (`answers` / `defaultAnswers`); answered after Submit = `submitted` (the summary)',
      },
      {
        property: 'step (next phase)',
        values: '1 · 2 · 3 · submitted',
        code: '`questions` (one or several) × `step` / `defaultStep` / `onStepChange`; `submitted`',
      },
      { property: 'title · description', values: 'text', code: 'each question’s `title`, `description`' },
      { property: 'options', values: 'text', code: 'each question’s `options` ({ value, label })' },
      { property: 'hint · Skip', values: 'text · button', code: '`hint`, `onSkip(id)`' },
    ],
    guide: {
      use: [
        'When the agent can’t continue without a choice from the user and the options are known (“Who is the email for?”).',
        'One question, or a short run of up to three, answered one step at a time: picking an option moves on, Back revisits, Submit sends them all.',
        'After Submit the card collapses to the summary, and the chat shows the same answers as the user’s message (`ClarifyingAnswers` in a user Message Row).',
      ],
      avoid: [
        'Open-ended questions: let the agent ask in a Message Row and the user answer in Prompt Input.',
        'Confirming an action with side effects: use Approval Card. Connecting an app: use Connector Card.',
        'Long forms or more than three questions: use Survey.',
      ],
      content: [
        'Title: the question, ending with a question mark. Description: why the agent asks, in one short sentence.',
        'Two to five short, mutually exclusive options in sentence case. Offer Skip when the agent can use a sensible default.',
      ],
      a11y: [
        'Options are buttons in a numbered list; number keys pick one while focus is inside the card; the chosen one is `aria-pressed`.',
        'Steps are announced by the description and the Progress (“Question 2 of 3”).',
        'Edit answers on the summary returns to the first question.',
      ],
    },
    docs: {
      description: {
        component:
          'The agent asks before it continues (`@/components/agent/clarifying-question`): `questions` (each `{ id, title, description?, options }`), `answers` / `defaultAnswers` / `onAnswersChange`, `step` / `defaultStep` / `onStepChange`, `submitted` / `onSubmit(answers)`, `onEdit`, `onSkip(id)`, `hint`. The flow is **question → user selection → progression → submitted result in chat**: each pick answers a step and moves to the next (Back returns, Skip leaves it unanswered); Submit on the last step collapses the card to its summary; `ClarifyingAnswers` renders the same question → answer list as the user’s message in the thread. Built from Shell Header / Footer, Icon Tile, Progress, Button and Kbd.',
      },
    },
  },
  args: { questions: QUESTIONS.slice(0, 1), onSubmit: fn(), onSkip: fn(), onAnswersChange: fn() },
  argTypes: {
    questions: { control: false },
    answers: { control: false },
    defaultAnswers: { control: false },
    step: { control: { type: 'number', min: 0, max: 2 } },
    submitted: { control: 'boolean' },
    hint: { control: 'text' },
    onAnswersChange: { control: false, table: { category: 'Events' } },
    onStepChange: { control: false, table: { category: 'Events' } },
    onSubmit: { control: false, table: { category: 'Events' } },
    onEdit: { control: false, table: { category: 'Events' } },
    onSkip: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="w-140">
      <ClarifyingQuestion {...args} />
    </div>
  ),
})

/** One question: pick an option (or press its number), then Submit. */
export const Default = meta.story()

Default.test('a number key picks; Submit sends the answer', async ({ canvas, args }) => {
  canvas.getAllByRole('button')[0].focus()
  await userEvent.keyboard('2')
  await expect(canvas.getByRole('button', { name: /New trial sign-ups/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({ audience: 'trials' })
  await expect(canvas.getByRole('heading', { name: 'Answered' })).toBeVisible()
})

/** Three questions, one step at a time: progress, Back, Skip and Submit on the last step. */
export const ThreeSteps = meta.story({ args: { questions: QUESTIONS } })

ThreeSteps.test('question → selection → progression → submitted', async ({ canvas, args }) => {
  await expect(canvas.getByText(/Question 1 of 3/)).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: /Beta partners/ }))
  await expect(canvas.getByText(/Question 2 of 3/)).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: /Back/ }))
  await expect(canvas.getByRole('button', { name: /Beta partners/ })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(canvas.getByRole('button', { name: /Beta partners/ }))
  await userEvent.click(canvas.getByRole('button', { name: /Friendly and short/ }))
  await expect(canvas.getByText(/Question 3 of 3/)).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Skip' }))
  await expect(args.onSkip).toHaveBeenCalledWith('cta')
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  await expect(args.onSubmit).toHaveBeenCalledWith({ audience: 'beta', tone: 'friendly', cta: null })
  const summary = canvas.getByRole('region', { name: 'Answered' })
  await expect(within(summary).getByText('Skipped')).toBeVisible()
})

/** Each step as it looks: step 1, step 2 (step 1 answered), step 3 (both answered). */
export const Steps = meta.story({
  render: (args) => (
    <div className="flex w-140 flex-col gap-4">
      <ClarifyingQuestion {...args} questions={QUESTIONS} />
      <ClarifyingQuestion
        {...args}
        questions={QUESTIONS}
        defaultStep={1}
        defaultAnswers={{ audience: 'beta' }}
      />
      <ClarifyingQuestion
        {...args}
        questions={QUESTIONS}
        defaultStep={2}
        defaultAnswers={{ audience: 'beta', tone: 'friendly' }}
      />
    </div>
  ),
})

/** Submitted: the card collapses to the answers, with Edit answers. */
export const Submitted = meta.story({
  args: { questions: QUESTIONS, defaultAnswers: ANSWERS, defaultSubmitted: true },
})

Submitted.test('Edit answers goes back to the first question', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Edit answers' }))
  await expect(canvas.getByText(/Question 1 of 3/)).toBeVisible()
})

function InChatDemo() {
  const [answers, setAnswers] = useState<ClarifyingAnswersValue | null>(null)
  return (
    <div className="flex w-160 flex-col gap-6">
      <MessageRow role="user" timestamp="10:41">
        Draft the onboarding email for the launch.
      </MessageRow>
      <MessageRow
        role="assistant"
        author="Assistant"
        timestamp="10:41"
        widget={
          <ClarifyingQuestion
            questions={QUESTIONS}
            submitted={answers !== null}
            onSubmit={setAnswers}
            onEdit={() => setAnswers(null)}
          />
        }
      >
        Before I draft it, three quick questions.
      </MessageRow>
      {answers && (
        <MessageRow role="user" timestamp="10:42">
          <ClarifyingAnswers questions={QUESTIONS} answers={answers} />
        </MessageRow>
      )}
    </div>
  )
}

/**
 * In the chat: the assistant asks in its message (the card is the widget), the user answers step
 * by step, and on Submit the card collapses while the answers appear as the user’s message.
 */
export const InChat = meta.story({
  parameters: { layout: 'padded' },
  render: () => <InChatDemo />,
})

InChat.test('submitted answers appear as the user’s message', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Beta partners/ }))
  await userEvent.click(canvas.getByRole('button', { name: /Friendly and short/ }))
  await userEvent.click(canvas.getByRole('button', { name: /Start the in-app checklist/ }))
  await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))
  const userRows = canvasElement.querySelectorAll('[data-slot=message-row][data-role=user]')
  await expect(userRows).toHaveLength(2)
  await expect(userRows[1]).toHaveTextContent('Who is the email for?Beta partners (24)')
  await expect(canvas.getByRole('region', { name: 'Answered' })).toBeVisible()
})
