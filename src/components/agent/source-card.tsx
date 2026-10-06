import * as React from 'react'

import { cn } from '@/lib/utils'
import type { Confidence } from '@/components/agent/citation-chip'
import { Badge } from '@/components/ui/badge'
import { IconTile } from '@/components/anvil/icon-tile'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BanIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Icon,
  RotateCcwIcon,
  type LucideIcon,
} from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › source card (10713:887): a source with its confidence and usage
// (Figma credibility → `confidence`, the same name and scale as citation chips; audit M9)
// (deep research, ticketing). Card (--card, --border, radius xl, shadow-sm), 16px padding, 12px gap, up to
// --shell-widget-max. Header: 24px --muted icon tile (14px icon), publisher text/xs/medium + meta
// text/xs --muted-foreground, optional tag (outline badge, e.g. "Report"). Title text/sm/semibold.
// Excerpt text/xs --muted-foreground behind a 2px --border-strong bar. Footer: confidence legend
// (10px dot --success · --warning · --danger + text/xs), usage badge (subtle xs), then Open and
// Exclude (or Restore) ghost icon buttons. Figma state excluded = `excluded`: "Excluded" status badge
// and Restore. Figma dims the whole body to 55%; that drops every text below 4.5:1, so code dims
// only the icon tile and dot and turns the text --muted-foreground.

const CONFIDENCE: Record<Confidence, { dot: string; label: string }> = {
  high: { dot: 'bg-success', label: 'High confidence' },
  medium: { dot: 'bg-warning', label: 'Medium confidence' },
  low: { dot: 'bg-danger', label: 'Low confidence' },
}

function SourceCard({
  publisher,
  meta,
  icon = GlobeIcon,
  tag,
  title,
  excerpt,
  confidence,
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
  /** How much to trust the source (same scale as citation confidence). */
  confidence?: Confidence
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
    <Card
      asChild
      className={cn(
        'group/source w-full max-w-(--shell-widget-max) min-w-0 gap-3 rounded-xl border-border bg-card p-4 text-card-foreground shadow-sm wrap-break-word',
        className,
      )}
    >
      <article data-slot="source-card" data-excluded={excluded || undefined} {...props}>
        <header className="flex items-center gap-2">
          <IconTile icon={icon} size="xs" className="group-data-[excluded]/source:opacity-55" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate type-text-xs-medium text-foreground group-data-[excluded]/source:text-muted-foreground">
              {publisher}
            </span>
            {meta && <span className="truncate type-text-xs-normal text-muted-foreground">{meta}</span>}
          </div>
          {tag && (
            <Badge variant="outline" size="sm">
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
          {confidence && (
            <span className="flex items-center gap-1.5 type-text-xs-normal text-foreground group-data-[excluded]/source:text-muted-foreground">
              <span
                className={cn(
                  'size-2.5 shrink-0 rounded-full group-data-[excluded]/source:opacity-55',
                  CONFIDENCE[confidence].dot,
                )}
              />
              {CONFIDENCE[confidence].label}
            </span>
          )}
          {excluded ? (
            <Badge variant="subtle" tone="destructive" size="xs">
              Excluded
            </Badge>
          ) : (
            usage && (
              <Badge variant="subtle" size="xs">
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
    </Card>
  )
}

export { SourceCard }
