import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { IconTile } from '@/components/anvil/icon-tile'
import { Button } from '@/components/ui/button'
import {
  BanIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Icon,
  RotateCcwIcon,
  type LucideIcon,
} from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › source card (10713:887): a source with its credibility and usage
// (deep research, ticketing). --card, --border, radius xl, shadow-sm, 16px padding, 12px gap, up to
// --shell-widget-max. Header: 24px --muted icon tile (14px icon), publisher text/xs/medium + meta
// text/xs --muted-foreground, optional tag (outline badge, e.g. "Report"). Title text/sm/semibold.
// Excerpt text/xs --muted-foreground behind a 2px --border-strong bar. Footer: credibility legend
// (10px dot --success · --warning · --danger + text/xs), usage badge (subtle xs), then Open and
// Exclude (or Restore) ghost icon buttons. Figma state excluded = `excluded`: "Excluded" status badge
// and Restore. Figma dims the whole body to 55%; that drops every text below 4.5:1, so code dims
// only the icon tile and dot and turns the text --muted-foreground.

type Credibility = 'high' | 'medium' | 'low'

const CREDIBILITY: Record<Credibility, { dot: string; label: string }> = {
  high: { dot: 'bg-success', label: 'High credibility' },
  medium: { dot: 'bg-warning', label: 'Medium credibility' },
  low: { dot: 'bg-danger', label: 'Low credibility' },
}

function SourceCard({
  publisher,
  meta,
  icon = GlobeIcon,
  tag,
  title,
  excerpt,
  credibility,
  usage,
  excluded = false,
  href,
  onExclude,
  onRestore,
  className,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  publisher: React.ReactNode
  /** Domain and date, e.g. "example.com · 14 May 2026". */
  meta?: React.ReactNode
  icon?: LucideIcon
  /** Source type, e.g. "Report". */
  tag?: React.ReactNode
  title: React.ReactNode
  excerpt?: React.ReactNode
  credibility?: Credibility
  /** Usage, e.g. "Cited in 3 findings". Hidden while excluded. */
  usage?: React.ReactNode
  /** Figma state excluded: left out of the answer. */
  excluded?: boolean
  /** Opens the source. */
  href?: string
  onExclude?: () => void
  onRestore?: () => void
}) {
  return (
    <article
      data-slot="source-card"
      data-excluded={excluded || undefined}
      className={cn(
        'group/source flex w-full max-w-(--shell-widget-max) flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm wrap-break-word',
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-2">
        <IconTile icon={icon} size="xs" className="group-data-[excluded]/source:opacity-55" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate type-text-xs-medium text-foreground group-data-[excluded]/source:text-muted-foreground">
            {publisher}
          </span>
          {meta && <span className="truncate type-text-xs-normal text-muted-foreground">{meta}</span>}
        </div>
        {tag && (
          <Badge variant="outline" intent="neutral" size="sm">
            {tag}
          </Badge>
        )}
      </header>
      <h3 className="type-text-sm-semibold text-foreground group-data-[excluded]/source:text-muted-foreground">
        {title}
      </h3>
      {excerpt && (
        <blockquote className="border-s-2 border-border-strong px-3 py-1 type-text-xs-normal text-muted-foreground">
          {excerpt}
        </blockquote>
      )}
      <footer className="flex items-center gap-2">
        {credibility && (
          <span className="flex items-center gap-1.5 type-text-xs-normal text-foreground group-data-[excluded]/source:text-muted-foreground">
            <span
              className={cn(
                'size-2.5 shrink-0 rounded-full group-data-[excluded]/source:opacity-55',
                CREDIBILITY[credibility].dot,
              )}
            />
            {CREDIBILITY[credibility].label}
          </span>
        )}
        {excluded ? (
          <Badge variant="semantic" tone="destructive" size="xs">
            Excluded
          </Badge>
        ) : (
          usage && (
            <Badge variant="subtle" intent="neutral" size="xs">
              {usage}
            </Badge>
          )
        )}
        <span className="ms-auto flex items-center gap-1">
          {href && (
            <Button asChild variant="ghost" intent="neutral" size="icon-xs">
              <a href={href} target="_blank" rel="noreferrer" aria-label="Open source">
                <Icon icon={ExternalLinkIcon} />
              </a>
            </Button>
          )}
          {excluded
            ? onRestore && (
                <Button
                  variant="ghost"
                  intent="neutral"
                  size="icon-xs"
                  aria-label="Restore source"
                  onClick={onRestore}
                >
                  <Icon icon={RotateCcwIcon} />
                </Button>
              )
            : onExclude && (
                <Button
                  variant="ghost"
                  intent="neutral"
                  size="icon-xs"
                  aria-label="Exclude source"
                  onClick={onExclude}
                >
                  <Icon icon={BanIcon} />
                </Button>
              )}
        </span>
      </footer>
    </article>
  )
}

export { SourceCard, type Credibility }
