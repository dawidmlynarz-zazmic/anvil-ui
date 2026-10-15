import * as React from 'react'

import { cn } from '@/lib/utils'
import { ShellDescription, ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Stepper } from '@/components/anvil/stepper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, useLocale } from '@/lib/locale'

// Figma Agent Patterns › Scheduling · quantity selector (10668:16339): types with steppers and a running
// total (tickets, guests and rooms, party size, cart quantities). Built on Card, Shell Header / Footer (card
// variants), Stepper and Button; nothing re-drawn.
// - Header: `title` (“How many tickets?”) and `subtitle` (“Item · date · time”).
// - Rows (`types`): the `label` (text/sm/medium) and `detail` (text/xs muted, “16+”), the unit `price`
//   (text/sm, formatted with `currency`) and a Stepper (min 0, up to the room left under `maxTotal`).
//   Rows are divided by a 1px --border line.
// - Footer (--muted card footer): the running summary (“2 tickets · $90.00”, text/sm/semibold; “Select
//   tickets” when none), the `note` (“Max 8 per order · fees shown at checkout”) and the primary action
//   (`actionLabel`, `onAction(values)`), disabled until something is chosen.
// - `values` / `defaultValues` / `onValuesChange`: counts by type id, controlled or not.

type QuantityType = { id: string; label: string; detail?: string; price: number }
type QuantityValues = Record<string, number>

function QuantitySelector({
  title,
  subtitle,
  types,
  values,
  defaultValues,
  onValuesChange,
  maxTotal,
  unit = 'ticket',
  currency = 'USD',
  locale: localeProp,
  note,
  actionLabel,
  onAction,
  emptySummary,
  summary,
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  title: React.ReactNode
  subtitle?: React.ReactNode
  types: QuantityType[]
  values?: QuantityValues
  defaultValues?: QuantityValues
  onValuesChange?: (values: QuantityValues) => void
  /** The most the user can pick across all types. */
  maxTotal?: number
  /** The thing counted, singular: “ticket”, “guest”. */
  unit?: string
  currency?: string
  /** Formats the prices; defaults to the page locale (`LocaleProvider` or the document's `lang`). */
  locale?: string
  note?: React.ReactNode
  actionLabel?: string
  onAction?: (values: QuantityValues) => void
  /** The summary when nothing is chosen. */
  emptySummary?: string
  /** Writes the running summary for your language (plurals differ): `(count, formattedTotal) => string`. */
  summary?: (count: number, total: string) => string
}) {
  const [inner, setInner] = React.useState<QuantityValues>(defaultValues ?? {})
  const current = values ?? inner
  const count = types.reduce((sum, type) => sum + (current[type.id] ?? 0), 0)
  const total = types.reduce((sum, type) => sum + (current[type.id] ?? 0) * type.price, 0)
  const page = useLocale()
  const money = (amount: number) => formatCurrency(localeProp ?? page.locale, amount, currency)
  const set = (id: string, next: number) => {
    const updated = { ...current, [id]: next }
    if (values === undefined) setInner(updated)
    onValuesChange?.(updated)
  }
  const titleId = React.useId()
  return (
    <Card
      asChild
      className={cn(
        'w-full max-w-145 min-w-0 gap-0 overflow-hidden rounded-xl border-border bg-background py-0 shadow-sm',
        className,
      )}
    >
      <section data-slot="quantity-selector" aria-labelledby={titleId} {...props}>
        <ShellHeader variant="card">
          <ShellTitle id={titleId}>{title}</ShellTitle>
          {subtitle && <ShellDescription>{subtitle}</ShellDescription>}
        </ShellHeader>
        <ul className="flex flex-col">
          {types.map((type) => {
            const mine = current[type.id] ?? 0
            const room = maxTotal === undefined ? Infinity : maxTotal - (count - mine)
            return (
              <li key={type.id} className="flex items-center gap-3 border-t border-border px-4 py-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="type-text-sm-medium text-foreground">{type.label}</span>
                  {type.detail && (
                    <span className="type-text-xs-normal text-muted-foreground">{type.detail}</span>
                  )}
                </div>
                <span className="type-text-sm-normal whitespace-nowrap text-muted-foreground">
                  {money(type.price)}
                </span>
                <Stepper
                  label={type.label}
                  value={mine}
                  max={room}
                  onValueChange={(next) => set(type.id, next)}
                />
              </li>
            )
          })}
        </ul>
        <ShellFooter
          variant="card"
          note={
            <>
              <span role="status" className="block type-text-sm-semibold text-foreground">
                {count === 0
                  ? (emptySummary ?? `Select ${unit}s`)
                  : (summary?.(count, money(total)) ??
                    `${count} ${count === 1 ? unit : `${unit}s`} · ${money(total)}`)}
              </span>
              {note}
            </>
          }
        >
          {actionLabel && (
            <Button intent="brand" size="sm" disabled={count === 0} onClick={() => onAction?.(current)}>
              {actionLabel}
            </Button>
          )}
        </ShellFooter>
      </section>
    </Card>
  )
}

export { QuantitySelector, type QuantityType, type QuantityValues }
