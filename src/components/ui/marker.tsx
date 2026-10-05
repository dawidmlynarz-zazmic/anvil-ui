import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'

// Figma Agent Builder › message row, role system: an event line in the thread (text/xs/normal
// --muted-foreground, 12px icon 4px from the text). Links underline and turn --foreground on hover.
const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-1 text-left type-text-xs-normal text-muted-foreground [&_svg:not([class*='size-'])]:size-3 [a]:rounded-sm [a]:underline [a]:underline-offset-3 [a]:outline-none [a]:hover:text-foreground [a]:focus-visible:focus-ring",
  {
    variants: {
      variant: {
        default: '',
        separator:
          'gap-2 before:h-px before:min-w-0 before:flex-1 before:bg-border after:h-px after:min-w-0 after:flex-1 after:bg-border',
        border: 'border-b border-border pb-2',
      },
    },
  },
)

function Marker({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof markerVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'div'

  return (
    <Comp
      data-slot="marker"
      data-variant={variant}
      className={cn(markerVariants({ variant, className }))}
      {...props}
    />
  )
}

function MarkerIcon({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      className={cn(
        "flex size-3 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  )
}

function MarkerContent({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        'min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:rounded-sm *:[a]:underline *:[a]:underline-offset-3 *:[a]:outline-none *:[a]:hover:text-foreground *:[a]:focus-visible:focus-ring',
        className,
      )}
      {...props}
    />
  )
}

export { Marker, MarkerIcon, MarkerContent, markerVariants }
