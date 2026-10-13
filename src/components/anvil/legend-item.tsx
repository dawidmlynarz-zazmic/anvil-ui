import * as React from 'react'

import { cn } from '@/lib/utils'

// Figma Agent Patterns › Parts · legend item (10855:5814): a swatch and a label for charts, grids and
// maps. Only text and a swatch. `swatch` bar (12×3, radius 2xs) · square (10px, radius 2xs) · dot (10px
// circle) · custom (pass your own node as `children`'s sibling: `custom`, e.g. a seat or a pin);
// `color` is any CSS colour, default the first chart colour (`var(--chart-1)`). The label is text/xs
// --muted-foreground, 6px after the swatch. The swatch is decorative: the label names the series, and
// a chart must not rely on the swatch colour alone (add a pattern, a direct label or a table).

function LegendItem({
  swatch = 'dot',
  color = 'var(--chart-1)',
  custom,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  swatch?: 'bar' | 'square' | 'dot' | 'custom'
  /** The swatch colour: a CSS value such as `var(--chart-2)`. */
  color?: string
  /** The swatch for `swatch="custom"`. */
  custom?: React.ReactNode
}) {
  return (
    <div
      data-slot="legend-item"
      data-swatch={swatch}
      className={cn(
        'flex items-center gap-1.5 type-text-xs-normal whitespace-nowrap text-muted-foreground',
        className,
      )}
      {...props}
    >
      {swatch === 'custom' ? (
        <span aria-hidden className="inline-flex shrink-0">
          {custom}
        </span>
      ) : (
        <span
          aria-hidden
          className={cn(
            'shrink-0',
            swatch === 'bar' && 'h-0.75 w-3 rounded-2xs',
            swatch === 'square' && 'size-2.5 rounded-2xs',
            swatch === 'dot' && 'size-2.5 rounded-full',
          )}
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </div>
  )
}

export { LegendItem }
