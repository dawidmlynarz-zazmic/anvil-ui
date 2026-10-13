import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Figma Agent Patterns › Parts · price (10855:5558): the current price with an optional was-price and
// discount. Built on Badge (the discount pill: subtle destructive, 2xs). `size` sm (text/sm/semibold,
// was text/xs) · default (heading/xl, was text/sm) · lg (heading/2xl, was text/base); `emphasis`
// default · sale (the current price in --danger-strong). 6px gap. The was-price is struck through and
// both are named for assistive tech (“Was”, “Now”), so a sale is never colour alone.

const CURRENT = {
  sm: 'type-text-sm-semibold',
  default: 'type-heading-xl',
  lg: 'type-heading-2xl',
} as const

const WAS = {
  sm: 'type-text-xs-normal',
  default: 'type-text-sm-normal',
  lg: 'type-text-base-normal',
} as const

function Price({
  current,
  was,
  discount,
  size = 'default',
  emphasis = 'default',
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The price to pay, formatted: “$119”. */
  current: React.ReactNode
  /** The price before the discount, formatted. */
  was?: React.ReactNode
  /** The discount, formatted: “−20%”. */
  discount?: React.ReactNode
  size?: 'sm' | 'default' | 'lg'
  emphasis?: 'default' | 'sale'
}) {
  return (
    <div
      data-slot="price"
      data-emphasis={emphasis}
      className={cn('flex items-center gap-1.5', className)}
      {...props}
    >
      <span
        className={cn(
          'whitespace-nowrap',
          CURRENT[size],
          emphasis === 'sale' ? 'text-danger-strong dark:text-danger-medium' : 'text-foreground',
        )}
      >
        <span className="sr-only">Now </span>
        {current}
      </span>
      {was && (
        <del className={cn('whitespace-nowrap text-foreground-subtle', WAS[size])}>
          <span className="sr-only">Was </span>
          {was}
        </del>
      )}
      {discount && (
        <Badge variant="subtle" tone="destructive" shape="pill" size="xs">
          {discount}
        </Badge>
      )}
    </div>
  )
}

export { Price }
