import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Figma Agent Patterns › Parts · key value row (10847:4910): a label and its value on one line, in a
// real description list. Pure text, no other component.
// - KeyValueList: the `<dl>`; rows are 8px apart.
// - KeyValueRow: one `<div>` row (valid inside a `<dl>`) with a `<dt>` (`label`, plus the optional
//   `lead` column for quantities, “2 ×”) and a `<dd>` (`children`).
//   `layout` spread (the value is pushed to the end: totals, summaries; 8px gap) · aligned (a fixed 96px
//   label column, the value fills the rest: detail lists; 12px gap). `emphasis` default (muted label,
//   text/sm/medium value; aligned: semibold both) · strong (semibold, --foreground, for a total).

const rowVariants = cva('flex items-start type-text-sm-normal', {
  variants: {
    layout: { spread: 'gap-2', aligned: 'gap-3' },
  },
  defaultVariants: { layout: 'spread' },
})

function KeyValueList({ className, ...props }: React.ComponentProps<'dl'>) {
  return <dl data-slot="key-value-list" className={cn('flex flex-col gap-2', className)} {...props} />
}

function KeyValueRow({
  label,
  lead,
  layout = 'spread',
  emphasis = 'default',
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The key (Figma “key”). */
  label: React.ReactNode
  /** An optional column before the key: a quantity such as “2 ×”. */
  lead?: React.ReactNode
  layout?: 'spread' | 'aligned'
  emphasis?: 'default' | 'strong'
  /** The value. */
  children: React.ReactNode
}) {
  const strong = emphasis === 'strong'
  return (
    <div
      data-slot="key-value-row"
      data-layout={layout}
      className={cn(rowVariants({ layout }), className)}
      {...props}
    >
      <dt
        className={cn(
          'flex gap-2',
          layout === 'aligned' ? 'w-24 shrink-0' : 'min-w-0 flex-1',
          strong || layout === 'aligned' ? 'type-text-sm-semibold text-foreground' : 'text-muted-foreground',
        )}
      >
        {lead && <span className="shrink-0 font-normal text-muted-foreground">{lead}</span>}
        <span className="min-w-0">{label}</span>
      </dt>
      <dd
        className={cn(
          'min-w-0 text-foreground',
          layout === 'spread' ? 'shrink-0 text-right whitespace-nowrap' : 'flex-1',
          strong || layout === 'aligned' ? 'type-text-sm-semibold' : 'type-text-sm-medium',
        )}
      >
        {children}
      </dd>
    </div>
  )
}

export { KeyValueList, KeyValueRow }
