import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Confidence } from '@/components/agent/citation-chip'

// Figma's confidence badge inside citation source item and citation hovercard: a Badge (semantic,
// xs) with the score, e.g. "92%". high = success, medium = warning, low = destructive; no
// confidence = an em dash. Maps confidence to tone and adds the screen-reader label.

const TONE: Record<Confidence, 'success' | 'warning' | 'destructive'> = {
  high: 'success',
  medium: 'warning',
  low: 'destructive',
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
    <Badge
      data-slot="citation-confidence"
      data-confidence={confidence}
      variant="semantic"
      tone={TONE[confidence]}
      size="xs"
      className={cn('min-w-4', className)}
      {...props}
    >
      <span className="sr-only">{LABEL[confidence]}: </span>
      {children}
    </Badge>
  )
}

export { CitationConfidence }
