import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard, TaskCardBody } from '@/components/agent/task-card'
import { ShellFooter } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import { CheckIcon, Icon, SlidersHorizontalIcon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Figma Agent Patterns › Tasks · task settings (10720:1427): a depth preset plus the sources or tools the
// agent may use. Built on Task Card + Tabs + Switch + Button, nothing re-drawn. Figma depth quick ·
// standard · exhaustive → `depth` (the value of the preset Tabs, one per entry of `depths`).
// - Depth: a muted label over full-width Tabs (the line-less contained list).
// - Sources: a “Source types” heading with “5 of 7 on” (text/xs muted), then one row per source: its
//   label, an optional `action` (an outline xs Button, e.g. “Connect Google Drive”) and a Switch labelled
//   by the row, with a hairline between rows. `enabled` / `defaultEnabled` is the list of ids that are on.
// - `dateField`: any node (a Date Picker) after a label (`dateLabel`), e.g. “Only use sources published after”.
// - Footer: the estimate of the chosen depth (its `estimate`) and Apply scope (brand + check, `onApply`).

type Depth = { value: string; label: string; estimate: React.ReactNode }
type SourceOption = { id: string; label: React.ReactNode; action?: React.ReactNode; disabled?: boolean }

function TaskSettings({
  title,
  subtitle,
  depthLabel = 'Depth',
  depths,
  depth,
  defaultDepth,
  onDepthChange,
  sourcesLabel = 'Source types',
  sources,
  enabled,
  defaultEnabled,
  onEnabledChange,
  dateLabel,
  dateField,
  onApply,
  applyLabel = 'Apply scope',
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children'> & {
  depthLabel?: React.ReactNode
  depths: Depth[]
  depth?: string
  defaultDepth?: string
  onDepthChange?: (depth: string) => void
  sourcesLabel?: React.ReactNode
  sources: SourceOption[]
  /** Ids of the sources that are on. */
  enabled?: string[]
  defaultEnabled?: string[]
  onEnabledChange?: (enabled: string[]) => void
  dateLabel?: React.ReactNode
  dateField?: React.ReactNode
  onApply?: (settings: { depth: string; enabled: string[] }) => void
  applyLabel?: React.ReactNode
}) {
  const [innerDepth, setInnerDepth] = React.useState(defaultDepth ?? depths[0]?.value)
  const [innerEnabled, setInnerEnabled] = React.useState(defaultEnabled ?? [])
  const currentDepth = depth ?? innerDepth
  const on = enabled ?? innerEnabled
  const baseId = React.useId()
  const estimate = depths.find((d) => d.value === currentDepth)?.estimate
  const toggle = (id: string, next: boolean) => {
    const result = next ? [...on, id] : on.filter((x) => x !== id)
    setInnerEnabled(result)
    onEnabledChange?.(result)
  }
  return (
    <TaskCard
      data-slot="task-settings"
      icon={SlidersHorizontalIcon}
      title={title}
      subtitle={subtitle}
      className={cn(className)}
      footer={
        <ShellFooter variant="card" align="end" note={estimate}>
          <Button intent="brand" size="sm" onClick={() => onApply?.({ depth: currentDepth, enabled: on })}>
            <Icon icon={CheckIcon} />
            {applyLabel}
          </Button>
        </ShellFooter>
      }
      {...props}
    >
      <TaskCardBody className="gap-3">
        <div className="flex flex-col gap-2">
          <span className="type-text-xs-normal text-muted-foreground">{depthLabel}</span>
          <Tabs
            value={currentDepth}
            onValueChange={(next) => {
              setInnerDepth(next)
              onDepthChange?.(next)
            }}
          >
            <TabsList fullWidth aria-label={typeof depthLabel === 'string' ? depthLabel : 'Depth'}>
              {depths.map((d) => (
                <TabsTrigger key={d.value} value={d.value}>
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* The depth is a preset, not a panel: empty panels keep each tab's aria-controls valid. */}
            {depths.map((d) => (
              <TabsContent key={d.value} value={d.value} forceMount className="hidden" />
            ))}
          </Tabs>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-1">
            <span className="type-text-xs-normal text-muted-foreground">{sourcesLabel}</span>
            <span className="type-text-xs-normal text-muted-foreground">
              {on.length} of {sources.length} on
            </span>
          </div>
          <ul className="flex flex-col">
            {sources.map((source, index) => {
              const id = `${baseId}-${source.id}`
              return (
                <li key={source.id}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center gap-3 py-2.5">
                    <Label htmlFor={id} className="flex-1 type-text-sm-normal text-foreground">
                      {source.label}
                    </Label>
                    {source.action}
                    <Switch
                      id={id}
                      size="sm"
                      checked={on.includes(source.id)}
                      disabled={source.disabled}
                      onCheckedChange={(next) => toggle(source.id, next)}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        {dateField && (
          <div className="flex items-center justify-between gap-3">
            <span className="type-text-sm-normal text-foreground">{dateLabel}</span>
            {dateField}
          </div>
        )}
      </TaskCardBody>
    </TaskCard>
  )
}

export { TaskSettings, type Depth, type SourceOption }
