import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Progress as ProgressPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Progress page → `progress` (10847:5203). A linear progress or share: --muted pill track,
// fill by `tone` (brand --primary · agent · success · warning · destructive --danger · neutral
// --muted-foreground); Figma `thickness` 4 · 6 · 8 → `size` sm · default · lg (API Contract
// size vocabulary). `value` is the Radix value (0–100 by default; `max` changes the range).
const progressVariants = cva('relative w-full overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-1.5',
      lg: 'h-2',
    },
  },
  defaultVariants: { size: 'default' },
})

const indicatorVariants = cva(
  'h-full w-full flex-1 transition-transform duration-(--duration-base) ease-out',
  {
    variants: {
      tone: {
        brand: 'bg-primary',
        agent: 'bg-agent',
        success: 'bg-success',
        warning: 'bg-warning',
        destructive: 'bg-danger',
        neutral: 'bg-muted-foreground',
      },
    },
    defaultVariants: { tone: 'brand' },
  },
)

function Progress({
  className,
  value,
  max = 100,
  size = 'default',
  tone = 'brand',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> &
  VariantProps<typeof indicatorVariants>) {
  const percent = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-size={size}
      data-tone={tone}
      value={value}
      max={max}
      className={cn(progressVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={indicatorVariants({ tone })}
        style={{ transform: `translateX(-${100 - percent}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressVariants }
