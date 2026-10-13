import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard, TaskStatusBadge } from '@/components/agent/task-card'
import { ShellFooter } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowRightIcon,
  CheckIcon,
  Icon,
  ListChecksIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from '@/components/ui/icon'

// Figma Agent Patterns › Tasks · task plan (10711:327): the ordered steps the agent will take, for
// approval. Built on Task Card + Badge + Button, nothing re-drawn. Figma state review · approved →
// `status`.
// - TaskPlan: the card: an `<ol>` of `TaskPlanStep`s, an optional Add step (`onAddStep`, ghost) and the footer.
//   review: the estimate (`note`) · Edit plan (outline, `onEdit`) · Approve plan (brand + check,
//   `onApprove`). approved: `approvedNote` and View progress (ghost + arrow, `onViewProgress`).
// - TaskPlanStep: a numbered row: the number in an agent-subtle disc, the title (text/sm/semibold), the
//   `description` (text/xs --muted-foreground) and its `tags` (outline xs Badges: the sources or tools it
//   uses). In a review plan the row can be edited: `onEdit` / `onRemove` show icon buttons on hover and
//   focus-within, over a --muted row (Figma state hover; focus draws the standard ring on the buttons).
//   Figma also draws a drag handle: reordering is not built (needs keyboard moves and a drag library),
//   noted in the status doc.

function TaskPlanStep({
  index,
  title,
  description,
  tags,
  onEdit,
  onRemove,
  editLabel = 'Edit step',
  removeLabel = 'Remove step',
  className,
  ...props
}: Omit<React.ComponentProps<'li'>, 'title'> & {
  /** The step number. */
  index: number
  title: React.ReactNode
  description?: React.ReactNode
  tags?: string[]
  onEdit?: () => void
  onRemove?: () => void
  editLabel?: string
  removeLabel?: string
}) {
  const label = typeof title === 'string' ? title : undefined
  return (
    <li
      data-slot="task-plan-step"
      className={cn(
        'group/step flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-(--duration-fast) ease-out hover:bg-muted focus-within:bg-muted',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-agent-subtle type-text-xs-semibold text-agent-strong dark:text-foreground"
      >
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="type-text-sm-semibold text-foreground">{title}</p>
        {description && <p className="type-text-xs-normal text-muted-foreground">{description}</p>}
        {tags && tags.length > 0 && (
          <ul aria-label="Uses" className="mt-1 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline" tone="neutral" size="xs">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(onEdit || onRemove) && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-(--duration-fast) ease-out group-focus-within/step:opacity-100 group-hover/step:opacity-100">
          {onEdit && (
            <Button
              variant="ghost"
              intent="neutral"
              size="icon-xs"
              aria-label={label ? `${editLabel}: ${label}` : editLabel}
              onClick={onEdit}
            >
              <Icon icon={PencilIcon} />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              intent="neutral"
              size="icon-xs"
              aria-label={label ? `${removeLabel}: ${label}` : removeLabel}
              onClick={onRemove}
            >
              <Icon icon={XIcon} />
            </Button>
          )}
        </div>
      )}
    </li>
  )
}

function TaskPlan({
  status = 'review',
  title,
  subtitle,
  onAddStep,
  addStepLabel = 'Add step',
  note,
  onEdit,
  editLabel = 'Edit plan',
  onApprove,
  approveLabel = 'Approve plan',
  approvedNote,
  onViewProgress,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer'> & {
  /** Figma state review · approved. */
  status?: 'review' | 'approved'
  onAddStep?: () => void
  addStepLabel?: React.ReactNode
  /** The review footer line: the estimate (“Estimated 15 min · up to 60 sources”). */
  note?: React.ReactNode
  onEdit?: () => void
  editLabel?: React.ReactNode
  onApprove?: () => void
  approveLabel?: React.ReactNode
  /** The approved footer line: “Approved · research running”. */
  approvedNote?: React.ReactNode
  onViewProgress?: () => void
}) {
  return (
    <TaskCard
      data-slot="task-plan"
      data-status={status}
      icon={ListChecksIcon}
      title={title}
      subtitle={subtitle}
      badge={<TaskStatusBadge status={status} />}
      className={className}
      footer={
        status === 'review' ? (
          <ShellFooter variant="card" align="end" note={note}>
            <Button variant="outline" intent="neutral" size="sm" onClick={onEdit}>
              <Icon icon={PencilIcon} />
              {editLabel}
            </Button>
            <Button intent="brand" size="sm" onClick={onApprove}>
              <Icon icon={CheckIcon} />
              {approveLabel}
            </Button>
          </ShellFooter>
        ) : (
          <ShellFooter variant="card" align="between" note={approvedNote}>
            <Button variant="ghost" intent="neutral" size="sm" onClick={onViewProgress}>
              View progress
              <Icon icon={ArrowRightIcon} />
            </Button>
          </ShellFooter>
        )
      }
      {...props}
    >
      <div className="flex flex-col p-2">
        <ol className="flex flex-col">{children}</ol>
        {status === 'review' && onAddStep && (
          <Button variant="ghost" intent="neutral" size="sm" className="mt-1 self-start" onClick={onAddStep}>
            <Icon icon={PlusIcon} />
            {addStepLabel}
          </Button>
        )}
      </div>
    </TaskCard>
  )
}

export { TaskPlan, TaskPlanStep }
