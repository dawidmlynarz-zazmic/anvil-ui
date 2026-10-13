import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellDescription, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { type LucideIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Tasks: the card every task pattern shares (task brief, question set, task
// settings, run limits, task plan, change review). The same structure Approval Card draws, as a
// reusable shell: --card, border, radius xl, shadow-sm, max 640px, clipped → a Shell Header card
// (a 32px agent Icon Tile, the title text/sm/semibold, the subtitle text/xs, a trailing Badge) → the
// body (`TaskCardBody`: 16px padding, 12px gap, or your own) → a Shell Footer card (`footer`).
// - `status` is the domain state in the header (not an interaction state): `TaskStatusBadge` review
//   (“Needs approval”, warning) · approved (“Approved”, success) · accepted (“Accepted”, success).
//   For anything else pass your own Badge as `badge` (an outline “0 of 3 answered”).
// - The card is an `<article>` named by its title.

type TaskStatus = 'review' | 'approved' | 'accepted'

const STATUS = {
  review: { label: 'Needs approval', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  accepted: { label: 'Accepted', tone: 'success' },
} as const

function TaskStatusBadge({
  status,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, 'tone' | 'variant' | 'indicator'> & { status: TaskStatus }) {
  return (
    <Badge data-slot="task-status" variant="subtle" tone={STATUS[status].tone} size="xs" indicator {...props}>
      {children ?? STATUS[status].label}
    </Badge>
  )
}

function TaskCard({
  icon,
  tone = 'agent',
  title,
  subtitle,
  badge,
  footer,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  icon: LucideIcon
  tone?: React.ComponentProps<typeof IconTile>['tone']
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** A `TaskStatusBadge` or your own Badge. */
  badge?: React.ReactNode
  /** A ShellFooter `variant="card"`. */
  footer?: React.ReactNode
}) {
  const titleId = React.useId()
  return (
    <article
      data-slot="task-card"
      aria-labelledby={titleId}
      className={cn(
        'flex w-full max-w-160 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm wrap-break-word',
        className,
      )}
      {...props}
    >
      <ShellHeader variant="card" media={<IconTile icon={icon} tone={tone} size="sm" />} trailing={badge}>
        <ShellTitle id={titleId}>{title}</ShellTitle>
        {subtitle && <ShellDescription>{subtitle}</ShellDescription>}
      </ShellHeader>
      {children}
      {footer}
    </article>
  )
}

function TaskCardBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="task-card-body" className={cn('flex flex-col gap-4 p-4', className)} {...props} />
}

export { TaskCard, TaskCardBody, TaskStatusBadge, type TaskStatus }
