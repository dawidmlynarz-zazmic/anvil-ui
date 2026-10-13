import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard } from '@/components/agent/task-card'
import { WidgetError } from '@/components/agent/widget-error'
import { Chip } from '@/components/anvil/chip'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellFooter } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  ActivityIcon,
  BanIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileTextIcon,
  FolderPlusIcon,
  GitBranchIcon,
  Icon,
  RotateCcwIcon,
  SearchIcon,
  TableIcon,
  XIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { chevronMotion, expandMotion } from '@/lib/motion'

// Figma Agent Patterns › Tasks · activity feed (10722:1518): a filterable stream of what the agent did.
// Built on Task Card + Chip + Icon Tile + Collapsible + Skeleton + Empty State + Widget Error + Button,
// nothing re-drawn. Figma state loaded · loading · empty · invalid → `status`; filter all · decisions →
// `filter`.
// - Header: the title, a subtitle (“Live · 64 actions · 11m 40s”) and a `badge` (info, “Live”).
// - Filters: outline pill toggle Chips; the chosen one is filled with a ×, and pressing it again goes
//   back to All. `filters` says which entry types each one shows.
// - Entries (`entries`): a 24px Icon Tile by type (search · read · extract · discard · decision), the title
//   (text/sm), the `meta` line (result · time, text/xs muted) and, when it has a `detail`, a chevron that
//   expands it (a mono line, muted tile). Entries without a detail are plain rows.
// - loading: Skeleton rows; empty: an Empty State with a dismiss button; invalid: a Widget Error with Try
//   again and Get help. Footer: Show more (ghost + chevron) and Export log (ghost + download).

type EntryType = 'search' | 'read' | 'extract' | 'discard' | 'decision'
type ActivityEntry = {
  id: string
  type: EntryType
  title: React.ReactNode
  meta?: React.ReactNode
  detail?: React.ReactNode
}
type ActivityFilter = { value: string; label: string; types?: EntryType[] }

const TYPE: Record<EntryType, { icon: LucideIcon; tone: React.ComponentProps<typeof IconTile>['tone'] }> = {
  search: { icon: SearchIcon, tone: 'neutral' },
  read: { icon: FileTextIcon, tone: 'neutral' },
  extract: { icon: TableIcon, tone: 'info' },
  discard: { icon: BanIcon, tone: 'destructive' },
  decision: { icon: GitBranchIcon, tone: 'agent' },
}

const DEFAULT_FILTERS: ActivityFilter[] = [
  { value: 'all', label: 'All' },
  { value: 'searches', label: 'Searches', types: ['search'] },
  { value: 'reads', label: 'Reads', types: ['read'] },
  { value: 'extractions', label: 'Extractions', types: ['extract'] },
  { value: 'decisions', label: 'Decisions', types: ['decision'] },
  { value: 'discarded', label: 'Discarded', types: ['discard'] },
]

