import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard, TaskCardBody } from '@/components/agent/task-card'
import { Chip } from '@/components/anvil/chip'
import { ShellFooter } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, CircleHelpIcon, Icon, XIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Tasks · question set (10711:145): two to four quick questions before the agent
// starts, answered with chips. Built on Task Card + Chip + Button + Badge, nothing re-drawn. Figma state
// unanswered · answered is the answers themselves (`value`), not a prop.
// - Each question is a fieldset named by its text (“1. Which …?”); its options are toggle Chips (outline,
//   pill): a chosen one is filled and shows a ×, and pressing it again clears it. `multiple` allows more
//   than one choice per question (default one).
// - The header Badge counts the answers (“0 of 3 answered”, outline). The footer has Skip questions
//   (ghost, `onSkip`) and the submit Button (brand, arrow): disabled until something is answered, with the
//   label `submitLabel` (“Continue”) that becomes `answeredSubmitLabel` (“Update brief”) once it is.
// - Controlled (`value` / `onValueChange`) or uncontrolled (`defaultValue`): a map of question id → chosen options.

type Question = { id: string; question: React.ReactNode; options: string[]; multiple?: boolean }
type Answers = Record<string, string[]>

function QuestionSet({
  title,
  subtitle,
  questions,
  value,
  defaultValue,
  onValueChange,
  answeredLabel = (answered, total) => `${answered} of ${total} answered`,
  skipLabel = 'Skip questions',
  onSkip,
  submitLabel = 'Continue',
  answeredSubmitLabel,
  onSubmit,
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof TaskCard>,
  'icon' | 'badge' | 'footer' | 'children' | 'onSubmit' | 'value' | 'defaultValue'
> & {
  questions: Question[]
  value?: Answers
  defaultValue?: Answers
  onValueChange?: (value: Answers) => void
  answeredLabel?: (answered: number, total: number) => React.ReactNode
  skipLabel?: React.ReactNode
  onSkip?: () => void
  submitLabel?: React.ReactNode
  /** The submit label once something is answered; defaults to `submitLabel`. */
  answeredSubmitLabel?: React.ReactNode
  onSubmit?: (value: Answers) => void
}) {
  const [inner, setInner] = React.useState<Answers>(defaultValue ?? {})
  const answers = value ?? inner
  const answered = questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length
  const pick = (question: Question, option: string) => {
    const current = answers[question.id] ?? []
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : question.multiple
        ? [...current, option]
        : [option]
    const result = { ...answers, [question.id]: next }
    setInner(result)
    onValueChange?.(result)
  }
  return (
    <TaskCard
      data-slot="question-set"
      icon={CircleHelpIcon}
      title={title}
      subtitle={subtitle}
      badge={
        <Badge variant="outline" tone="neutral" size="xs">
          {answeredLabel(answered, questions.length)}
        </Badge>
      }
      className={cn(className)}
      footer={
        <ShellFooter variant="card" align="between">
          <Button variant="ghost" intent="neutral" size="sm" onClick={onSkip}>
            {skipLabel}
          </Button>
          <Button intent="brand" size="sm" disabled={answered === 0} onClick={() => onSubmit?.(answers)}>
            <Icon icon={ArrowRightIcon} />
            {answered > 0 ? (answeredSubmitLabel ?? submitLabel) : submitLabel}
          </Button>
        </ShellFooter>
      }
      {...props}
    >
      <TaskCardBody>
        {questions.map((question, index) => (
          <fieldset key={question.id} className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 type-text-sm-medium text-foreground">
              {index + 1}. {question.question}
            </legend>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => {
                const pressed = answers[question.id]?.includes(option) ?? false
                return (
                  <Chip
                    key={option}
                    variant="outline"
                    shape="pill"
                    pressed={pressed}
                    onPressedChange={() => pick(question, option)}
                  >
                    {option}
                    {pressed && <Icon icon={XIcon} />}
                  </Chip>
                )
              })}
            </div>
          </fieldset>
        ))}
      </TaskCardBody>
    </TaskCard>
  )
}

export { QuestionSet, type Question, type Answers }
