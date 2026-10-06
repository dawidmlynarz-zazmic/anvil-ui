import * as React from 'react'

import { cn } from '@/lib/utils'
import { StepStatusIcon, type StepStatus } from '@/components/agent/step-status'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRightIcon, Icon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › tool call item (10734:2925), built on Collapsible: one tool call.
// `status` running · done · failed; Figma state collapsed · expanded = open state (open: --muted
// card). Row (10px gap): status (pulse dot · --success check · --danger cross, 16px), tool name
// code/xs --muted-foreground, summary text/sm (running: agent, done: --foreground, failed:
// --danger-strong), duration text/xs, 14px chevron. Detail is inset 24px (--space-lg): labelled
// sections (text/xs/medium --muted-foreground) holding code (--card, --border, code/xs) or text,
// then actions (failed: Retry / Skip). Figma's duration is --foreground-subtle; code uses
// --muted-foreground (4.5:1 on the open --muted card).

type ToolCallStatus = StepStatus

const ToolCallItemContext = React.createContext<ToolCallStatus>('running')

function ToolCallItem({
  status = 'running',
  className,
  ...props
}: React.ComponentProps<typeof Collapsible> & { status?: ToolCallStatus }) {
  return (
    <ToolCallItemContext.Provider value={status}>
      <Collapsible
        data-slot="tool-call-item"
        data-status={status}
        className={cn(
          'group/tool-call flex w-full max-w-(--shell-widget-max) flex-col gap-2 rounded-md p-2 data-[state=open]:bg-muted',
          className,
        )}
        {...props}
      />
    </ToolCallItemContext.Provider>
  )
}

/** The row: status indicator, children (name, summary, duration), chevron. Toggles the detail. */
function ToolCallItemTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger>) {
  const status = React.useContext(ToolCallItemContext)
  return (
    <CollapsibleTrigger
      data-slot="tool-call-item-trigger"
      className={cn(
        'flex w-full min-w-0 items-center gap-2.5 rounded-sm text-left outline-none focus-visible:focus-ring',
        className,
      )}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        <StepStatusIcon status={status} />
      </span>
      {children}
      <Icon
        icon={ChevronRightIcon}
        className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]/tool-call:rotate-90"
      />
    </CollapsibleTrigger>
  )
}

function ToolCallItemName({ className, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      data-slot="tool-call-item-name"
      className={cn('shrink-0 type-code-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function ToolCallItemSummary({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="tool-call-item-summary"
      className={cn(
        'min-w-0 flex-1 truncate type-text-sm-normal group-data-[status=done]/tool-call:text-foreground group-data-[status=failed]/tool-call:text-danger-strong group-data-[status=running]/tool-call:text-agent dark:group-data-[status=running]/tool-call:text-agent-medium',
        className,
      )}
      {...props}
    />
  )
}

function ToolCallItemDuration({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="tool-call-item-duration"
      className={cn('shrink-0 type-text-xs-normal text-muted-foreground', className)}
      {...props}
    />
  )
}

function ToolCallItemContent({ className, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="tool-call-item-content"
      className={cn('flex flex-col gap-2 ps-(--space-lg)', className)}
      {...props}
    />
  )
}

/** A labelled block in the detail: Input, Output, Error. */
function ToolCallItemSection({
  label,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { label: React.ReactNode }) {
  return (
    <div
      data-slot="tool-call-item-section"
      className={cn(
        'flex flex-col gap-1 type-text-xs-normal text-foreground group-data-[status=failed]/tool-call:text-danger-strong',
        className,
      )}
      {...props}
    >
      <p className="type-text-xs-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function ToolCallItemCode({ className, ...props }: React.ComponentProps<'pre'>) {
  return (
    <pre
      data-slot="tool-call-item-code"
      className={cn(
        'overflow-x-auto rounded-md border bg-card px-2.5 py-2 type-code-xs whitespace-pre-wrap text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function ToolCallItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="tool-call-item-actions" className={cn('flex gap-2', className)} {...props} />
}

export {
  ToolCallItem,
  ToolCallItemTrigger,
  ToolCallItemName,
  ToolCallItemSummary,
  ToolCallItemDuration,
  ToolCallItemContent,
  ToolCallItemSection,
  ToolCallItemCode,
  ToolCallItemActions,
}
