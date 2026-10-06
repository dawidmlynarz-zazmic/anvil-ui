import * as React from 'react'

import { cn } from '@/lib/utils'
import { TextShimmer } from '@/components/agent/text-shimmer'
import { IconTile } from '@/components/anvil/icon-tile'
import { BotIcon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Builder › Core Kit › streaming placeholder (10735:2952), built on Skeleton: holds the
// assistant's place before the first token. 32px --agent-subtle circle with the bot icon, 12px from
// a column (10px gap) of a shimmering label and 14px skeleton lines. `length` short (2 lines) ·
// medium (4) · long (6), widths as drawn on the 640px frame. A role="status" named by `label`.
// `variant` dots is Figma's typing indicator (10734:2807), merged here (same job): a --muted pill
// (radius xl, 16/12px, 4px gap) with three 8px --muted-foreground dots rising in turn. The avatar
// is an agent Icon Tile (sm, circle).

type Length = 'short' | 'medium' | 'long'

// Line widths per length, as fractions of the Figma 640px column.
const LINES: Record<Length, string[]> = {
  short: ['w-full', 'w-7/12'],
  medium: ['w-full', 'w-full', 'w-3/4', 'w-5/12'],
  long: ['w-full', 'w-full', 'w-full', 'w-5/6', 'w-full', 'w-1/2'],
}

function StreamingPlaceholder({
  variant = 'skeleton',
  length = 'short',
  label = 'Thinking…',
  icon,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** skeleton: avatar, shimmering label and lines · dots: the typing pill (Figma typing indicator). */
  variant?: 'skeleton' | 'dots'
  /** Skeleton: how many lines. */
  length?: Length
  /** The shimmering status; also the status's accessible name. */
  label?: string
  /** Replaces the bot avatar tile. */
  icon?: React.ReactNode
}) {
  if (variant === 'dots') {
    return (
      <div
        data-slot="streaming-placeholder"
        data-variant="dots"
        role="status"
        aria-label={label}
        className={cn('inline-flex w-fit items-center gap-1 rounded-xl bg-muted px-4 py-3', className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="size-2 animate-typing-dot rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </div>
    )
  }
  return (
    <div
      data-slot="streaming-placeholder"
      data-variant="skeleton"
      role="status"
      aria-label={label}
      className={cn('flex w-full max-w-(--shell-widget-max) items-start gap-3', className)}
      {...props}
    >
      {icon ?? <IconTile icon={BotIcon} tone="agent" size="sm" shape="circle" />}
      <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-2.5">
        <TextShimmer>{label}</TextShimmer>
        {LINES[length].map((width, i) => (
          <Skeleton key={i} className={cn('h-3.5 rounded-lg', width)} />
        ))}
      </div>
    </div>
  )
}

export { StreamingPlaceholder }
