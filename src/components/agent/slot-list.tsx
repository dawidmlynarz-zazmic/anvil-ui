import * as React from 'react'

import { cn } from '@/lib/utils'
import { CatalogState } from '@/components/agent/catalog-state'
import { ChoiceCard } from '@/components/anvil/choice-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CalendarIcon, Icon, MegaphoneIcon, RotateCcwIcon, type LucideIcon } from '@/components/ui/icon'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { RadioGroup } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Patterns › Scheduling · slot list (10668:16284) and time slot (10668:16287): the times on a
// chosen date, with a change-date action (appointments, tours, delivery windows, meetings, events). Built
// on Card, Radio Group + Choice Card (each slot is a radio card), Marker (the note), Button, Skeleton and
// Empty State; nothing re-drawn.
// - Slot (`slots`): `time` (text/base/semibold), `label` (“Evening”, text/xs muted), a trailing `price` (text/sm/
//   semibold) over the availability text (`availability` good → success · limited → warning · sold-out →
//   muted; `availabilityLabel` is the words: “Good availability”, “12 seats left”, “Sold out”) and an
//   optional `badge` (“Captioned”). Figma state: default · hover · selected · disabled · focus = Choice Card
//   (selected is the radio; sold-out slots are disabled, 50%).
// - Header: `title` (the date, text/base/semibold), `subtitle` (“Location · 2 options”) and a ghost
//   “Change date” Button (`onChangeDate`). `note` (a requirement for the day) sits under it as a Marker.
// - `value` / `defaultValue` / `onValueChange` (the slot id). Figma state → `status`: loaded · loading
//   (“Checking times…” and skeleton rows) · empty (“No times left on this day”, an action to the next day) ·
//   error (Try again, Get help; the date choice is kept).

type SlotAvailability = 'good' | 'limited' | 'sold-out'
type Slot = {
  id: string
  time: string
  label?: string
  price?: string
  availability?: SlotAvailability
  availabilityLabel?: string
  badge?: React.ReactNode
}

const AVAILABILITY_TEXT: Record<SlotAvailability, string> = {
  good: 'text-success-strong dark:text-success-medium',
  limited: 'text-warning-strong dark:text-warning-medium',
  'sold-out': 'text-muted-foreground',
}

type SlotListStatus = 'loaded' | 'loading' | 'empty' | 'error'

function SlotList({
  title,
  subtitle,
  changeDateLabel = 'Change date',
  onChangeDate,
  note,
  noteIcon,
  slots,
  value,
  defaultValue,
  onValueChange,
  status = 'loaded',
  emptyTitle = 'No times left on this day',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  errorTitle = 'Couldn’t load times',
  errorDescription,
  onRetry,
  onHelp,
  loadingLabel = 'Checking times',
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title' | 'defaultValue'> & {
  /** The chosen date: “Saturday 17 October”. */
  title: React.ReactNode
  /** “Location · 2 options”. */
  subtitle?: React.ReactNode
  changeDateLabel?: string
  onChangeDate?: () => void
  /** A requirement or policy for the day. */
  note?: React.ReactNode
  noteIcon?: LucideIcon
  slots: Slot[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  status?: SlotListStatus
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
  const titleId = React.useId()
  return (
    <Card
      asChild
      className={cn(
        'w-full max-w-145 min-w-0 gap-3 rounded-xl border-border bg-background px-4 shadow-sm',
        className,
      )}
    >
      <section data-slot="slot-list" data-status={status} aria-labelledby={titleId} {...props}>
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 id={titleId} className="type-text-base-semibold text-foreground">
              {title}
            </h3>
            {subtitle && <p className="type-text-xs-normal text-muted-foreground">{subtitle}</p>}
          </div>
          {onChangeDate && (
            <Button variant="ghost" intent="neutral" size="sm" onClick={onChangeDate} className="shrink-0">
              <Icon icon={CalendarIcon} />
              {changeDateLabel}
            </Button>
          )}
        </header>
        {note && (
          <Marker variant="inline" className="w-full">
            {noteIcon && (
              <MarkerIcon>
                <Icon icon={noteIcon} />
              </MarkerIcon>
            )}
            <MarkerContent>{note}</MarkerContent>
          </Marker>
        )}
        {status === 'loaded' && (
          <RadioGroup
            aria-labelledby={titleId}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            className="gap-2"
          >
            {slots.map((slot) => {
              const availability = slot.availability ?? 'good'
              return (
                <ChoiceCard
                  key={slot.id}
                  value={slot.id}
                  disabled={availability === 'sold-out'}
                  title={<span className="type-text-base-semibold">{slot.time}</span>}
                  detail={slot.label}
                  trailing={
                    <span className="flex items-center gap-2">
                      {slot.badge}
                      <span className="flex flex-col items-end">
                        {slot.price && (
                          <span className="type-text-sm-medium text-foreground">{slot.price}</span>
                        )}
                        {slot.availabilityLabel && (
                          <span className={cn('type-text-xs-normal', AVAILABILITY_TEXT[availability])}>
                            {slot.availabilityLabel}
                          </span>
                        )}
                      </span>
                    </span>
                  }
                />
              )
            })}
          </RadioGroup>
        )}
        {status === 'loading' && (
          <div role="status" aria-label={loadingLabel} aria-busy className="flex flex-col gap-2">
            <span className="type-text-sm-medium text-foreground">{loadingLabel}…</span>
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-3/5" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-3 w-12" />
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

export { SlotList, type Slot, type SlotAvailability, type SlotListStatus }
