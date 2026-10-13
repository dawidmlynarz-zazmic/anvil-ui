import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDollarSignIcon,
  CircleMinusIcon,
  Icon,
  type LucideIcon,
} from '@/components/ui/icon'

// Figma Agent Patterns › Parts · check row (10847:5075): one line in a list of what an option includes
// (fares, plans, permissions, specs). Only Icon. `status` included (check, --success) · excluded
// (minus, --foreground-subtle) · fee (dollar sign, --warning: costs extra) · pending (dashed circle,
// --foreground-subtle: not confirmed yet). Text is text/xs --foreground, 6px after a 14px glyph. The
// status is also said in words for assistive tech (`statusLabel`, visually hidden), so the glyph's
// colour is never the only signal.

type CheckStatus = 'included' | 'excluded' | 'fee' | 'pending'

const STATUS: Record<CheckStatus, { icon: LucideIcon; className: string; label: string }> = {
  included: { icon: CircleCheckIcon, className: 'text-success dark:text-success-medium', label: 'Included' },
  excluded: { icon: CircleMinusIcon, className: 'text-foreground-subtle', label: 'Not included' },
  fee: { icon: CircleDollarSignIcon, className: 'text-warning dark:text-warning-medium', label: 'Extra fee' },
  pending: { icon: CircleDashedIcon, className: 'text-foreground-subtle', label: 'Pending' },
}

function CheckRow({
  status = 'included',
  statusLabel,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Figma status included · excluded · fee · pending. */
  status?: CheckStatus
  /** The status in words for assistive tech; each status has a default. */
  statusLabel?: string
}) {
  const { icon, className: tone, label } = STATUS[status]
  return (
    <div
      data-slot="check-row"
      data-status={status}
      className={cn('flex items-center gap-1.5 type-text-xs-normal text-foreground', className)}
      {...props}
    >
      <Icon icon={icon} className={cn('size-3.5', tone)} />
      <span className="sr-only">{statusLabel ?? label}: </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

export { CheckRow, type CheckStatus }
