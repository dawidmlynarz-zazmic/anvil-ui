import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { TextShimmer } from '@/components/agent/text-shimmer'
import { CheckIcon, CircleAlertIcon, Icon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › tool log line (10735:2892): one inline tool status, lighter than a
// Tool Call Item. `status` running (pulse dot + shimmering label, text/sm/medium) · done (14px
// --muted-foreground check, label text/sm --muted-foreground) · failed (14px --danger alert, label
// --danger-strong). `action` sits after the label: Details when done, Retry when failed (ghost ·
// neutral · xs buttons). 8px gap, 4px vertical padding, up to --shell-widget-max.

type ToolLogStatus = 'running' | 'done' | 'failed'

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
          <PulseDot />
          <TextShimmer className="truncate">{children}</TextShimmer>
        </>
      ) : (
        <>
          <Icon
            icon={status === 'failed' ? CircleAlertIcon : CheckIcon}
            className={cn('size-3.5', status === 'failed' ? 'text-danger' : 'text-muted-foreground')}
          />
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
