import * as React from 'react'

import { cn } from '@/lib/utils'
import { AnnoyedIcon, FrownIcon, Icon, LaughIcon, MehIcon, SmileIcon, StarIcon } from '@/components/ui/icon'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// A single-choice satisfaction scale on Toggle Group (type single): Rating uses it for stars,
// faces and CSAT 1–5, NPS for 0–10. Figma draws it inside Core Kit rating (10726:1937) and nps
// (10726:2049). `scale`:
// - stars: 24px items with 16px stars (Figma 14px, part / rating display), filled --warning up to
//   the value, --input outline after it.
// - faces: 44px --muted circles with 22px faces; selected = --info-subtle + --border-action ring.
// - numbers: outline Toggles 6px apart (4px past five scores, NPS) that share the row (Figma
//   38px; Toggle default 40px), text --foreground; selected = --primary fill, --primary-foreground
//   text. `lowLabel` / `highLabel` sit under the ends (text/xs muted).
// Arrow keys move between scores; the group is named by `aria-label`.

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
      spacing={scale === 'stars' ? 0.5 : scale === 'faces' ? 2 : scores.length > 5 ? 1 : 1.5}
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
                className={cn(
                  filled ? 'fill-warning text-warning' : 'text-input',
                  'transition-colors duration-(--duration-fast) ease-out',
                )}
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

export { RatingScale }
