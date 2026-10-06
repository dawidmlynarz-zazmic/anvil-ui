import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { CheckIcon, CircleAlertIcon, CircleCheckIcon, CircleXIcon, Icon } from '@/components/ui/icon'

// One status vocabulary for every agent step (audit M7): running · done · failed. Thinking Panel,
// Tool Call Item, Tool Call Accordion and Tool Log Line share it, and `StepStatusIcon` draws it:
// running = the pulse dot; done and failed = an icon. `appearance` default (Tool Call Item, Tool
// Log Line: --success circle-check · --danger circle-x) · subtle (Thinking Panel: --muted-foreground
// check · --danger circle-alert). Decorative; the step's text names the status.

type StepStatus = 'running' | 'done' | 'failed'

const ICONS = {
  default: { done: CircleCheckIcon, failed: CircleXIcon },
  subtle: { done: CheckIcon, failed: CircleAlertIcon },
} as const

function StepStatusIcon({
  status,
  appearance = 'default',
  className,
}: {
  status: StepStatus
  appearance?: keyof typeof ICONS
  className?: string
}) {
  if (status === 'running') return <PulseDot className={className} />
  const icon = ICONS[appearance][status]
  return (
    <Icon
      icon={icon}
      data-slot="step-status-icon"
      data-status={status}
      className={cn(
        status === 'failed'
          ? 'text-danger dark:text-danger-medium'
          : appearance === 'subtle'
            ? 'text-muted-foreground'
            : 'text-success dark:text-success-medium',
        className,
      )}
    />
  )
}

export { StepStatusIcon, type StepStatus }
