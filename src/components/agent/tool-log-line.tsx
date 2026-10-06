import * as React from 'react'

import { cn } from '@/lib/utils'
import { StepStatusIcon, type StepStatus } from '@/components/agent/step-status'
import { TextShimmer } from '@/components/agent/text-shimmer'

// Figma Agent Builder › Core Kit › tool log line (10735:2892): one inline tool status, lighter than a
// Tool Call Item. `status` running (pulse dot + shimmering label, text/sm/medium) · done (14px
// --muted-foreground check, label text/sm --muted-foreground) · failed (14px --danger alert, label
// --danger-strong). `action` sits after the label: Details when done, Retry when failed (ghost ·
// neutral · xs buttons). 8px gap, 4px vertical padding, up to --shell-widget-max.

type ToolLogStatus = StepStatus

function ToolLogLine({
  status = 'running',
  action,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { status?: ToolLogStatus; action?: React.ReactNode }) {
  return (
    <div
      data-slot="tool-log-line"
      data-status={status}
      className={cn('flex max-w-(--shell-widget-max) items-center gap-2 py-1', className)}
      {...props}
    >
      {status === 'running' ? (
        <>
          <StepStatusIcon status="running" />
          <TextShimmer className="truncate">{children}</TextShimmer>
        </>
      ) : (
        <>
          <StepStatusIcon status={status} appearance="subtle" className="size-3.5" />
          <span
            className={cn(
              'min-w-0 truncate type-text-sm-normal',
              status === 'failed' ? 'text-danger-strong' : 'text-muted-foreground',
            )}
          >
            {children}
          </span>
        </>
      )}
      {action}
    </div>
  )
}

export { ToolLogLine, type ToolLogStatus }
