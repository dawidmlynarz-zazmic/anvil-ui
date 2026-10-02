import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Badge page → `badge` (1482:30693). Static label for counts and metadata; status colors
// live in the Anvil StatusBadge (Figma `status badge`). Outline strokes are inset rings
// (Figma inside stroke). Focus ring only matters when rendered asChild as a link.
const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm px-1 whitespace-nowrap',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
    'outline-none focus-visible:focus-ring',
    "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3",
  ],
  {
    variants: {
      variant: {
        default: '',
        outline: 'inset-ring',
        subtle: '',
      },
      intent: {
        neutral: '',
        inverse: '',
      },
      size: {
        default: 'h-6 type-text-sm-medium',
        sm: 'h-5 type-text-xs-medium',
        xs: 'h-4.5 type-text-2xs-medium',
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
    ],
    defaultVariants: {
      variant: 'default',
      intent: 'neutral',
      size: 'default',
    },
  },
)

type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({
  className,
  variant = 'default',
  intent = 'neutral',
  size = 'default',
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-intent={intent}
      data-size={size}
      className={cn(badgeVariants({ variant, intent, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants, type BadgeProps }
