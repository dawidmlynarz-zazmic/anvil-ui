import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellDescription, ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  CircleHelpIcon,
  Icon,
  PencilIcon,
} from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'
import { Progress } from '@/components/ui/progress'

// Figma Agent Builder › Core Kit › clarifying question (10732:2911): the agent asks before it
// continues — one question, or a short run of questions answered one step at a time. Composed,
// nothing re-drawn: a card (--card, --border, radius xl, ≤560px) →
// - Shell Header card (no divider): agent Icon Tile (help), the question (title) and its
//   `description`; with several questions the description is "Question 2 of 3" and a Progress
//   sm (agent) runs under the header.
// - the options (16px sides, 6px apart): outline · neutral Buttons, left-aligned, each with its
//   number (Kbd), the label (text/sm) and a 14px arrow. Picking one answers the step and moves on;
//   number keys pick while focus is in the card. The current answer is marked (--info-subtle,
//   --border-action, check).
// - Shell Footer card: Back (ghost xs, from step 2) · the hint (`hint`, text/xs) · Skip (ghost xs,
//   `onSkip`: leaves this question unanswered and moves on) · Submit (brand xs, last step, once
//   every question is answered or skipped).
// - submitted: the card collapses to a summary — "Answered" + the question → answer rows
//   (`ClarifyingAnswers`) + Edit answers (back to step 1). The same summary is what the chat
//   shows as the user's message (put `ClarifyingAnswers` in a user Message Bubble).
// Figma state unanswered · answered = the answers; Figma's single answered card is the summary.

type Option = { value: string; label: string }
type Question = { id: string; title: React.ReactNode; description?: React.ReactNode; options: Option[] }
type Answers = Record<string, string | null>

/** The question → answer list: the submitted card's body, and the user's message in the chat. */
function ClarifyingAnswers({
  questions,
  answers,
  className,
  ...props
}: React.ComponentProps<'dl'> & { questions: Question[]; answers: Answers }) {
  return (
    <dl data-slot="clarifying-answers" className={cn('flex flex-col gap-2', className)} {...props}>
      {questions.map((question) => {
        const answer = question.options.find((option) => option.value === answers[question.id])
        return (
          <div key={question.id} className="flex flex-col gap-0.5">
            <dt className="type-text-xs-normal text-muted-foreground">{question.title}</dt>
            <dd className="type-text-sm-medium text-foreground">{answer?.label ?? 'Skipped'}</dd>
          </div>
        )
      })}
    </dl>
  )
}

