import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AnnoyedIcon,
  CheckIcon,
  FrownIcon,
  Icon,
  LaughIcon,
  MehIcon,
  PencilIcon,
  SmileIcon,
  StarIcon,
} from '@/components/ui/icon'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Figma Agent Builder › Core Kit › rating (10726:1937): a satisfaction check after a task. Composed,
// nothing re-drawn: Card (--card, --border, radius xl, shadow/sm as drawn, ≤400px, 16px padding,
// 12px gap) → the question (text/sm/semibold) → Rating Scale → when rated, the thanks line (Figma
// part / meta item sm: 14px --success check + text/xs/medium) and "Add a comment" (ghost xs Button
// with a pencil). Figma type → `kind` stars · faces · csat; state unrated · rated = `value`.
//
// Rating Scale is the shared single-choice scale (Toggle Group type single; NPS uses it for 0–10):
// - stars: 24px items with 16px stars (Figma 14px, part / rating display), filled --warning up to
//   the value, --input outline after it.
// - faces: 44px --muted circles with 22px faces; selected = --info-subtle + --border-action ring.
// - numbers: outline Toggles 6px apart that share the row (Figma 38px; Toggle default 40px), text
//   --foreground; selected = --primary fill, --primary-foreground text. `lowLabel` / `highLabel` sit
//   under the ends (text/xs muted).

type RatingKind = 'stars' | 'faces' | 'csat'

const FACES = [
  { icon: FrownIcon, label: 'Very bad' },
  { icon: AnnoyedIcon, label: 'Bad' },
  { icon: MehIcon, label: 'Okay' },
  { icon: SmileIcon, label: 'Good' },
  { icon: LaughIcon, label: 'Very good' },
]

function RatingScale({
  scale = 'numbers',
  min = 1,
  max = 5,
  value,
  defaultValue,
  onValueChange,
  lowLabel,
  highLabel,
  className,
  'aria-label': ariaLabel,
  ...props
}: Omit<React.ComponentProps<'div'>, 'defaultValue' | 'dir'> & {
  scale?: 'stars' | 'faces' | 'numbers'
  /** Numbers: the first score (NPS 0). */
  min?: number
  /** Numbers: the last score (CSAT 5, NPS 10). Stars and faces are 1–5. */
  max?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Numbers: under the first score, e.g. "Very unsatisfied". */
  lowLabel?: React.ReactNode
  /** Numbers: under the last score, e.g. "Very satisfied". */
  highLabel?: React.ReactNode
  /** Names the scale (aria-label). */
  'aria-label': string
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const first = scale === 'numbers' ? min : 1
  const last = scale === 'numbers' ? max : 5
  const scores = Array.from({ length: last - first + 1 }, (_, i) => first + i)
  const group = (
    <ToggleGroup
      type="single"
      variant={scale === 'numbers' ? 'outline' : 'default'}
      spacing={scale === 'stars' ? 0.5 : scale === 'faces' ? 2 : 1.5}
      value={current === undefined ? '' : String(current)}
      onValueChange={(next) => {
        if (!next) return
        setInner(Number(next))
        onValueChange?.(Number(next))
      }}
      className={cn(scale === 'numbers' && 'w-full')}
      aria-label={ariaLabel}
    >
      {scores.map((score) => {
        if (scale === 'stars') {
          const filled = current !== undefined && score <= current
          return (
            <ToggleGroupItem
              key={score}
              value={String(score)}
              aria-label={`${score} of 5`}
              className="size-6 min-w-6 rounded-sm px-0 hover:bg-transparent data-[state=on]:bg-transparent"
            >
              <Icon
                icon={StarIcon}
                className={cn(filled ? 'fill-warning text-warning' : 'text-input', 'transition-colors')}
              />
            </ToggleGroupItem>
          )
        }
        if (scale === 'faces') {
          const face = FACES[score - 1]
          return (
            <ToggleGroupItem
              key={score}
              value={String(score)}
              aria-label={face.label}
              className="size-11 min-w-11 rounded-full bg-muted px-0 text-foreground data-[state=on]:bg-info-subtle data-[state=on]:inset-ring data-[state=on]:inset-ring-border-action [&_svg:not([class*='size-'])]:size-5.5"
            >
              <Icon icon={face.icon} />
            </ToggleGroupItem>
          )
        }
        return (
          <ToggleGroupItem
            key={score}
            value={String(score)}
            className="min-w-0 flex-1 bg-background px-0 text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:inset-ring-primary"
          >
            {score}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
  return (
    <div
      data-slot="rating-scale"
      data-scale={scale}
      className={cn('flex w-full flex-col gap-1.5', className)}
      {...props}
    >
      {group}
      {(lowLabel || highLabel) && (
        <div className="flex justify-between gap-4 type-text-xs-normal text-muted-foreground">
          <span>{lowLabel}</span>
          <span className="text-right">{highLabel}</span>
        </div>
      )}
    </div>
  )
}

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

export { Rating, RatingScale, type RatingKind }
