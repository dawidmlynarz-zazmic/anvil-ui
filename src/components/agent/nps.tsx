import * as React from 'react'

import { cn } from '@/lib/utils'
import { RatingScale } from '@/components/agent/rating-scale'
import { ShellFooter } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

// Figma Agent Builder › Core Kit › nps (10726:2049): Net Promoter Score on 0–10, then one open
// question about the reason. Composed, nothing re-drawn: Card (--card, --border, radius xl,
// shadow/sm as drawn, ≤640px) → body (16px padding, 12px gap): the question (text/base/medium) →
// Rating Scale numbers 0–10 (shared with Rating; outline Toggles 4px apart, selected --primary)
// with `lowLabel` / `highLabel` → once scored, the follow-up as a labelled Textarea (its built-in
// field anatomy) → Shell Footer card: Not now (ghost sm) + Next (brand sm, disabled until scored),
// which becomes Submit once scored. Figma state unanswered · answered = `score`.

function Nps({
  question,
  score,
  defaultScore,
  onScoreChange,
  lowLabel = 'Not at all likely',
  highLabel = 'Extremely likely',
  followUp = 'What’s the main reason for your score?',
  reason,
  defaultReason,
  onReasonChange,
  onSubmit,
  onDismiss,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'onSubmit'> & {
  question: React.ReactNode
  score?: number
  defaultScore?: number
  onScoreChange?: (score: number) => void
  lowLabel?: React.ReactNode
  highLabel?: React.ReactNode
  /** The follow-up question's label. */
  followUp?: React.ReactNode
  reason?: string
  defaultReason?: string
  onReasonChange?: (reason: string) => void
  onSubmit?: (answer: { score: number; reason: string }) => void
  /** Shows Not now. */
  onDismiss?: () => void
}) {
  const [innerScore, setInnerScore] = React.useState(defaultScore)
  const [innerReason, setInnerReason] = React.useState(defaultReason ?? '')
  const current = score ?? innerScore
  const text = reason ?? innerReason
  const questionId = React.useId()
  return (
    <Card
      data-slot="nps"
      data-answered={current !== undefined}
      role="group"
      aria-labelledby={questionId}
      className={cn('max-w-160 min-w-0 gap-0 rounded-xl border-border py-0 shadow-sm', className)}
      {...props}
    >
      <div className="flex flex-col gap-3 p-4">
        <p id={questionId} className="type-text-base-medium text-foreground">
          {question}
        </p>
        <RatingScale
          min={0}
          max={10}
          value={current}
          onValueChange={(next) => {
            setInnerScore(next)
            onScoreChange?.(next)
          }}
          lowLabel={lowLabel}
          highLabel={highLabel}
          aria-label="Score"
        />
        {current !== undefined && (
          <Textarea
            label={followUp}
            value={text}
            onChange={(e) => {
              setInnerReason(e.target.value)
              onReasonChange?.(e.target.value)
            }}
            className="min-h-18"
          />
        )}
      </div>
      <ShellFooter variant="card" align="between">
        {onDismiss ? (
          <Button variant="ghost" intent="neutral" size="sm" onClick={onDismiss}>
            Not now
          </Button>
        ) : (
          <span />
        )}
        <Button
          intent="brand"
          size="sm"
          disabled={current === undefined}
          onClick={() => current !== undefined && onSubmit?.({ score: current, reason: text })}
        >
          {current === undefined ? 'Next' : 'Submit'}
        </Button>
      </ShellFooter>
    </Card>
  )
}

export { Nps }