function Entry({ entry }: { entry: ActivityEntry }) {
  const { icon, tone } = TYPE[entry.type]
  const row = (
    <>
      <IconTile icon={icon} tone={tone} size="xs" />
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="type-text-sm-normal text-foreground">{entry.title}</span>
        {entry.meta && <span className="type-text-xs-normal text-muted-foreground">{entry.meta}</span>}
      </span>
    </>
  )
  if (!entry.detail) return <li className="flex items-start gap-3 px-3 py-2">{row}</li>
  return (
    <li>
      <Collapsible className="group/entry">
        <CollapsibleTrigger className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left outline-none focus-visible:focus-ring">
          {row}
          <Icon
            icon={ChevronDownIcon}
            className={cn(
              'mt-1 size-3.5 text-foreground-subtle group-data-[state=open]/entry:rotate-180',
              chevronMotion,
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className={expandMotion}>
          <div className="px-3 pt-0 pb-2 ps-12">
            <p className="rounded-md bg-muted px-2.5 py-1.5 type-code-xs text-muted-foreground">
              {entry.detail}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function ActivityFeed({
  status = 'loaded',
  title,
  subtitle,
  badge,
  entries,
  filters = DEFAULT_FILTERS,
  filter,
  defaultFilter = 'all',
  onFilterChange,
  moreLabel,
  onMore,
  onExport,
  emptyTitle = 'No activity yet',
  emptyDescription = 'Actions the agent takes will appear here as they happen.',
  onDismissEmpty,
  onRetry,
  onGetHelp,
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children'> & {
  /** Figma state loaded · loading · empty · invalid (error). */
  status?: 'loaded' | 'loading' | 'empty' | 'error'
  badge?: React.ReactNode
  entries: ActivityEntry[]
  filters?: ActivityFilter[]
  filter?: string
  defaultFilter?: string
  onFilterChange?: (filter: string) => void
  /** The Show more button: “Show 57 earlier actions”. */
  moreLabel?: React.ReactNode
  onMore?: () => void
  onExport?: () => void
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  onDismissEmpty?: () => void
  onRetry?: () => void
  onGetHelp?: () => void
}) {
  const [inner, setInner] = React.useState(defaultFilter)
  const current = filter ?? inner
  const types = filters.find((f) => f.value === current)?.types
  const shown = types ? entries.filter((e) => types.includes(e.type)) : entries
  const choose = (value: string) => {
    const next = value === current ? (filters[0]?.value ?? 'all') : value
    setInner(next)
    onFilterChange?.(next)
  }
  return (
    <TaskCard
      data-slot="activity-feed"
      data-status={status}
      icon={ActivityIcon}
      title={title}
      subtitle={subtitle}
      badge={
        badge && (
          <Badge variant="subtle" tone="info" size="xs" indicator>
            {badge}
          </Badge>
        )
      }
      className={cn(className)}
      footer={
        status === 'loaded' && (moreLabel || onExport) ? (
          <ShellFooter variant="card" align="between">
            {moreLabel ? (
              <Button variant="ghost" intent="neutral" size="sm" onClick={onMore}>
                <Icon icon={ChevronDownIcon} />
                {moreLabel}
              </Button>
            ) : (
              <span />
            )}
            {onExport && (
              <Button variant="ghost" intent="neutral" size="sm" onClick={onExport}>
                <Icon icon={DownloadIcon} />
                Export log
              </Button>
            )}
          </ShellFooter>
        ) : undefined
      }
      {...props}
    >
      {status === 'loaded' && (
        <div className="flex flex-col gap-1 p-2">
          <div role="group" aria-label="Filter activity" className="flex flex-wrap gap-2 px-2 pt-1 pb-2">
            {filters.map((f) => (
              <Chip
                key={f.value}
                variant="outline"
                shape="pill"
                size="default"
                pressed={f.value === current}
                onPressedChange={() => choose(f.value)}
              >
                {f.label}
                {f.value === current && f.value !== filters[0]?.value && <Icon icon={XIcon} />}
              </Chip>
            ))}
          </div>
          <ul aria-label="Activity">
            {shown.map((entry) => (
              <Entry key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      )}
      {status === 'loading' && (
        <div role="status" aria-busy className="flex flex-col gap-3 p-4">
          <p className="type-text-sm-normal text-muted-foreground">Loading activity…</p>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-6 rounded-md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      )}
      {status === 'empty' && (
        <EmptyState className="border-0">
          <EmptyStateHeader>
            <EmptyStateMedia>
              <Icon icon={FolderPlusIcon} className="size-10 text-foreground-subtle" />
            </EmptyStateMedia>
            <EmptyStateTitle>{emptyTitle}</EmptyStateTitle>
            <EmptyStateDescription>{emptyDescription}</EmptyStateDescription>
          </EmptyStateHeader>
          {onDismissEmpty && (
            <EmptyStateContent>
              <Button intent="neutral" size="sm" onClick={onDismissEmpty}>
                Got it
              </Button>
            </EmptyStateContent>
          )}
        </EmptyState>
      )}
      {status === 'error' && (
        <div className="p-3">
          <WidgetError
            type="failed"
            title="Couldn’t load activity"
            description="The activity log didn’t load. The task is still running."
            className="max-w-none border-0 shadow-none"
            actions={
              <>
                <Button variant="outline" intent="neutral" size="sm" onClick={onRetry}>
                  <Icon icon={RotateCcwIcon} />
                  Try again
                </Button>
                <Button variant="ghost" intent="neutral" size="sm" onClick={onGetHelp}>
                  Get help
                </Button>
              </>
            }
          />
        </div>
      )}
    </TaskCard>
  )
}

export { ActivityFeed, type ActivityEntry, type ActivityFilter, type EntryType }
