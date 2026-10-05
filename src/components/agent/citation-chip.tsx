import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma Agent Builder › Core Kit › citation chip (10663:2525): an inline source marker in an answer.
// --muted pill (radius md, 4/2px padding, 4px gap): optional 12px favicon, index text/2xs/medium
// agent, optional domain text/2xs/medium, 6px confidence dot (high --success · medium --warning ·
// low --danger; none = no dot). Figma state hover → --agent-subtle; selected → `active`
// (data-active) or an open hover card / popover (data-state=open): --agent-subtle with an
// --agent-muted ring. Figma display index · domain = pass `domain` or not. The domain uses
// --muted-foreground (Figma --foreground-subtle is under 4.5:1 on --muted); the index uses
// --agent-medium in dark. It is a button: it opens the source (hover card, drawer).

type Confidence = 'high' | 'medium' | 'low'

const CONFIDENCE: Record<Confidence, { className: string; label: string }> = {
  high: { className: 'bg-success', label: 'High confidence' },
  medium: { className: 'bg-warning', label: 'Medium confidence' },
  low: { className: 'bg-danger', label: 'Low confidence' },
}

function CitationChip({
  index,
  domain,
  favicon,
  confidence,
  active = false,
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & {
  /** The source's number in the answer. */
  index: React.ReactNode
  /** Shown after the index (Figma display domain). */
  domain?: React.ReactNode
  /** A 12px icon or image before the index. */
  favicon?: React.ReactNode
  confidence?: Confidence
  /** Figma state selected: the source shown in the drawer or hover card. */
  active?: boolean
}) {
  return (
    <button
      data-slot="citation-chip"
      data-active={active || undefined}
      type="button"
      className={cn(
        'inline-flex h-4.5 w-fit shrink-0 items-center gap-1 rounded-md bg-muted px-1 align-middle whitespace-nowrap outline-none',
        'transition-colors duration-(--duration-fast) hover:bg-agent-subtle focus-visible:focus-ring',
        'data-[active=true]:bg-agent-subtle data-[active=true]:inset-ring data-[active=true]:inset-ring-agent-muted',
        'data-[state=open]:bg-agent-subtle data-[state=open]:inset-ring data-[state=open]:inset-ring-agent-muted',
        "[&_img]:size-3 [&_img]:rounded-2xs [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    >
      {favicon}
      <span className="type-text-2xs-medium text-agent dark:text-agent-medium">
        <span className="sr-only">Source </span>
        {index}
      </span>
      {domain && <span className="type-text-2xs-medium text-muted-foreground">{domain}</span>}
      {confidence && (
        <span className={cn('size-1.5 shrink-0 rounded-full', CONFIDENCE[confidence].className)}>
          <span className="sr-only">{CONFIDENCE[confidence].label}</span>
        </span>
      )}
      {children}
    </button>
  )
}

export { CitationChip, type Confidence }
