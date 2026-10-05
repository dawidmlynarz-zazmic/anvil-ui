import * as React from 'react'

import { cn } from '@/lib/utils'
import { TextShimmer } from '@/components/agent/text-shimmer'
import { BotIcon, Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Builder › Core Kit › streaming placeholder (10735:2952), built on Skeleton: holds the
// assistant's place before the first token. 32px --agent-subtle circle with the bot icon, 12px from
// a column (10px gap) of a shimmering label and 14px skeleton lines. `length` short (2 lines) ·
// medium (4) · long (6), widths as drawn on the 640px frame. A role="status" named by `label`.

type Length = 'short' | 'medium' | 'long'

// Line widths per length, as fractions of the Figma 640px column.
const LINES: Record<Length, string[]> = {
  short: ['w-full', 'w-7/12'],
  medium: ['w-full', 'w-full', 'w-3/4', 'w-5/12'],
  long: ['w-full', 'w-full', 'w-full', 'w-5/6', 'w-full', 'w-1/2'],
}

function StreamingPlaceholder({
  length = 'short',
  label = 'Thinking…',
  icon,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  length?: Length
  /** The shimmering status; also the status's accessible name. */
  label?: string
  /** Replaces the bot avatar tile. */
  icon?: React.ReactNode
}) {
  return (
    <div
      data-slot="streaming-placeholder"
      role="status"
      aria-label={label}
      className={cn('flex w-full max-w-(--shell-widget-max) items-start gap-3', className)}
      {...props}
    >
      {icon ?? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-agent-subtle text-agent dark:text-agent-medium">
          <Icon icon={BotIcon} />
        </span>
      )}
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
