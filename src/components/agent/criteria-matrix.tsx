import * as React from 'react'

import { cn } from '@/lib/utils'
import { TaskCard } from '@/components/agent/task-card'
import { Badge } from '@/components/ui/badge'
import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleXIcon,
  Icon,
  TableIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Figma Agent Patterns › Evidence & decisions · criteria matrix (10724:2001): rows × columns marked
// positive, partial, negative or not covered (feature comparison, eligibility, requirement checks,
// evidence). Built on Task Card + Table + Badge, nothing re-drawn. Figma value positive · partial ·
// negative · none → `CriteriaMark` `value`.
// - CriteriaMark: a 14px glyph in a tone — positive (circle-check, --success) · partial (circle-dot,
//   --warning) · negative (circle-x, --destructive) · none (an em dash, muted) — with its meaning as hidden
//   text (“Supports”), so the mark is never only colour or shape.
// - CriteriaMatrix: the card: a table-icon tile, title, subtitle and an outline Badge (`badge`, “2 conflicts”);
//   a Table whose first column is the row label and whose other columns are `columns` (a label, and an
//   optional credibility dot above it: high · medium · low); one CriteriaMark per cell, centred; and a
//   --muted legend row (`legend`: Supports · Partly · Contradicts · Not covered).

type CriteriaValue = 'positive' | 'partial' | 'negative' | 'none'
type Column = { id: string; label: React.ReactNode; credibility?: 'high' | 'medium' | 'low' }
type Row = { id: string; label: React.ReactNode; values: Record<string, CriteriaValue> }

const MARK: Record<CriteriaValue, { icon: LucideIcon | null; className: string; label: string }> = {
  positive: { icon: CircleCheckIcon, className: 'text-success dark:text-success-medium', label: 'Supports' },
  partial: { icon: CircleDotIcon, className: 'text-warning dark:text-warning-medium', label: 'Partly' },
  negative: {
    icon: CircleXIcon,
    className: 'text-destructive dark:text-danger-medium',
    label: 'Contradicts',
  },
  none: { icon: null, className: 'text-muted-foreground', label: 'Not covered' },
}

const DOT = { high: 'bg-success', medium: 'bg-warning', low: 'bg-danger' } as const
const DOT_LABEL = { high: 'high', medium: 'medium', low: 'low' } as const

function CriteriaMark({
  value,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<'span'>, 'children'> & { value: CriteriaValue; label?: string }) {
  const mark = MARK[value]
  return (
    <span
      data-slot="criteria-mark"
      data-value={value}
      className={cn('inline-flex size-3.5 items-center justify-center', mark.className, className)}
      {...props}
    >
      {mark.icon ? <Icon icon={mark.icon} className="size-3.5" /> : <span aria-hidden>—</span>}
      <span className="sr-only">{label ?? mark.label}</span>
    </span>
  )
}

function CriteriaMatrix({
  title,
  subtitle,
  badge,
  rowHeading = 'Claim',
  columns,
  rows,
  legend = ['positive', 'partial', 'negative', 'none'],
  className,
  ...props
}: Omit<React.ComponentProps<typeof TaskCard>, 'icon' | 'badge' | 'footer' | 'children'> & {
  badge?: React.ReactNode
  /** The heading of the first column. */
  rowHeading?: React.ReactNode
  columns: Column[]
  rows: Row[]
  /** Which marks to explain in the legend. */
  legend?: CriteriaValue[]
}) {
  return (
    <TaskCard
      data-slot="criteria-matrix"
      icon={TableIcon}
      title={title}
      subtitle={subtitle}
      badge={
        badge && (
          <Badge variant="outline" tone="neutral" size="xs">
            {badge}
          </Badge>
        )
      }
      className={cn(className)}
      {...props}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-auto py-3 type-text-xs-normal text-muted-foreground">
                {rowHeading}
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.id} className="h-auto py-3 text-center">
                  <span className="flex flex-col items-center gap-1">
                    {column.credibility && (
                      <span aria-hidden className={cn('size-1 rounded-full', DOT[column.credibility])} />
                    )}
                    <span className="type-text-xs-medium text-foreground">
                      {column.label}
                      {column.credibility && (
                        <span className="sr-only"> ({DOT_LABEL[column.credibility]} credibility)</span>
                      )}
                    </span>
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="h-auto py-3 whitespace-normal type-text-xs-normal text-foreground">
                  {row.label}
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.id} className="h-auto py-3 text-center">
                    <CriteriaMark value={row.values[column.id] ?? 'none'} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul aria-label="Legend" className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-muted px-4 py-2.5">
        {legend.map((value) => (
          <li key={value} className="flex items-center gap-1.5 type-text-xs-normal text-muted-foreground">
            <CriteriaMark value={value} label="" />
            {MARK[value].label}
          </li>
        ))}
      </ul>
    </TaskCard>
  )
}

export { CriteriaMatrix, CriteriaMark, type CriteriaValue, type Column, type Row }
