import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Badge page → `badge` (1482:30693) and `status badge` (8399:1766), one component in code.
// A static label for counts, metadata and status. One colour prop and one treatment prop:
// - `tone` neutral · brand · info · success · warning · destructive · agent (API Contract tones).
// - `variant` default (solid: --{tone} fill, --{tone}-foreground text; neutral = --background-inverse)
//   · subtle (--{tone}-subtle fill, --{tone}-medium text; neutral = the --muted pair; brand =
//   --info-subtle + --primary) · outline (--background, a --{tone}-muted inset ring, --{tone}-medium
//   text; neutral = --input ring, --foreground).
// `shape` default (radius sm) · pill (Figma rounded=on: tags and provenance labels). `indicator`
// adds an 8px dot in the tone (the current colour on solid), `count` a trailing number. Icons are
// children (14 / 12 / 10px by size). Outline strokes are inset rings (Figma inside stroke). Focus
// ring only matters when rendered asChild as a link. (Next phase: `variant="semantic"` and
// `intent` are gone; every tone has all three treatments.)

type Tone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'destructive' | 'agent'

/** Fill and text per tone × treatment (danger tokens back the destructive tone). */
const TONES: Record<Tone, { default: string; subtle: string; outline: string; dot: string }> = {
  neutral: {
    default: 'bg-background-inverse text-foreground-inverse',
    subtle: 'bg-muted text-muted-foreground',
    outline: 'bg-background text-foreground inset-ring-input',
    dot: 'bg-muted-foreground',
  },
  brand: {
    default: 'bg-primary text-primary-foreground',
    subtle: 'bg-info-subtle text-primary dark:text-info-medium',
    outline: 'bg-background text-primary inset-ring-info-muted dark:text-info-medium',
    dot: 'bg-primary',
  },
  info: {
    default: 'bg-info text-info-foreground',
    subtle: 'bg-info-subtle text-info-medium',
    outline: 'bg-background text-info-medium inset-ring-info-muted',
    dot: 'bg-info',
  },
  success: {
    // --success (green-50) is 4.2:1 with either foreground: solid uses green-30 in both themes.
    default: 'bg-success-medium text-success-foreground dark:bg-success-muted',
    subtle: 'bg-success-subtle text-success-medium',
    outline: 'bg-background text-success-medium inset-ring-success-muted',
    dot: 'bg-success',
  },
  warning: {
    default: 'bg-warning text-warning-foreground',
    subtle: 'bg-warning-subtle text-warning-medium',
    outline: 'bg-background text-warning-medium inset-ring-warning-muted',
    dot: 'bg-warning',
  },
  destructive: {
    default: 'bg-danger text-danger-foreground',
    subtle: 'bg-danger-subtle text-danger-medium',
    outline: 'bg-background text-danger-medium inset-ring-danger-muted',
    dot: 'bg-danger',
  },
  agent: {
    default: 'bg-agent text-agent-foreground',
    subtle: 'bg-agent-subtle text-agent-medium',
    outline: 'bg-background text-agent-medium inset-ring-agent-muted',
    dot: 'bg-agent',
  },
}

const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm px-1 whitespace-nowrap',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
    'outline-none focus-visible:focus-ring',
    '[&>svg]:pointer-events-none [&>svg]:shrink-0',
  ],
  {
    variants: {
      variant: { default: '', subtle: '', outline: 'inset-ring' },
      shape: { default: '', pill: 'rounded-full px-2' },
      size: {
        default: 'h-6 gap-2 type-text-sm-medium [&>svg]:size-3.5',
        sm: 'h-5 type-text-xs-medium [&>svg]:size-3',
        xs: 'h-4.5 type-text-2xs-medium [&>svg]:size-2.5',
      },
    },
    defaultVariants: { variant: 'default', shape: 'default', size: 'default' },
  },
)

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    tone?: Tone
    asChild?: boolean
    /** An 8px dot in the tone before the label (Figma indicator). */
    indicator?: boolean
    /** A trailing number after the label, e.g. a count of items (Figma show count). */
    count?: React.ReactNode
  }

function Badge({
  className,
  variant = 'default',
  tone = 'neutral',
  shape = 'default',
  size = 'default',
  asChild = false,
  indicator = false,
  count,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'
  const decorated = indicator || count !== undefined

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cn(badgeVariants({ variant, shape, size }), TONES[tone][variant ?? 'default'], className)}
      {...props}
    >
      {decorated && !asChild ? (
        <>
          {indicator && (
            <span
              aria-hidden
              data-slot="badge-indicator"
              className={cn(
                'size-2 shrink-0 rounded-full',
                variant === 'default' ? 'bg-current' : TONES[tone].dot,
              )}
            />
          )}
          {children}
          {count !== undefined && (
            <span data-slot="badge-count" className="tabular-nums">
              {count}
            </span>
          )}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Badge, badgeVariants, type BadgeProps, type Tone as BadgeTone }
