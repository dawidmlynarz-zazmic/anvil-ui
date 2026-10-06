import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { ChevronLeftIcon, CircleCheckIcon, Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

// Figma Agent Builder › Core Kit › survey (10726:2241): a short in-chat survey, one question per step.
// Composed, nothing re-drawn: Card (--card, --border, radius xl, ≤560px) →
// - Shell Header card (16px, divider): title text/sm/semibold, the progress label ("1 of 3 · about
//   1 min", text/xs muted) and Progress sm (4px; brand, success when done).
// - the step (16px, 12px gap) as a FieldSet: the question is its legend (text/base/medium), an
//   optional hint (Field Description) and the answer — single: Radio Group with inline Labels ·
//   multiple: Checkboxes with inline Labels · text: Textarea. Options sit 10px apart.
// - done: Empty (32 / 16px) with a success Icon Tile (40px), title heading/xl, description.
// - Shell Footer card `align` between: Back (ghost sm, chevron; disabled on the first step) | Skip
//   (ghost sm) + Next (brand sm; Submit on the last step). Done: Close (outline sm).
// Figma step single · multiple · text · complete = the current question's `kind`, or done.

type SurveyQuestion = {
  id: string
  kind: 'single' | 'multiple' | 'text'
  question: React.ReactNode
  /** Under the question, e.g. "Select all that apply". */
  hint?: React.ReactNode
  /** single / multiple: the options. */
  options?: string[]
  /** text: the placeholder. */
  placeholder?: string
}

type SurveyAnswers = Record<string, string | string[]>

function Survey({
  title,
  questions,
  estimate,
  step,
  defaultStep = 0,
  onStepChange,
  answers,
  defaultAnswers = {},
  onAnswersChange,
  onSubmit,
  onClose,
  doneTitle = 'Thanks for your feedback',
  doneDescription,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'title' | 'onSubmit'> & {
  title: React.ReactNode
  questions: SurveyQuestion[]
  /** After the step count, e.g. "about 1 min". */
  estimate?: React.ReactNode
  /** The current step, 0-based; `questions.length` is done. */
  step?: number
  defaultStep?: number
  onStepChange?: (step: number) => void
  answers?: SurveyAnswers
  defaultAnswers?: SurveyAnswers
  onAnswersChange?: (answers: SurveyAnswers) => void
  /** Submit on the last step: all answers. */
  onSubmit?: (answers: SurveyAnswers) => void
  /** Done: shows Close. */
  onClose?: () => void
  doneTitle?: React.ReactNode
  doneDescription?: React.ReactNode
}) {
  const [innerStep, setInnerStep] = React.useState(defaultStep)
  const [innerAnswers, setInnerAnswers] = React.useState(defaultAnswers)
  const current = step ?? innerStep
  const values = answers ?? innerAnswers
  const done = current >= questions.length
  const q = questions[current]
  const last = current === questions.length - 1
  const fieldId = React.useId()

  const go = (next: number) => {
    setInnerStep(next)
    onStepChange?.(next)
  }
  const answer = (value: string | string[]) => {
    const next = { ...values, [q.id]: value }
    setInnerAnswers(next)
    onAnswersChange?.(next)
  }
  const advance = () => {
    if (last) onSubmit?.(values)
    go(current + 1)
  }

  return (
    <Card
      data-slot="survey"
      data-step={done ? 'complete' : q.kind}
      className={cn('max-w-140 min-w-0 gap-0 rounded-xl border-border py-0', className)}
      {...props}
    >
      <ShellHeader
        variant="card"
        className="flex-col items-stretch gap-2 *:data-[slot=shell-header-text]:basis-auto"
      >
        <div className="flex items-center gap-2">
          <ShellTitle className="min-w-0 flex-1 truncate">{title}</ShellTitle>
          <span className="type-text-xs-normal whitespace-nowrap text-muted-foreground">
            {done ? 'Done' : [`${current + 1} of ${questions.length}`, estimate].filter(Boolean).join(' · ')}
          </span>
        </div>
        <Progress
          size="sm"
          tone={done ? 'success' : 'brand'}
          value={done ? 100 : ((current + 1) / questions.length) * 100}
          aria-label="Survey progress"
        />
      </ShellHeader>
      {done ? (
        <Empty role="status" className="gap-3 border-0 px-4 py-8 md:px-4 md:py-8">
          <EmptyHeader>
            <EmptyMedia className="[&_svg:not([class*='size-'])]:size-4.5">
              <IconTile icon={CircleCheckIcon} tone="success" />
            </EmptyMedia>
            <EmptyTitle>{doneTitle}</EmptyTitle>
            {doneDescription && (
              <EmptyDescription className="text-muted-foreground">{doneDescription}</EmptyDescription>
            )}
          </EmptyHeader>
        </Empty>
      ) : (
        <FieldSet key={q.id} className="gap-3 p-4">
          <FieldLegend className="mb-0 type-text-base-medium">{q.question}</FieldLegend>
          {q.hint && <FieldDescription className="-mt-1.5">{q.hint}</FieldDescription>}
          {q.kind === 'single' && (
            <RadioGroup
              value={(values[q.id] as string | undefined) ?? ''}
              onValueChange={answer}
              className="gap-2.5"
            >
              {q.options?.map((option, i) => (
                <div key={option} className="flex items-center gap-2">
                  <RadioGroupItem id={`${fieldId}-${i}`} value={option} />
                  <Label htmlFor={`${fieldId}-${i}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {q.kind === 'multiple' && (
            <div data-slot="checkbox-group" className="flex flex-col gap-2.5">
              {q.options?.map((option, i) => {
                const picked = (values[q.id] as string[] | undefined) ?? []
                return (
                  <div key={option} className="flex items-center gap-2">
                    <Checkbox
                      id={`${fieldId}-${i}`}
                      checked={picked.includes(option)}
                      onCheckedChange={(on) =>
                        answer(on ? [...picked, option] : picked.filter((p) => p !== option))
                      }
                    />
                    <Label htmlFor={`${fieldId}-${i}`}>{option}</Label>
                  </div>
                )
              })}
            </div>
          )}
          {q.kind === 'text' && (
            <Textarea
              aria-label={typeof q.question === 'string' ? q.question : 'Answer'}
              placeholder={q.placeholder}
              value={(values[q.id] as string | undefined) ?? ''}
              onChange={(e) => answer(e.target.value)}
              className="min-h-18"
            />
          )}
        </FieldSet>
      )}
      <ShellFooter variant="card" align={done ? 'end' : 'between'}>
        {done ? (
          onClose && (
            <Button variant="outline" intent="neutral" size="sm" onClick={onClose}>
              Close
            </Button>
          )
        ) : (
          <>
            <Button
              variant="ghost"
              intent="neutral"
              size="sm"
              disabled={current === 0}
              onClick={() => go(current - 1)}
            >
              <Icon icon={ChevronLeftIcon} />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" intent="neutral" size="sm" onClick={advance}>
                Skip
              </Button>
              <Button intent="brand" size="sm" onClick={advance}>
                {last ? 'Submit' : 'Next'}
              </Button>
            </div>
          </>
        )}
      </ShellFooter>
    </Card>
  )
}

export { Survey, type SurveyQuestion, type SurveyAnswers }
