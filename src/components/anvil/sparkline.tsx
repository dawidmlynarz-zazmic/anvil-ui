import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma sparkline (10663:2920): a small trend line, e.g. in Widget Metric Card. A 2px line filling
// its box (32px tall by default, full width). `trend` up (--success-strong) · down (--danger-strong)
// · neutral (--muted-foreground); derived from the first and last value when omitted. Decorative
// unless `label` names it (then role="img").

type Trend = 'up' | 'down' | 'neutral'

const STROKE: Record<Trend, string> = {
  up: 'text-success-strong',
  down: 'text-danger-strong',
  neutral: 'text-muted-foreground',
}

function Sparkline({
  values,
  trend,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<'svg'>, 'values'> & {
  /** The series, oldest first. */
  values: number[]
  trend?: Trend
  /** Accessible name, e.g. "Up 12% over 30 days"; omit for a decorative line. */
  label?: string
}) {
  const resolved: Trend =
    trend ??
    (values.length < 2 || values.at(-1) === values[0]
      ? 'neutral'
      : values.at(-1)! > values[0]
        ? 'up'
        : 'down')
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = values.length > 1 ? 100 / (values.length - 1) : 0
  // 2px of headroom top and bottom so the stroke isn't clipped.
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(30 - ((v - min) / span) * 28).toFixed(2)}`)
    .join(' ')
  return (
    <svg
      data-slot="sparkline"
      data-trend={resolved}
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={cn('h-8 w-full overflow-visible', STROKE[resolved], className)}
      {...props}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export { Sparkline, type Trend }
