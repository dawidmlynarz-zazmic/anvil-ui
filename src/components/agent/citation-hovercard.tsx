import * as React from 'react'

import { cn } from '@/lib/utils'
import type { Confidence } from '@/components/agent/citation-chip'
import { CitationConfidence } from '@/components/agent/citation-confidence'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { GlobeIcon, Icon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › citation hovercard (10663:2649), built on Hover Card: a source
// preview when a citation chip is hovered or focused. 320px, --background, --input stroke, radius
// xl, 12px padding, 8px gap, elevation/raised (Figma still on shadow/lg). Header: 12px favicon
// (globe by default) + domain text/xs --muted-foreground, confidence badge at the end; title
// text/sm/semibold; URL text/xs on one line; snippet text/xs --muted-foreground. Figma's URL is
// --foreground-disabled (under 4.5:1); code uses --muted-foreground.

function CitationHoverCard(props: React.ComponentProps<typeof HoverCard>) {
  return <HoverCard data-slot="citation-hovercard" openDelay={300} closeDelay={150} {...props} />
}

/** Wraps the CitationChip (asChild). */
function CitationHoverCardTrigger(props: React.ComponentProps<typeof HoverCardTrigger>) {
  return <HoverCardTrigger asChild data-slot="citation-hovercard-trigger" {...props} />
}

function CitationHoverCardContent({
  domain,
  favicon,
  title,
  url,
  snippet,
  confidence,
  score,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardContent>, 'title'> & {
  domain?: React.ReactNode
  /** 12px icon or image before the domain; a globe by default. */
  favicon?: React.ReactNode
  title: React.ReactNode
  url?: React.ReactNode
  snippet?: React.ReactNode
  confidence?: Confidence
  /** Score shown in the confidence badge, e.g. "92%". */
  score?: React.ReactNode
}) {
  return (
    <HoverCardContent
      data-slot="citation-hovercard-content"
      className={cn('flex flex-col gap-2 rounded-xl border-input p-3', className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-1 text-muted-foreground [&_img]:size-3 [&_svg:not([class*='size-'])]:size-3">
        {favicon ?? <Icon icon={GlobeIcon} />}
        {domain && <span className="truncate type-text-xs-normal">{domain}</span>}
        {(confidence || score) && (
          <CitationConfidence confidence={confidence} className="ms-auto">
            {score}
          </CitationConfidence>
        )}
      </div>
      <p className="type-text-sm-semibold text-foreground">{title}</p>
      {url && <p className="truncate type-text-xs-normal text-muted-foreground">{url}</p>}
      {snippet && <p className="line-clamp-3 type-text-xs-normal text-muted-foreground">{snippet}</p>}
      {children}
    </HoverCardContent>
  )
}

export { CitationHoverCard, CitationHoverCardTrigger, CitationHoverCardContent }
