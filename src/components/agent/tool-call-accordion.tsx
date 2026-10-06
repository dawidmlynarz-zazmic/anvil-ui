import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRightIcon, Icon, WrenchIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › tool call accordion (10734:3012): grouped tool calls, built from
// tool call item on Collapsible. Figma state collapsed · expanded = open state; running = `status`
// running (done otherwise). Card: --card, --border, radius lg, up to --shell-widget-max. Header
// (12/10px padding, 10px gap, --border below when open): 24px --agent-subtle tile with a wrench
// (or the pulse dot while running), title text/sm/medium (agent while running), tool list text/xs
// --muted-foreground (truncates), duration text/xs, 14px chevron. Calls: 8px padding, 2px apart.

type ToolCallAccordionStatus = 'running' | 'done'

const ToolCallAccordionContext = React.createContext<ToolCallAccordionStatus>('done')

function ToolCallAccordion({
  status = 'done',
  className,
  ...props
}: React.ComponentProps<typeof Collapsible> & { status?: ToolCallAccordionStatus }) {
  return (
    <ToolCallAccordionContext.Provider value={status}>
      <Collapsible
        data-slot="tool-call-accordion"
        data-status={status}
        className={cn(
          'group/tool-calls flex w-full max-w-(--shell-widget-max) flex-col overflow-hidden rounded-lg border bg-card text-card-foreground',
          className,
        )}
        {...props}
      />
    </ToolCallAccordionContext.Provider>
  )
}

/** The header: status tile, children (title, tool list, duration), chevron. */
function ToolCallAccordionTrigger({
  className,
  title,
  summary,
  duration,
  ...props
}: Omit<React.ComponentProps<typeof CollapsibleTrigger>, 'children' | 'title' | 'name'> & {
  title?: React.ReactNode
  summary?: React.ReactNode
  duration?: React.ReactNode
}) {
  const status = React.useContext(ToolCallAccordionContext)
  return (
    <CollapsibleTrigger
      data-slot="tool-call-accordion-trigger"
      className={cn(
        'flex w-full min-w-0 items-center gap-2.5 px-3 py-2.5 text-left outline-none group-data-[state=open]/tool-calls:border-b focus-visible:focus-ring focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-agent-subtle text-agent dark:text-agent-medium">
        {status === 'running' ? <PulseDot /> : <Icon icon={WrenchIcon} className="size-3.5" />}
      </span>
      {title !== undefined && <ToolCallAccordionTitle>{title}</ToolCallAccordionTitle>}
      {summary !== undefined && <ToolCallAccordionSummary>{summary}</ToolCallAccordionSummary>}
      {duration !== undefined && <ToolCallAccordionDuration>{duration}</ToolCallAccordionDuration>}
      <Icon
        icon={ChevronRightIcon}
        className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool-calls:rotate-90"
      />
    </CollapsibleTrigger>
  )
}

function ToolCallAccordionTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="tool-call-accordion-title"
      className={cn(
        'shrink-0 type-text-sm-medium text-foreground group-data-[status=running]/tool-calls:text-agent dark:group-data-[status=running]/tool-calls:text-agent-medium',
        className,
      )}
      {...props}
    />
  )
}

/** The tools used, in one truncating line. */
function ToolCallAccordionSummary({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="tool-call-accordion-summary"
      className={cn('min-w-0 flex-1 truncate type-text-xs-normal text-muted-foreground', className)}
      {...props}
    />
  )
}

function ToolCallAccordionDuration({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="tool-call-accordion-duration"
      className={cn('shrink-0 type-text-xs-normal text-muted-foreground', className)}
      {...props}
    />
  )
}

/** Holds the ToolCallItems. */
function ToolCallAccordionContent({ className, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="tool-call-accordion-content"
      className={cn('flex flex-col gap-0.5 p-2', className)}
      {...props}
    />
  )
}

export { ToolCallAccordion, ToolCallAccordionTrigger, ToolCallAccordionContent }
