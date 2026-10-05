import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Figma: Alert page → `alert` (10671:2494). Callout for user attention: default for information and
// confirmations, destructive for errors. Optional icon (16px, Icon) + title (text/sm/medium, one
// line) + description (text/sm/normal, muted). --card with a --border stroke, radius lg, padding
// 16 / 12, gap 12 (icon) and 2 (title → description). Destructive text uses --danger-medium, not
// Figma's --destructive: red/50 on the dark card is 3.25:1 (as Label, FieldError, Dropdown Menu).
const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border border-border bg-card px-4 py-3 type-text-sm-normal has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'text-card-foreground',
        destructive:
          'text-danger-medium *:data-[slot=alert-description]:text-danger-medium [&>svg]:text-current',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 type-text-sm-medium', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 type-text-sm-normal text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
