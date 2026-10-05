import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { shellDescriptionClassName } from '@/components/anvil/shell'
import { cn } from '@/lib/utils'

// Figma: Cards page → `card static` (8568:1493) and `card interactive` (8553:1394). A flat container
// (border only, CLAUDE.md → Elevation): --background, 1px --overlay-8 stroke, radius md, min width
// 320. Figma `size` sm · default · lg is padding density → `size`
// (8 / 16 / 24 padding and gap), the API Contract's size vocabulary; the parts read it from
// --card-padding. Header and footer follow the inline .shell header / .shell footer.
// Interactive card = the Card rendered as a link or button (`asChild`): --overlay-16 stroke +
// shadow/sm, hover → shadow/md, standard focus ring (no focus or disabled drawn: CLAUDE.md gaps).
const cardVariants = cva(
  [
    'group/card flex min-w-80 flex-col gap-(--card-padding) rounded-md bg-background py-(--card-padding) text-foreground',
    'border border-overlay-8',
    // Interactive: a link or button card.
    '[&:is(a,button,[role=button])]:border-overlay-16 [&:is(a,button,[role=button])]:shadow-sm [&:is(a,button,[role=button])]:outline-none',
    '[&:is(a,button,[role=button])]:transition-shadow [&:is(a,button,[role=button])]:duration-(--duration-fast) [&:is(a,button,[role=button])]:ease-out',
    '[&:is(a,button,[role=button])]:hover:shadow-md [&:is(a,button,[role=button])]:focus-visible:focus-ring',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: '[--card-padding:--spacing(2)]',
        default: '[--card-padding:--spacing(4)]',
        lg: '[--card-padding:var(--space-lg)]',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

type CardProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardVariants> & {
    /** Render as the child element, e.g. an `<a>` or `<button>`: an interactive card. */
    asChild?: boolean
  }

function Card({ className, size = 'default', asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp data-slot="card" data-size={size} className={cn(cardVariants({ size }), className)} {...props} />
  )
}

/** Inline .shell header: title + description, optional CardAction at the end. */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-(--card-padding) has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-padding)',
        className,
      )}
      {...props}
    />
  )
}

/** Inline shell title: text/base/semibold. */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('type-text-base-semibold text-foreground', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn(shellDescriptionClassName, className)} {...props} />
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

/** A Figma card slot. */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-(--card-padding)', className)} {...props} />
}

/** Inline .shell footer: actions (size sm Buttons), aligned end by default. */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-2 px-(--card-padding) [.border-t]:pt-(--card-padding)', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, cardVariants }
