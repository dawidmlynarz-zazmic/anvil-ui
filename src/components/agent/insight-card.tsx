import * as React from 'react'

import { cn } from '@/lib/utils'
import { CitationChip, type Confidence } from '@/components/agent/citation-chip'
import { ShellFooter } from '@/components/anvil/shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitCompareIcon, Icon, SearchIcon, TriangleAlertIcon, XIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Evidence & decisions · insight card (10714:605): an insight or claim with its
// confidence and the evidence for and against. Built on Citation Chip + Badge + Alert + Button + Shell
// Footer, nothing re-drawn. Figma confidence high · medium · low → `confidence`; state default ·
// conflicting → whether `conflict` is set.
// - A card (--card, border, radius xl, shadow-sm, ≤640px): a small context line (`context`, text/xs muted)
//   with the confidence Badge at the end (subtle, xs, indicator: “High confidence”), the `statement`
//   (text/base), then “Supported by” and, when there are any, “· Contradicted by” followed by Citation
//   Chips (their dot is each source's own confidence).
// - `conflict`: a warning Alert (size xs, role note, inset) saying how the agent weighed disagreeing sources.
// - Footer card: Dig deeper (outline, search, `onDigDeeper`) and Exclude (ghost, `onExclude`), or Compare
//   sources (ghost, `onCompare`) when it is conflicting; the source count (`count`) at the end.

type Evidence = { index: React.ReactNode; confidence?: Confidence; domain?: React.ReactNode }

const TONE = { high: 'success', medium: 'warning', low: 'destructive' } as const
const LABEL = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' } as const

function InsightCard({
  context,
  confidence = 'high',
  statement,
  supports,
  contradicts,
  conflict,
  count,
  onDigDeeper,
  onExclude,
  onCompare,
  className,
  ...props
}: Omit<React.ComponentProps<'article'>, 'children'> & {
  /** Where it comes from: “Insight · context”, “Spending · March”. */
  context: React.ReactNode
  confidence?: Confidence
  statement: React.ReactNode
  supports?: Evidence[]
  contradicts?: Evidence[]
  /** How the agent weighed disagreeing sources; makes the card conflicting. */
  conflict?: React.ReactNode
  /** “3 sources”. */
  count?: React.ReactNode
  onDigDeeper?: () => void
  onExclude?: () => void
  onCompare?: () => void
}) {
  const conflicting = !!conflict
  const chips = (items: Evidence[]) =>
    items.map((e, i) => <CitationChip key={i} index={e.index} confidence={e.confidence} domain={e.domain} />)
  return (
    <article
      data-slot="insight-card"
      data-conflicting={conflicting || undefined}
      className={cn(
        'flex w-full max-w-160 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm wrap-break-word',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="type-text-xs-normal text-muted-foreground">{context}</span>
          <Badge variant="subtle" tone={TONE[confidence]} size="xs" indicator>
            {LABEL[confidence]}
          </Badge>
        </div>
        <p className="type-text-base-normal text-foreground">{statement}</p>
        {(supports?.length || contradicts?.length) && (
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 type-text-xs-normal text-muted-foreground">
            {supports && supports.length > 0 && <>Supported by {chips(supports)}</>}
            {contradicts && contradicts.length > 0 && (
              <>
                <span aria-hidden>·</span> Contradicted by {chips(contradicts)}
              </>
            )}
          </p>
        )}
        {conflict && (
          <Alert role="note" tone="warning" size="xs">
            <Icon icon={TriangleAlertIcon} />
            <AlertDescription>{conflict}</AlertDescription>
          </Alert>
        )}
      </div>
      <ShellFooter variant="card" align="between">
        <div className="flex items-center gap-2">
          <Button variant="outline" intent="neutral" size="sm" onClick={onDigDeeper}>
            <Icon icon={SearchIcon} />
            Dig deeper
          </Button>
          {conflicting ? (
            <Button variant="ghost" intent="neutral" size="sm" onClick={onCompare}>
              <Icon icon={GitCompareIcon} />
              Compare sources
            </Button>
          ) : (
            <Button variant="ghost" intent="neutral" size="sm" onClick={onExclude}>
              <Icon icon={XIcon} />
              Exclude
            </Button>
          )}
        </div>
        {count && <span className="type-text-xs-normal text-muted-foreground">{count}</span>}
      </ShellFooter>
    </article>
  )
}

export { InsightCard, type Evidence }
