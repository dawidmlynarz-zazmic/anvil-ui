import * as React from 'react'

import { cn } from '@/lib/utils'
import type { Confidence } from '@/components/agent/citation-chip'

// Figma's confidence badge inside citation source item and citation hovercard: a status badge
// (semantic) with the score, e.g. "92%": --{tone}-subtle surface, --{tone}-medium text/2xs/medium,
// radius sm, 4/2px padding, 16px min width. high = success, medium = warning, low = danger; no
// confidence = an em dash. Replace with the Anvil Status Badge once it is built (roadmap 4b).

const TONE: Record<Confidence, string> = {
  high: 'bg-success-subtle text-success-medium',
  medium: 'bg-warning-subtle text-warning-medium',
  low: 'bg-danger-subtle text-danger-medium',
}

const LABEL: Record<Confidence, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
}

function CitationConfidence({
  confidence,
  className,
  children,
  ...props
}: React.ComponentProps<'span'> & { confidence?: Confidence }) {
  if (!confidence) {
    return (
      <span
        data-slot="citation-confidence"
        className={cn('type-text-xs-medium text-muted-foreground', className)}
        {...props}
      >
        <span aria-hidden>—</span>
        <span className="sr-only">No confidence score</span>
      </span>
    )
  }
  return (
    <span
      data-slot="citation-confidence"
      data-confidence={confidence}
      className={cn(
        'inline-flex min-w-4 shrink-0 items-center justify-center rounded-sm px-1 py-0.5 type-text-2xs-medium',
        TONE[confidence],
        className,
      )}
      {...props}
    >
      <span className="sr-only">{LABEL[confidence]}: </span>
      {children}
    </span>
  )
}

export { CitationConfidence }
