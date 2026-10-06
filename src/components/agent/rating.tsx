import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RatingScale } from '@/components/agent/rating-scale'
import { CheckIcon, Icon, PencilIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › rating (10726:1937): a satisfaction check after a task. Composed,
// nothing re-drawn: Card (--card, --border, radius xl, shadow/sm as drawn, ≤400px, 16px padding,
// 12px gap) → the question (text/sm/semibold) → Rating Scale → when rated, the thanks line (Figma
// part / meta item sm: 14px --success check + text/xs/medium) and "Add a comment" (ghost xs Button
// with a pencil). Figma type → `kind` stars · faces · csat; state unrated · rated = `value`.
// The scale is Rating Scale (`@/components/agent/rating-scale`), shared with NPS.

type RatingKind = 'stars' | 'faces' | 'csat'

function Rating({
  kind = 'stars',
  question,
  value,
  defaultValue,
  onValueChange,
  lowLabel = 'Very unsatisfied',
  highLabel = 'Very satisfied',
  thanks = 'Thanks! Anything we could do better?',
  onComment,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'defaultValue'> & {
  kind?: RatingKind
  question: React.ReactNode
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** CSAT: the low end label. */
  lowLabel?: React.ReactNode
  /** CSAT: the high end label. */
  highLabel?: React.ReactNode
  /** Rated: the thanks line. */
  thanks?: React.ReactNode
  /** Rated: shows "Add a comment". */
  onComment?: () => void
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  return (
    <Card
      data-slot="rating"
      data-kind={kind}
      data-rated={current !== undefined}
      className={cn('max-w-100 min-w-0 gap-3 rounded-xl border-border p-4 shadow-sm', className)}
      {...props}
    >
      <p className="type-text-sm-semibold text-foreground">{question}</p>
      <RatingScale
        scale={kind === 'csat' ? 'numbers' : kind}
        value={current}
        onValueChange={(next) => {
          setInner(next)
          onValueChange?.(next)
        }}
        lowLabel={kind === 'csat' ? lowLabel : undefined}
        highLabel={kind === 'csat' ? highLabel : undefined}
        aria-label={typeof question === 'string' ? question : 'Rating'}
      />
      {current !== undefined && (
        <div className="flex flex-col items-start gap-2">
          <p role="status" className="flex items-center gap-1 type-text-xs-medium text-foreground">
            <Icon icon={CheckIcon} size="xs" className="text-success dark:text-success-medium" />
            {thanks}
          </p>
          {onComment && (
            <Button variant="ghost" intent="neutral" size="xs" onClick={onComment}>
              <Icon icon={PencilIcon} />
              Add a comment
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

export { Rating, type RatingKind }
