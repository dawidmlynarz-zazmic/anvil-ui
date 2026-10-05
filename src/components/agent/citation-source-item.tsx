import * as React from 'react'

import { cn } from '@/lib/utils'
import type { Confidence } from '@/components/agent/citation-chip'
import { CitationConfidence } from '@/components/agent/citation-confidence'

// Figma Agent Builder › Core Kit › citation source item (10667:14149): one source in the citation
// drawer list. Row (16/12px padding, 12px gap): 20px --background index circle (text/xs/medium agent),
// title text/sm/medium, meta (domain text/xs + path code/xs, --muted-foreground, 8px apart),
// optional snippet text/xs --muted-foreground, confidence badge (or a dash). Figma state hover →
// --muted; selected → `active`: --agent-subtle with a 2px --agent bar at the start; focus → focus
// ring. A link when `href` is set, otherwise a button (e.g. selects the source in the drawer).

function CitationSourceItem({
  index,
  title,
  domain,
  path,
  snippet,
  confidence,
  score,
  active = false,
  href,
  className,
  ...props
}: Omit<React.ComponentProps<'a'> & React.ComponentProps<'button'>, 'title'> & {
  index: React.ReactNode
  title: React.ReactNode
  domain?: React.ReactNode
  /** The URL path after the domain (Figma url preview). */
  path?: React.ReactNode
  /** Figma show snippet: pass it or not. */
  snippet?: React.ReactNode
  confidence?: Confidence
  /** The confidence score shown in the badge, e.g. "92%". */
  score?: React.ReactNode
  /** Figma state selected: the source in view. */
  active?: boolean
  href?: string
}) {
  const body = (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background type-text-xs-medium text-agent dark:text-agent-medium">
        <span className="sr-only">Source </span>
        {index}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 type-text-sm-medium text-foreground">{title}</span>
        {(domain || path) && (
          <span className="flex min-w-0 items-center gap-2 whitespace-nowrap text-muted-foreground">
            {domain && (
              <span className="min-w-0 shrink-0 truncate type-text-xs-normal max-w-1/2">{domain}</span>
            )}
            {path && <span className="min-w-0 truncate type-code-xs">{path}</span>}
          </span>
        )}
        {snippet && <span className="line-clamp-2 type-text-xs-normal text-muted-foreground">{snippet}</span>}
      </span>
      <CitationConfidence confidence={confidence}>{score}</CitationConfidence>
    </>
  )
  const classes = cn(
    'flex w-full max-w-(--shell-widget-max) items-start gap-3 border-s-2 border-transparent px-4 py-3 text-left wrap-break-word outline-none',
    'transition-colors duration-(--duration-fast) hover:bg-muted focus-visible:focus-ring',
    'data-[active=true]:border-agent data-[active=true]:bg-agent-subtle',
    className,
  )
  const shared = {
    'data-slot': 'citation-source-item',
    'data-active': active || undefined,
    className: classes,
  }
  return href ? (
    <a href={href} aria-current={active || undefined} {...shared} {...(props as React.ComponentProps<'a'>)}>
      {body}
    </a>
  ) : (
    <button type="button" aria-pressed={active} {...shared} {...(props as React.ComponentProps<'button'>)}>
      {body}
    </button>
  )
}

export { CitationSourceItem }
