import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Figma Agent Patterns › Parts · value stack (10877:5984) and stat tile (10847:5117): a label and a
// value stacked, 2px apart (balances, times, boarding-pass fields, impact figures). Pure text, no other
// component.
// - `size` sm (value text/sm/semibold) · default (heading/xl) · lg (heading/3xl, tight tracking); the
//   label is always text/xs --muted-foreground.
// - `align` start · end (end right-aligns the text); `order` label-first · value-first.
// - `emphasis` default · positive (--success-strong) · negative (--danger-strong): colours the value
//   (Figma stat tile). The words must carry the meaning too ("+12%", "−3%"), never colour alone.
// - `variant` default · tile: the Figma stat tile, the stack on a --muted tile (padding 12px, radius
//   md) with the value at text/base/semibold. Lay 2–3 tiles in a row (impact, results, fit).
// The label is `ValueStackLabel`'s text; the stack is `<div>`s, so put it inside a `<dl>` row only
// through KeyValueRow, which has the right semantics for terms and values.

const valueStackVariants = cva('flex max-w-64 flex-col gap-0.5 break-words', {
  variants: {
    align: { start: 'items-start text-start', end: 'items-end text-end' },
    variant: { default: '', tile: 'w-full max-w-none rounded-md bg-muted p-3' },
  },
  defaultVariants: { align: 'start', variant: 'default' },
})

const VALUE_SIZE = {
  sm: 'type-text-sm-semibold',
  default: 'type-heading-xl',
  lg: 'type-heading-3xl',
  // The stat tile's value (Figma: text/base/semibold).
  tile: 'type-text-base-semibold',
} as const

const EMPHASIS = {
  default: 'text-foreground',
  positive: 'text-success-strong dark:text-success-medium',
  negative: 'text-danger-strong dark:text-danger-medium',
} as const

function ValueStack({
  label,
  children,
  size = 'default',
  order = 'label-first',
  emphasis = 'default',
  align,
  variant,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> &
  VariantProps<typeof valueStackVariants> & {
    /** The small caption: “Balance”, “Departs”. */
    label?: React.ReactNode
    /** The value. */
    children: React.ReactNode
    size?: 'sm' | 'default' | 'lg'
    order?: 'label-first' | 'value-first'
    emphasis?: keyof typeof EMPHASIS
  }) {
  const labelNode = label && (
    <span data-slot="value-stack-label" className="type-text-xs-normal text-muted-foreground">
      {label}
    </span>
  )
  return (
    <div
      data-slot="value-stack"
      data-variant={variant ?? 'default'}
      className={cn(valueStackVariants({ align, variant }), className)}
      {...props}
    >
      {order === 'label-first' && labelNode}
      <span
        data-slot="value-stack-value"
        className={cn(VALUE_SIZE[variant === 'tile' ? 'tile' : size], EMPHASIS[emphasis])}
      >
        {children}
      </span>
      {order === 'value-first' && labelNode}
    </div>
  )
}

export { ValueStack }
