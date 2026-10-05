import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma Agent Builder › Core Kit › typing indicator (10734:2807): a --muted pill (radius xl, 16/12px
// padding, 4px gap) with three 8px --muted-foreground dots; in turn each rises 4px at full colour
// while the others rest at 35% (frames 1–3, looping). Built on the Spinner pattern: a
// role="status" named by `label`.
function TypingIndicator({
  label = 'Typing',
  className,
  ...props
}: React.ComponentProps<'span'> & { label?: string }) {
  return (
    <span
      data-slot="typing-indicator"
      role="status"
      aria-label={label}
      className={cn('inline-flex w-fit items-center gap-1 rounded-xl bg-muted px-4 py-3', className)}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-typing-dot rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </span>
  )
}

export { TypingIndicator }