function ClarifyingQuestion({
  questions,
  answers: answersProp,
  defaultAnswers = {},
  onAnswersChange,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  submitted: submittedProp,
  defaultSubmitted = false,
  onSubmit,
  onEdit,
  onSkip,
  hint,
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'onSubmit'> & {
  /** One question, or a short run of them (three at most reads well). */
  questions: Question[]
  answers?: Answers
  defaultAnswers?: Answers
  onAnswersChange?: (answers: Answers) => void
  /** The current question, 0-based. */
  step?: number
  defaultStep?: number
  onStepChange?: (step: number) => void
  /** Collapsed to the summary after Submit. */
  submitted?: boolean
  defaultSubmitted?: boolean
  /** Submit: every answer (`null` for a skipped question). Shows the Submit button. */
  onSubmit?: (answers: Answers) => void
  /** Edit answers from the summary. */
  onEdit?: () => void
  /** Skip: called with the skipped question's id. Shows the Skip button. */
  onSkip?: (id: string) => void
  /** Footer hint; defaults to the number-key tip. */
  hint?: React.ReactNode
}) {
  const [innerAnswers, setInnerAnswers] = React.useState(defaultAnswers)
  const [innerStep, setInnerStep] = React.useState(defaultStep)
  const [innerSubmitted, setInnerSubmitted] = React.useState(defaultSubmitted)
  const answers = answersProp ?? innerAnswers
  const step = Math.min(stepProp ?? innerStep, questions.length - 1)
  const submitted = submittedProp ?? innerSubmitted
  const titleId = React.useId()
  const question = questions[step]
  const last = step === questions.length - 1
  const several = questions.length > 1
  const complete = questions.every((q) => q.id in answers)

  const go = (next: number) => {
    setInnerStep(next)
    onStepChange?.(next)
  }
  const answer = (value: string | null) => {
    const next = { ...answers, [question.id]: value }
    setInnerAnswers(next)
    onAnswersChange?.(next)
    if (!last) go(step + 1)
  }
  const submit = () => {
    setInnerSubmitted(true)
    onSubmit?.(answers)
  }

  if (submitted) {
    return (
      <section
        data-slot="clarifying-question"
        data-state="submitted"
        aria-labelledby={titleId}
        className={cn(
          'flex w-full max-w-140 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground',
          className,
        )}
        {...props}
      >
        <ShellHeader
          variant="card"
          className="border-b-0"
          media={<IconTile icon={CheckIcon} tone="success" size="sm" />}
          trailing={
            <Button
              variant="ghost"
              intent="neutral"
              size="xs"
              onClick={() => {
                setInnerSubmitted(false)
                go(0)
                onEdit?.()
              }}
            >
              <Icon icon={PencilIcon} />
              Edit answers
            </Button>
          }
        >
          <ShellTitle id={titleId}>Answered</ShellTitle>
          <ShellDescription>
            {several ? `${questions.length} questions` : 'Sent to the assistant'}
          </ShellDescription>
        </ShellHeader>
        <ClarifyingAnswers questions={questions} answers={answers} className="px-4 pb-4" />
      </section>
    )
  }

  return (
    <section
      data-slot="clarifying-question"
      data-state={question.id in answers ? 'answered' : 'unanswered'}
      data-step={step}
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return
        const index = Number(event.key) - 1
        if (Number.isInteger(index) && index >= 0 && index < question.options.length) {
          event.preventDefault()
          answer(question.options[index].value)
        }
      }}
      className={cn(
        'flex w-full max-w-140 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      <ShellHeader
        variant="card"
        className="border-b-0"
        media={<IconTile icon={CircleHelpIcon} tone="agent" size="sm" />}
      >
        <ShellTitle id={titleId}>{question.title}</ShellTitle>
        {(several || question.description) && (
          <ShellDescription>
            {several ? `Question ${step + 1} of ${questions.length}` : question.description}
            {several && question.description ? ` · ${question.description}` : null}
          </ShellDescription>
        )}
      </ShellHeader>
      {several && (
        <div className="px-4 pb-3">
          <Progress
            size="sm"
            tone="agent"
            value={((step + (question.id in answers ? 1 : 0)) / questions.length) * 100}
            aria-label={`Question ${step + 1} of ${questions.length}`}
          />
        </div>
      )}
      <ol aria-label="Options" className="flex flex-col gap-1.5 px-4 pb-4">
        {question.options.map((option, i) => {
          const chosen = answers[question.id] === option.value
          return (
            <li key={option.value}>
              <Button
                variant="outline"
                intent="neutral"
                aria-pressed={chosen}
                onClick={() => answer(option.value)}
                className={cn(
                  'h-auto w-full justify-start gap-2.5 px-3 py-2.5 text-left whitespace-normal',
                  'aria-pressed:bg-info-subtle aria-pressed:inset-ring-border-action',
                )}
              >
                <Kbd className="size-5.5">{i + 1}</Kbd>
                <span className="min-w-0 flex-1 type-text-sm-normal text-foreground">{option.label}</span>
                <Icon
                  icon={chosen ? CheckIcon : ArrowRightIcon}
                  className={cn('size-3.5', chosen ? 'text-info-medium' : 'text-muted-foreground')}
                />
              </Button>
            </li>
          )
        })}
      </ol>
      <ShellFooter variant="card" note={hint ?? `Press 1–${question.options.length} to choose`}>
        {several && step > 0 && (
          <Button
            variant="ghost"
            intent="neutral"
            size="xs"
            onClick={() => go(step - 1)}
            className="order-first"
          >
            <Icon icon={ChevronLeftIcon} />
            Back
          </Button>
        )}
        {onSkip && (
          <Button
            variant="ghost"
            intent="neutral"
            size="xs"
            onClick={() => {
              onSkip(question.id)
              answer(null)
            }}
          >
            Skip
          </Button>
        )}
        {onSubmit && last && (
          <Button intent="brand" size="xs" disabled={!complete} onClick={submit}>
            Submit
          </Button>
        )}
      </ShellFooter>
    </section>
  )
}

export {
  ClarifyingQuestion,
  ClarifyingAnswers,
  type Option as ClarifyingOption,
  type Question as ClarifyingQuestionItem,
  type Answers as ClarifyingAnswersValue,
}
