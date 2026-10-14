import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Figma Agent Patterns › Catalog & offers · comparison table (10668:15955): two or three options compared
// on the same criteria, the best value per row highlighted. Built on Table (contained, compact, striped),
// Button (sm) and your media; nothing re-drawn. Figma `columns` 2 · 3 → the number of `options`.
// - Header row: the `cornerLabel` (“Compare”, text/xs/medium muted), then one column per option: its
//   `media` (a 48px-wide tile) and `name` (text/sm/medium).
// - Rows (`rows`): the criterion `label` (text/xs muted, a row header) and one value per option (text/sm).
//   `best` is the index of the winning value: --success-strong, medium weight, and “(best)” in hidden text
//   so it is never colour alone. Every other row is tinted (--border-alpha-4) as the Table stripes.
// - Actions row (`chooseLabel`, `onChoose(id)`): one Button per option, brand for `recommended`, outline
//   for the rest.
// - `caption` names the table for assistive tech (hidden).

type ComparisonOption = { id: string; name: React.ReactNode; media?: React.ReactNode }
type ComparisonRow = {
  id: string
  label: React.ReactNode
  values: React.ReactNode[]
  /** Index of the best value in this row. */
  best?: number
}

function ComparisonTable({
  options,
  rows,
  cornerLabel = 'Compare',
  caption,
  chooseLabel,
  onChoose,
  recommended,
  className,
  ...props
}: Omit<React.ComponentProps<'table'>, 'children'> & {
  options: ComparisonOption[]
  rows: ComparisonRow[]
  cornerLabel?: React.ReactNode
  caption?: string
  /** The button label under each option: “Choose”. Leave out for no actions row. */
  chooseLabel?: string
  onChoose?: (id: string) => void
  /** The option whose button is brand (the best match). */
  recommended?: string
}) {
  return (
    <div data-slot="comparison-table" className="w-full max-w-160">
      <Table
        variant="contained"
        density="compact"
        striped
        className={cn('table-fixed', className)}
        {...props}
      >
        {caption && <TableCaption className="sr-only">{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="w-33 type-text-xs-medium text-muted-foreground">
              {cornerLabel}
            </TableHead>
            {options.map((option) => (
              <TableHead
                key={option.id}
                scope="col"
                className="h-auto px-3 py-3 align-top type-text-sm-medium whitespace-normal text-foreground"
              >
                <div className="flex flex-col items-start gap-2">
                  {option.media && (
                    <div className="h-15 w-12 overflow-hidden rounded-sm bg-accent [&>img]:size-full [&>img]:object-cover">
                      {option.media}
                    </div>
                  )}
                  {option.name}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableHead scope="row" className="h-auto px-4 py-2 type-text-xs-normal text-muted-foreground">
                {row.label}
              </TableHead>
              {row.values.map((value, index) => (
                <TableCell
                  key={options[index]?.id ?? index}
                  className={cn(
                    'h-auto px-3 py-2 type-text-sm-normal whitespace-normal',
                    row.best === index && 'type-text-sm-medium text-success-strong dark:text-success-medium',
                  )}
                >
                  {value}
                  {row.best === index && <span className="sr-only"> (best)</span>}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {chooseLabel && (
            <TableRow>
              <TableHead scope="row" className="h-auto px-4 py-3">
                <span className="sr-only">{chooseLabel}</span>
              </TableHead>
              {options.map((option) => (
                <TableCell key={option.id} className="h-auto px-3 py-3 border-t border-overlay-8">
                  <Button
                    size="sm"
                    variant={recommended === option.id ? 'default' : 'outline'}
                    intent={recommended === option.id ? 'brand' : 'neutral'}
                    onClick={() => onChoose?.(option.id)}
                    aria-label={`${chooseLabel}: ${typeof option.name === 'string' ? option.name : option.id}`}
                  >
                    {chooseLabel}
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export { ComparisonTable, type ComparisonOption, type ComparisonRow }
