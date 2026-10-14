import * as React from 'react'
import { format } from 'date-fns'
import { type DayButton } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { CatalogState } from '@/components/agent/catalog-state'
import { LegendItem } from '@/components/anvil/legend-item'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { ChevronLeftIcon, ChevronRightIcon, Icon, MegaphoneIcon, RotateCcwIcon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Patterns › Scheduling · date picker (10668:16157) and availability day (10668:16160): a month
// with per-day availability and from-price (appointments, stays, flights, delivery dates, events). Per the
// Figma note this is the shadcn Calendar (react-day-picker) with a custom DayButton, not a second date
// picker. Built on Card, Calendar, Button, Legend Item, Skeleton and Empty State.
// - `availability` maps `yyyy-MM-dd` to `{ level, price }`; `level` available · limited · unavailable. A day
//   with no entry (past days, outside the month) is Figma availability = none: only its number, in
//   --muted-foreground (Figma draws --foreground-disabled, 3.4:1), not selectable.
// - The day (`AvailabilityDayButton`): 56px tall, radius lg; available / limited = a --muted tile with the day
//   (text/sm/medium), the price (text/2xs/medium muted) and a 16 × 3 bar (--success · --warning);
//   unavailable = the day, “Sold out” and a --input bar on no tile; selected = --primary fill with white
//   text and bar; today = a 1.5px --info stroke; hover --border-strong; focus = focus ring.
// - Header: the month as the title, `subtitle` (“Item · location”) under it, Previous / Next month (outline
//   icon-sm; `month` / `onMonthChange` control the month). Footer legend: Good availability · Limited · Sold
//   out and `legendNote` (“Prices from, per ticket”).
// - Figma state → `status`: loaded · loading (“Checking dates…” and skeleton rows) · empty (“No dates
//   available this month” + an action) · error (Try again, Get help; the selection is kept).

type DayAvailability = { level: 'available' | 'limited' | 'unavailable'; price?: string }
type AvailabilityMap = Record<string, DayAvailability>

const AvailabilityContext = React.createContext<{ map: AvailabilityMap; soldOutLabel: string }>({
  map: {},
  soldOutLabel: 'Sold out',
})

const BAR = {
  available: 'bg-success',
  limited: 'bg-warning',
  unavailable: 'bg-input',
} as const

function AvailabilityDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const { map, soldOutLabel } = React.useContext(AvailabilityContext)
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  const entry = modifiers.outside ? undefined : map[format(day.date, 'yyyy-MM-dd')]
  const selected = Boolean(modifiers.selected)
  const tile = entry && entry.level !== 'unavailable'
  return (
    <Button
      ref={ref}
      {...props}
      variant="ghost"
      intent="neutral"
      data-slot="availability-day"
      data-level={entry?.level ?? 'none'}
      data-selected={selected || undefined}
      data-today={modifiers.today || undefined}
      aria-label={
        entry
          ? `${format(day.date, 'EEEE d MMMM')}, ${entry.level === 'unavailable' ? soldOutLabel : [entry.level, entry.price].filter(Boolean).join(', ')}`
          : undefined
      }
      className={cn(
        'h-14 w-full min-w-0 flex-col gap-0.5 rounded-lg px-0 transition-colors duration-(--duration-fast) ease-out',
        tile && 'bg-muted hover:border-border-strong',
        'border border-transparent hover:bg-muted',
        modifiers.today && 'border-info',
        'data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary',
        // Figma draws these in --foreground-disabled (3.4:1); --muted-foreground keeps AA.
        !entry && 'text-muted-foreground hover:bg-transparent disabled:opacity-100',
        className,
      )}
    >
      <span
        className={cn(
          'type-text-sm-medium',
          entry?.level === 'unavailable' && !selected && 'text-muted-foreground',
        )}
      >
        {day.date.getDate()}
      </span>
      {entry?.level === 'unavailable' ? (
        <span
          className={cn(
            'type-text-2xs-medium',
            selected ? 'text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {soldOutLabel}
        </span>
      ) : (
        entry?.price && (
          <span
            className={cn(
              'type-text-2xs-medium',
              selected ? 'text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {entry.price}
          </span>
        )
      )}
      {entry && (
        <span
          aria-hidden
          className={cn('h-0.75 w-4 rounded-2xs', selected ? 'bg-primary-foreground' : BAR[entry.level])}
        />
      )}
    </Button>
  )
}

type AvailabilityCalendarStatus = 'loaded' | 'loading' | 'empty' | 'error'

function AvailabilityCalendar({
  month,
  defaultMonth,
  onMonthChange,
  selected,
  onSelect,
  today,
  availability,
  title,
  subtitle,
  status = 'loaded',
  legend = true,
  legendNote,
  goodLabel = 'Good availability',
  limitedLabel = 'Limited',
  soldOutLabel = 'Sold out',
  emptyTitle = 'No dates available this month',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  errorTitle = 'Couldn’t load dates',
  errorDescription,
  onRetry,
  onHelp,
  loadingLabel = 'Checking dates',
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title' | 'onSelect'> & {
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  /** Overrides “today” (the Figma today state; tests and demos). */
  today?: Date
  availability: AvailabilityMap
  /** Overrides the month title (“October 2026”). */
  title?: React.ReactNode
  /** “Item · location”. */
  subtitle?: React.ReactNode
  status?: AvailabilityCalendarStatus
  legend?: boolean
  /** “Prices from, per ticket”. */
  legendNote?: React.ReactNode
  goodLabel?: string
  limitedLabel?: string
  soldOutLabel?: string
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  emptyActionLabel?: string
  onEmptyAction?: () => void
  errorTitle?: React.ReactNode
  errorDescription?: React.ReactNode
  onRetry?: () => void
  onHelp?: () => void
  loadingLabel?: string
}) {
  const [inner, setInner] = React.useState(defaultMonth ?? new Date())
  const shown = month ?? inner
  const move = (by: number) => {
    const next = new Date(shown.getFullYear(), shown.getMonth() + by, 1)
    if (month === undefined) setInner(next)
    onMonthChange?.(next)
  }
  const titleId = React.useId()
  const context = React.useMemo(() => ({ map: availability, soldOutLabel }), [availability, soldOutLabel])
  return (
    <Card
      asChild
      className={cn(
        'w-full max-w-145 min-w-0 gap-3 rounded-xl border-border bg-background px-4 shadow-sm',
        className,
      )}
    >
      <section data-slot="availability-calendar" data-status={status} aria-labelledby={titleId} {...props}>
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 id={titleId} className="type-text-base-semibold text-foreground">
              {title ?? format(shown, 'LLLL yyyy')}
            </h3>
            {subtitle && <p className="type-text-xs-normal text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              intent="neutral"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => move(-1)}
            >
              <Icon icon={ChevronLeftIcon} />
            </Button>
            <Button
              variant="outline"
              intent="neutral"
              size="icon-sm"
              aria-label="Next month"
              onClick={() => move(1)}
            >
              <Icon icon={ChevronRightIcon} />
            </Button>
          </div>
        </header>
        {legend && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <LegendItem swatch="bar" color="var(--success)">
              {goodLabel}
            </LegendItem>
            <LegendItem swatch="bar" color="var(--warning)">
              {limitedLabel}
            </LegendItem>
            <LegendItem swatch="bar" color="var(--input)">
              {soldOutLabel}
            </LegendItem>
            {legendNote && <span className="type-text-xs-normal text-muted-foreground">{legendNote}</span>}
          </div>
        )}
        {status === 'loaded' && (
          <AvailabilityContext.Provider value={context}>
            <Calendar
              mode="single"
              month={shown}
              onMonthChange={(next) => {
                if (month === undefined) setInner(next)
                onMonthChange?.(next)
              }}
              selected={selected}
              onSelect={onSelect}
              today={today}
              weekStartsOn={1}
              hideNavigation
              className="w-full border-0 bg-transparent p-0"
              classNames={{
                root: 'w-full',
                month_caption: 'hidden',
                week: 'mt-1 flex w-full gap-1',
                weekdays: 'flex gap-1',
                day: 'group/day relative h-full w-full flex-1 p-0 text-center select-none',
                weekday: 'flex-1 pb-1 text-center type-text-xs-medium text-muted-foreground select-none',
              }}
              components={{ DayButton: AvailabilityDayButton }}
              disabled={(date) => !availability[format(date, 'yyyy-MM-dd')]}
            />
          </AvailabilityContext.Provider>
        )}
        {status === 'loading' && (
          <div role="status" aria-label={loadingLabel} aria-busy className="flex flex-col gap-2 py-2">
            <span className="type-text-sm-medium text-foreground">{loadingLabel}…</span>
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex gap-3">
                {[0, 1, 2, 3].map((cell) => (
                  <Skeleton key={cell} className="h-2 flex-1" />
                ))}
              </div>
            ))}
          </div>
        )}
        {status === 'empty' && (
          <CatalogState
            icon={MegaphoneIcon}
            title={emptyTitle}
            description={emptyDescription}
            actions={
              emptyActionLabel && (
                <Button size="sm" onClick={onEmptyAction}>
                  {emptyActionLabel}
                </Button>
              )
            }
          />
        )}
        {status === 'error' && (
          <CatalogState
            icon={RotateCcwIcon}
            tone="destructive"
            title={errorTitle}
            description={errorDescription}
            actions={
              <>
                <Button variant="outline" intent="neutral" size="sm" onClick={onRetry}>
                  <Icon icon={RotateCcwIcon} />
                  Try again
                </Button>
                {onHelp && (
                  <Button variant="ghost" intent="neutral" size="sm" onClick={onHelp}>
                    Get help
                  </Button>
                )}
              </>
            }
          />
        )}
      </section>
    </Card>
  )
}

export { AvailabilityCalendar, AvailabilityDayButton, type AvailabilityMap, type DayAvailability }
