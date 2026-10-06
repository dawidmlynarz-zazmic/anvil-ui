import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { StepStatusIcon, type StepStatus } from '@/components/agent/step-status'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckIcon, ChevronRightIcon, Icon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › thinking panel (10667:13166): the agent's reasoning, collapsed to
// a one-line header. `status` running · done · failed (the shared step vocabulary, audit M7; Figma
// status active · completed · failed); open / closed (Figma state
// collapsed · expanded) is the Collapsible's. Card: radius md, 12/8px padding, 8px gap, up to
// --shell-widget-max wide. running = --agent-subtle on --agent-soft, pulse dot, agent title;
// done = --border outline, check, --muted-foreground title; failed = --danger-subtle on
// --danger-muted, alert icon, danger title. Header: 24px min, title text/sm/semibold, duration
// text/xs/normal --muted-foreground, chevron at the end (right → down when open). Body: text/xs
// --foreground, scrolls past 320px; steps are 12px icon + text/xs rows 4px apart.
// Agent / danger title text uses the -medium tone in dark (Figma --agent / --danger fall below
// 4.5:1 there).

const ThinkingPanelContext = React.createContext<StepStatus>('running')

const thinkingPanelVariants = cva(
  'group/thinking flex w-full max-w-(--shell-widget-max) flex-col gap-2 rounded-md border px-3 py-2',
  {
    variants: {
      status: {
        running: 'border-agent-soft bg-agent-subtle',
        done: 'border-border',
        failed: 'border-danger-muted bg-danger-subtle',
      },
    },
    defaultVariants: { status: 'running' },
  },
)

function ThinkingPanel({
  status = 'running',
  className,
  ...props
}: React.ComponentProps<typeof Collapsible> & { status?: StepStatus }) {
  return (
    <ThinkingPanelContext.Provider value={status}>
      <Collapsible
        data-slot="thinking-panel"
        data-status={status}
        className={cn(thinkingPanelVariants({ status }), className)}
        {...props}
      />
    </ThinkingPanelContext.Provider>
  )
}

/** The header row: status indicator, children (title, duration), chevron. Toggles the panel. */
function ThinkingPanelTrigger({
  className,
  title,
  duration,
  ...props
}: Omit<React.ComponentProps<typeof CollapsibleTrigger>, 'children' | 'title' | 'name'> & {
  title?: React.ReactNode
  duration?: React.ReactNode
}) {
  const status = React.useContext(ThinkingPanelContext)
  return (
    <CollapsibleTrigger
      data-slot="thinking-panel-trigger"
      className={cn(
        'flex min-h-6 w-full items-center gap-2 rounded-sm text-left outline-none focus-visible:focus-ring',
        className,
      )}
      {...props}
    >
      <StepStatusIcon status={status} appearance="subtle" />
      {title !== undefined && <ThinkingPanelTitle>{title}</ThinkingPanelTitle>}
      {duration !== undefined && <ThinkingPanelDuration>{duration}</ThinkingPanelDuration>}
      <Icon
        icon={ChevronRightIcon}
        className="ms-auto text-muted-foreground transition-transform group-data-[state=open]/thinking:rotate-90"
      />
    </CollapsibleTrigger>
  )
}

function ThinkingPanelTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="thinking-panel-title"
      className={cn(
        'type-text-sm-semibold group-data-[status=running]/thinking:text-agent group-data-[status=done]/thinking:text-muted-foreground group-data-[status=failed]/thinking:text-danger dark:group-data-[status=running]/thinking:text-agent-medium dark:group-data-[status=failed]/thinking:text-danger-medium',
        className,
      )}
      {...props}
    />
  )
}

function ThinkingPanelDuration({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="thinking-panel-duration"
      className={cn('type-text-xs-normal text-muted-foreground', className)}
      {...props}
    />
  )
}

function ThinkingPanelContent({ className, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="thinking-panel-content"
      className={cn(
        'flex max-h-80 flex-col gap-2 overflow-y-auto type-text-xs-normal text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function ThinkingPanelSteps({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="thinking-panel-steps" className={cn('flex flex-col gap-1', className)} {...props} />
}

function ThinkingPanelStep({
  icon = CheckIcon,
  className,
  children,
  ...props
}: React.ComponentProps<'li'> & { icon?: LucideIcon }) {
  return (
    <li data-slot="thinking-panel-step" className={cn('flex items-center gap-1', className)} {...props}>
      <Icon icon={icon} size="xs" className="text-muted-foreground" />
      {children}
    </li>
  )
}

export {
  ThinkingPanel,
  ThinkingPanelTrigger,
  ThinkingPanelContent,
  ThinkingPanelSteps,
  ThinkingPanelStep,
  thinkingPanelVariants,
}
