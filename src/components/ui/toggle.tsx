import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Toggle page → `toggle` (10943:193). A two-state button: `variant` default · outline (1px
// --input stroke), `size` sm · default · lg = 32 / 40 / 48 (square with an icon), radius md.
// --muted-foreground at rest; hover → --muted fill, --foreground; pressed (Radix data-[state=on]) →
// --accent fill, --foreground; focus → focus/ring; disabled → 50% (as drawn).

const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md type-text-sm-medium whitespace-nowrap text-muted-foreground outline-none',
    'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
    'hover:bg-muted hover:text-foreground data-[state=on]:bg-accent data-[state=on]:text-foreground',
    'focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:inset-ring aria-invalid:inset-ring-destructive',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'bg-transparent inset-ring inset-ring-input',
      },
      size: {
        sm: 'h-8 min-w-8 px-1.5',
        default: 'h-10 min-w-10 px-2',
        lg: 'h-12 min-w-12 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
