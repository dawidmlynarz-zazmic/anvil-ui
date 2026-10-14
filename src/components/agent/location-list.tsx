import * as React from 'react'

import { cn } from '@/lib/utils'
import { CatalogState } from '@/components/agent/catalog-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChevronRightIcon,
  Icon,
  KeyRoundIcon,
  LockIcon,
  MapPinIcon,
  NavigationIcon,
  SearchIcon,
} from '@/components/ui/icon'
import { Item } from '@/components/ui/item'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Patterns › Catalog & offers · location item (10668:16076) and location list (10668:16113):
// places with dates, distance and availability (clinics, hotels, stores, venues, pickup points).
// - `LocationItem`: a selectable row (Item `asChild` on a button, `selected` = the Figma selected fill and
//   stroke) holding a 56 × 52 date block (month text/2xs, range text/sm; --muted, --primary when selected),
//   the name (text/sm/medium) and place (text/xs muted), an availability Badge (subtle: `availability`
//   good → success “Good availability” · limited → warning “Limited” · sold-out → destructive “Sold out”,
//   `availabilityLabel` overrides the text), the distance as a Marker (navigation glyph) and a chevron.
//   Figma state: hover --muted · focus focus ring · selected `selected` (aria-pressed) · unavailable = the
//   sold-out availability, muted text.
// - `LocationList`: a Card (radius xl) with a header (`title`, `subtitle`, a “Near me” outline Button) and the
//   rows as `children`. Figma state loaded · loading (four skeleton rows) → `status`, plus empty (search
//   glyph, `emptyTitle`, `emptyActionLabel` → `onEmptyAction`) and permission (a warning lock tile, “Type a
//   city”: location access is off).

type Availability = 'good' | 'limited' | 'sold-out'

const AVAILABILITY = {
  good: { tone: 'success', label: 'Good availability' },
  limited: { tone: 'warning', label: 'Limited' },
  'sold-out': { tone: 'destructive', label: 'Sold out' },
} as const

function LocationItem({
  month,
  dates,
  name,
  place,
  availability = 'good',
  availabilityLabel,
  distance,
  selected,
  className,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children' | 'name'> & {
  /** “OCT”. */
  month?: string
  /** “3–15”. */
  dates?: string
  name: React.ReactNode
  place?: React.ReactNode
  availability?: Availability
  availabilityLabel?: string
  /** “2 mi”. */
  distance?: string
  selected?: boolean
}) {
  const status = AVAILABILITY[availability]
  const soldOut = availability === 'sold-out'
  return (
    <Item
      asChild
      size="xs"
      selected={selected}
      className={cn(
        'w-full flex-nowrap gap-3 rounded-lg p-2 text-left hover:bg-muted data-[selected=true]:hover:bg-info-subtle',
        className,
      )}
    >
      <button data-slot="location-item" type="button" aria-pressed={selected} {...props}>
        {(month || dates) && (
          <span
            className={cn(
              'flex h-13 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted',
              selected && 'bg-primary text-primary-foreground',
            )}
          >
            {month && (
              <span className={cn('type-text-2xs-medium', !selected && 'text-muted-foreground')}>
                {month}
              </span>
            )}
            {dates && (
              <span className={cn('type-text-sm-medium', !selected && 'text-foreground')}>{dates}</span>
            )}
          </span>
        )}
        <span className={cn('flex min-w-0 flex-1 flex-col gap-0.5', soldOut && 'text-muted-foreground')}>
          <span className="truncate type-text-sm-medium">{name}</span>
          {place && <span className="truncate type-text-xs-normal text-muted-foreground">{place}</span>}
        </span>
        <Badge variant="subtle" tone={status.tone} size="sm" className="shrink-0">
          {availabilityLabel ?? status.label}
        </Badge>
        {distance && (
          <Marker variant="inline" className="shrink-0">
            <MarkerIcon>
              <Icon icon={NavigationIcon} />
            </MarkerIcon>
            <MarkerContent>{distance}</MarkerContent>
          </Marker>
        )}
        <Icon icon={ChevronRightIcon} className="shrink-0 text-muted-foreground" />
      </button>
    </Item>
  )
}

type LocationListStatus = 'loaded' | 'loading' | 'empty' | 'permission'

function LocationList({
  title,
  subtitle,
  nearMeLabel = 'Near me',
  onNearMe,
  status = 'loaded',
  emptyTitle = 'No locations near you',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  permissionTitle = 'Location access is off',
  permissionDescription,
  permissionActionLabel = 'Type a city',
  onPermissionAction,
  loadingLabel = 'Loading locations',
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  title: React.ReactNode
  /** “14 locations · Sep 2026 – Mar 2027”. */
  subtitle?: React.ReactNode
  nearMeLabel?: string
  onNearMe?: () => void
  status?: LocationListStatus
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  emptyActionLabel?: string
  onEmptyAction?: () => void
  permissionTitle?: React.ReactNode
  permissionDescription?: React.ReactNode
  permissionActionLabel?: string
  onPermissionAction?: () => void
  loadingLabel?: string
}) {
  const titleId = React.useId()
  return (
    <Card
      asChild
      className={cn(
        'w-full max-w-160 min-w-0 gap-0 rounded-xl border-border bg-background py-0 shadow-sm',
        className,
      )}
    >
      <section data-slot="location-list" data-status={status} aria-labelledby={titleId} {...props}>
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 id={titleId} className="type-text-base-semibold text-foreground">
              {title}
            </h3>
            {subtitle && <p className="type-text-xs-normal text-muted-foreground">{subtitle}</p>}
          </div>
          {onNearMe && (
            <Button variant="outline" intent="neutral" size="sm" onClick={onNearMe} className="shrink-0">
              <Icon icon={MapPinIcon} />
              {nearMeLabel}
            </Button>
          )}
        </header>
        {status === 'loaded' && <div className="flex flex-col gap-1 p-2">{children}</div>}
        {status === 'loading' && (
          <div role="status" aria-label={loadingLabel} aria-busy className="flex flex-col gap-3 p-4">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <Skeleton className="h-13 w-14 shrink-0 rounded-lg" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}
        {status === 'empty' && (
          <CatalogState
            icon={SearchIcon}
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
        {status === 'permission' && (
          <CatalogState
            icon={LockIcon}
            tone="warning"
            title={permissionTitle}
            description={permissionDescription}
            actions={
              <Button variant="outline" intent="neutral" size="sm" onClick={onPermissionAction}>
                <Icon icon={KeyRoundIcon} />
                {permissionActionLabel}
              </Button>
            }
          />
        )}
      </section>
    </Card>
  )
}

export { LocationItem, LocationList, type Availability, type LocationListStatus }
