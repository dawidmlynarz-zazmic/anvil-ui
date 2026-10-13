import * as React from 'react'

import { cn } from '@/lib/utils'
import { Icon, StarIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Parts · rating display (10855:5609): a read-only rating. (Collecting feedback
// is Core Kit › rating, `Rating`.) Only Icon. `display` compact (one 12px star, then the label) · stars
// (five 14px stars, 2px apart, the filled count follows `value`, then the label). Stars are --warning,
// empty ones an outline in --border-strong; the label is text/xs --muted-foreground (“4.6 · 1,204
// reviews”). The whole display is one image named by `aria-label`/the label, so the score is read once.

function RatingDisplay({
  value,
  display = 'stars',
  label,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** The score, 0–5; the stars round to the nearest whole star. */
  value: number
  display?: 'compact' | 'stars'
  /** The text after the stars: “4.6 · 1,204 reviews”. */
  label?: React.ReactNode
}) {
  const filled = Math.max(0, Math.min(5, Math.round(value)))
  const name = `Rated ${value} out of 5`
  return (
    <div
      data-slot="rating-display"
      data-display={display}
      role="img"
      aria-label={typeof label === 'string' ? `${name}, ${label}` : name}
      className={cn('flex items-center', display === 'stars' ? 'gap-0.5' : 'gap-1', className)}
      {...props}
    >
      {display === 'compact' ? (
        <Icon icon={StarIcon} className="size-3 fill-warning text-warning" />
      ) : (
        Array.from({ length: 5 }, (_, index) => (
          <Icon
            key={index}
            icon={StarIcon}
            className={cn('size-3.5', index < filled ? 'fill-warning text-warning' : 'text-border-strong')}
          />
        ))
      )}
      {label && (
        <span className="ml-1 type-text-xs-normal whitespace-nowrap text-muted-foreground">{label}</span>
      )}
    </div>
  )
}

export { RatingDisplay }
