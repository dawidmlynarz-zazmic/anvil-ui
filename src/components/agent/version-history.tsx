import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellCloseButton, ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { BotIcon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Surfaces › Split canvas · version history (10744:4072) + version item
// (10744:4071): the canvas's versions, to compare and restore. Built on Card (--card, --border,
// radius xl, elevation/raised — Figma's shadow/lg, a known gap) with a Shell Header (bar: "Version
// history", `actions` e.g. Compare (ghost xs), Close) and a Shell Footer (card: the selection note
// and Restore (outline xs)). The list is a radio group of VersionHistoryItems: a 24px agent circle
// Icon Tile (bot, or a person for your edits), `version` text/sm/semibold, an outline xs "Current"
// Badge on the current one, the time text/xs muted (Figma --foreground-subtle is under 4.5:1 on the
// --muted and --info-subtle rows), the `summary` text/sm, then the author text/xs muted and the
// lines `added` (--success-medium) / `removed` (--danger-medium; Figma's --success / --danger are
// under 4.5:1 at text/xs). Figma state → default · current (`current`: --muted fill) · selected
// (`aria-checked`: --info-subtle + --border-action).

function VersionHistory({
  title = 'Version history',
  actions,
  onClose,
  footer,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'title'> & {
  title?: React.ReactNode
  /** Header actions, e.g. Compare (ghost xs Button). */
  actions?: React.ReactNode
  /** Shows Close. */
  onClose?: () => void
  /** The footer: a note and Restore, e.g. a Shell Footer's children. */
  footer?: React.ReactNode
  /** VersionHistoryItems. */
  children?: React.ReactNode
}) {
  const id = React.useId()
  return (
    <Card
      data-slot="version-history"
      className={cn(
        'w-80 max-w-full min-w-0 gap-0 overflow-hidden rounded-xl border-border bg-card py-0 shadow-elevation-raised',
        className,
      )}
      {...props}
    >
      <ShellHeader
        className="gap-2 border-border bg-card px-3 py-2.5"
        trailing={actions}
        close={onClose && <ShellCloseButton size="icon-xs" onClick={onClose} />}
      >
        <ShellTitle id={id} className="type-text-sm-semibold">
          {title}
        </ShellTitle>
      </ShellHeader>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-col gap-0.5 overflow-y-auto p-2">
        {children}
      </div>
      {footer && (
        <ShellFooter variant="card" className="px-3 py-2.5">
          {footer}
        </ShellFooter>
      )}
    </Card>
  )
}

function VersionHistoryItem({
  version,
  summary,
  author,
  time,
  added,
  removed,
  current = false,
  selected = false,
  icon = BotIcon,
  className,
  type = 'button',
  ...props
}: React.ComponentProps<'button'> & {
  /** e.g. "v4". */
  version: React.ReactNode
  /** What changed, in a sentence. */
  summary?: React.ReactNode
  /** Who made it: the assistant's name or "You". */
  author?: React.ReactNode
  time?: React.ReactNode
  /** Lines added, e.g. "+12". */
  added?: React.ReactNode
  /** Lines removed, e.g. "−3". */
  removed?: React.ReactNode
  /** The version the canvas shows now. */
  current?: boolean
  /** Picked in the list (to compare or restore). */
  selected?: boolean
  /** The tile glyph: bot for the assistant, a person for your edits. */
  icon?: LucideIcon
}) {
  return (
    <button
      data-slot="version-history-item"
      role="radio"
      aria-checked={selected}
      data-current={current || undefined}
      type={type}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-md border border-transparent p-2.5 text-left outline-none',
        'transition-colors duration-(--duration-fast) ease-out hover:bg-muted focus-visible:focus-ring',
        'data-current:bg-muted aria-checked:border-border-action aria-checked:bg-info-subtle',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <IconTile icon={icon} tone="agent" size="xs" shape="circle" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="type-text-sm-semibold text-foreground">{version}</span>
          {current && (
            <Badge variant="outline" size="xs">
              Current
            </Badge>
          )}
          {time && (
            <span className="ms-auto type-text-xs-normal whitespace-nowrap text-muted-foreground">
              {time}
            </span>
          )}
        </span>
        {summary && <span className="type-text-sm-normal text-foreground">{summary}</span>}
        {(author || added || removed) && (
          <span className="flex items-center gap-2 type-text-xs-normal">
            {author && <span className="text-muted-foreground">{author}</span>}
            {added && <span className="type-text-xs-medium text-success-medium">{added}</span>}
            {removed && <span className="type-text-xs-medium text-danger-medium">{removed}</span>}
          </span>
        )}
      </span>
    </button>
  )
}

export { VersionHistory, VersionHistoryItem }
