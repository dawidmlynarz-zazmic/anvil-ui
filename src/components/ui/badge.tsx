import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Badge page → `badge` (1482:30693) and `status badge` (8399:1766), one component in code
// (audit M5). Static label for counts, metadata and status. `variant` default · outline · subtle
// (× `intent` neutral · inverse) or semantic (× `tone` neutral · info · success · warning ·
// destructive · agent: --{tone}-subtle surface, --{tone}-medium text; neutral is the accessible
// --muted pair). `indicator` adds an 8px dot in the tone, `count` a trailing number, `shape` pill
// rounds it (Figma rounded=on, for tags and provenance labels). Icons are children (14 / 12 / 10px
// by size). Outline strokes are inset rings (Figma inside stroke). Focus ring only matters when
// rendered asChild as a link.
const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm px-1 whitespace-nowrap',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
    'outline-none focus-visible:focus-ring',
    '[&>svg]:pointer-events-none [&>svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: '',
        outline: 'inset-ring',
        subtle: '',
        semantic: '',
      },
      tone: {
        neutral: '',
        info: '',
        success: '',
        warning: '',
        destructive: '',
        agent: '',
      },
      shape: {
        default: '',
        pill: 'rounded-full px-2',
      },
      intent: {
        neutral: '',
        inverse: '',
      },
      size: {
        default: 'h-6 type-text-sm-medium [&>svg]:size-3.5',
        sm: 'h-5 type-text-xs-medium [&>svg]:size-3',
        xs: 'h-4.5 type-text-2xs-medium [&>svg]:size-2.5',
      },
    },
    compoundVariants: [
      { variant: 'default', intent: 'neutral', className: 'bg-background-inverse text-foreground-inverse' },
      { variant: 'default', intent: 'inverse', className: 'bg-background text-foreground' },
      { variant: 'outline', intent: 'neutral', className: 'bg-background text-foreground inset-ring-input' },
      {
        variant: 'outline',
        intent: 'inverse',
        className: 'bg-transparent text-foreground-inverse inset-ring-overlay-inverse-24',
      },
      // Figma: bg --accent (muted-foreground on accent is 3.99:1 in dark) → the accessible muted pair.
      { variant: 'subtle', intent: 'neutral', className: 'bg-muted text-muted-foreground' },
      // Figma: text --primary-foreground (white in both modes, invisible on the dark-mode inverse surface).
      { variant: 'subtle', intent: 'inverse', className: 'bg-overlay-inverse-16 text-foreground-inverse' },
      // semantic: Figma --accent / --muted-foreground for neutral is 3.99:1 in dark → the --muted pair.
      { variant: 'semantic', tone: 'neutral', className: 'bg-muted text-muted-foreground' },
      { variant: 'semantic', tone: 'info', className: 'bg-info-subtle text-info-medium' },
      { variant: 'semantic', tone: 'success', className: 'bg-success-subtle text-success-medium' },
      { variant: 'semantic', tone: 'warning', className: 'bg-warning-subtle text-warning-medium' },
      { variant: 'semantic', tone: 'destructive', className: 'bg-danger-subtle text-danger-medium' },
      { variant: 'semantic', tone: 'agent', className: 'bg-agent-subtle text-agent-medium' },
      { size: 'default', className: 'gap-2' },
    ],
    defaultVariants: {
      variant: 'default',
      intent: 'neutral',
      tone: 'neutral',
      shape: 'default',
      size: 'default',
    },
  },
)

const INDICATOR = {
  neutral: 'bg-muted-foreground',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-danger',
  agent: 'bg-agent',
} as const

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /** An 8px dot in the tone before the label (Figma indicator). */
    indicator?: boolean
    /** A trailing number after the label, e.g. a count of items (Figma show count). */
    count?: React.ReactNode
  }

function Badge({
  className,
  variant = 'default',
  intent = 'neutral',
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
      data-intent={variant === 'semantic' ? undefined : intent}
      data-tone={variant === 'semantic' ? tone : undefined}
      data-size={size}
      className={cn(badgeVariants({ variant, intent, tone, shape, size }), className)}
      {...props}
    >
      {decorated && !asChild ? (
        <>
          {indicator && (
            <span
              aria-hidden
              data-slot="badge-indicator"
              className={cn('size-2 shrink-0 rounded-full', INDICATOR[tone ?? 'neutral'])}
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

export { Badge, badgeVariants, type BadgeProps }
