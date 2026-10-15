import * as React from 'react'

import { cn } from '@/lib/utils'
import { CatalogState } from '@/components/agent/catalog-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Icon,
  ListIcon,
  LocateFixedIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  WifiOffIcon,
} from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Patterns › Catalog & offers · map view (10773:3060) and map pin (10773:2951): places on a
// map: pins with a price or name, a selected pin with a preview card, clusters and an optional route. Pair
// with Location List and Offer Card.
// Anvil does not ship a map. `MapView` is the frame around yours: pass the map surface as `children` (a
// Mapbox, Google or Leaflet canvas); without children it draws a static schematic placeholder (streets,
// a park and water on --muted, aria-hidden), which is what Storybook shows.
// - `pins` (`MapPinData`: `x` / `y` as a percentage of the frame, `label`, `kind` price · cluster · stop)
//   render as buttons: price = a --background pill with a caret (--primary and white when selected), cluster
//   = a dark count, stop = a numbered round pin on a route. `selected` and `onSelectPin(id)`.
// - `route`: points (percentages) drawn as a 3px --primary line under the pins.
// - Controls: zoom in / out and “my location” (outline icon-sm Buttons, 8px apart, top right).
// - `preview`: the selected place as a Card (thumbnail, title, details, price and a button), bottom left.
// - Figma state → `status`: loaded · loading (“Loading map…” card with skeleton lines) · empty (“Nothing to
//   show on the map” + Show as list) · offline (“Map unavailable offline” + Show as list).

type MapPinData = {
  id: string
  /** Percent from the left edge of the frame. */
  x: number
  /** Percent from the top edge of the frame (the pin's tip). */
  y: number
  label: string
  kind?: 'price' | 'cluster' | 'stop'
}

type MapPreview = {
  media?: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
  price?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

function MapPin({
  pin,
  selected,
  onSelect,
}: {
  pin: MapPinData
  selected?: boolean
  onSelect?: (id: string) => void
}) {
  const kind = pin.kind ?? 'price'
  return (
    <button
      type="button"
      data-slot="map-pin"
      data-kind={kind}
      aria-pressed={selected}
      aria-label={kind === 'cluster' ? `${pin.label} places` : pin.label}
      onClick={() => onSelect?.(pin.id)}
      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
      className={cn(
        'absolute z-10 -translate-x-1/2 -translate-y-full outline-none focus-visible:focus-ring',
        kind === 'cluster' ? 'translate-y-[-50%]' : '',
        selected && 'z-20',
      )}
    >
      {kind === 'price' && (
        <span className="relative flex flex-col items-center">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 type-text-xs-semibold shadow-sm inset-ring',
              selected
                ? 'bg-primary text-primary-foreground inset-ring-primary'
                : 'bg-background text-foreground inset-ring-border-strong',
            )}
          >
            {pin.label}
          </span>
          <span
            aria-hidden
            className={cn(
              '-mt-1 size-2 rotate-45 inset-ring',
              selected ? 'bg-primary inset-ring-primary' : 'bg-background inset-ring-border-strong',
            )}
          />
        </span>
      )}
      {kind === 'cluster' && (
        <span className="grid min-w-7 place-items-center rounded-full bg-background-inverse px-2 py-1 type-text-xs-semibold text-foreground-inverse">
          {pin.label}
        </span>
      )}
      {kind === 'stop' && (
        <span
          className={cn(
            'grid size-7 place-items-center rounded-full shadow-sm inset-ring',
            selected
              ? 'bg-primary text-primary-foreground inset-ring-primary'
              : 'bg-background text-foreground inset-ring-border-strong',
          )}
        >
          <Icon icon={MapPinIcon} />
        </span>
      )}
    </button>
  )
}

type MapViewStatus = 'loaded' | 'loading' | 'empty' | 'offline'

function MapView({
  children,
  pins = [],
  selected,
  onSelectPin,
  route,
  preview,
  status = 'loaded',
  onZoomIn,
  onZoomOut,
  onLocate,
  onShowList,
  listLabel = 'Show as list',
  emptyTitle = 'Nothing to show on the map',
  emptyDescription,
  offlineTitle = 'Map unavailable offline',
  offlineDescription,
  loadingLabel = 'Loading map',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  pins?: MapPinData[]
  selected?: string
  onSelectPin?: (id: string) => void
  route?: { x: number; y: number }[]
  preview?: MapPreview
  status?: MapViewStatus
  onZoomIn?: () => void
  onZoomOut?: () => void
  onLocate?: () => void
  onShowList?: () => void
  listLabel?: string
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  offlineTitle?: React.ReactNode
  offlineDescription?: React.ReactNode
  loadingLabel?: string
}) {
  const loaded = status === 'loaded'
  return (
    <div
      data-slot="map-view"
      data-status={status}
      className={cn(
        'relative aspect-4/3 w-full max-w-145 overflow-hidden rounded-xl border border-border bg-muted',
        className,
      )}
      {...props}
    >
      {children ?? (
        <div
          aria-hidden
          className="absolute inset-0 [background-image:linear-gradient(var(--background)_3px,transparent_3px),linear-gradient(90deg,var(--background)_3px,transparent_3px)] [background-position:20px_30px] [background-size:100px_100px]"
        >
          <div className="absolute top-[18%] end-[8%] h-[26%] w-[20%] rounded-lg bg-success-subtle" />
          <div className="absolute bottom-[-12%] start-[-6%] h-[34%] w-[40%] rounded-[50%] bg-info-subtle" />
        </div>
      )}
      {loaded && route && route.length > 1 && (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <polyline
            points={route.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      {loaded &&
        pins.map((pin) => (
          <MapPin key={pin.id} pin={pin} selected={selected === pin.id} onSelect={onSelectPin} />
        ))}
      {loaded && (onZoomIn || onZoomOut || onLocate) && (
        <div className="absolute top-3 end-3 z-30 flex flex-col gap-2">
          {onZoomIn && (
            <Button variant="outline" intent="neutral" size="icon-sm" aria-label="Zoom in" onClick={onZoomIn}>
              <Icon icon={PlusIcon} />
            </Button>
          )}
          {onZoomOut && (
            <Button
              variant="outline"
              intent="neutral"
              size="icon-sm"
              aria-label="Zoom out"
              onClick={onZoomOut}
            >
              <Icon icon={MinusIcon} />
            </Button>
          )}
          {onLocate && (
            <Button
              variant="outline"
              intent="neutral"
              size="icon-sm"
              aria-label="Show my location"
              onClick={onLocate}
            >
              <Icon icon={LocateFixedIcon} />
            </Button>
          )}
        </div>
      )}
      {loaded && preview && (
        <Card
          size="sm"
          className="absolute bottom-3 start-3 z-30 min-w-0 w-[min(22rem,calc(100%-1.5rem))] flex-row items-center gap-3 rounded-lg border-border bg-background p-2 shadow-elevation-raised"
        >
          <div className="size-14 shrink-0 overflow-hidden rounded-md bg-accent [&>img]:size-full [&>img]:object-cover">
            {preview.media}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="type-text-sm-semibold text-foreground">{preview.title}</p>
            {preview.meta && <p className="type-text-xs-normal text-muted-foreground">{preview.meta}</p>}
            {preview.price && <p className="type-text-xs-semibold text-foreground">{preview.price}</p>}
          </div>
          {preview.actionLabel && (
            <Button variant="outline" intent="neutral" size="xs" onClick={preview.onAction}>
              {preview.actionLabel}
            </Button>
          )}
        </Card>
      )}
      {status === 'loading' && (
        <Card
          role="status"
          aria-label={loadingLabel}
          aria-busy
          size="sm"
          className="absolute top-1/2 left-1/2 w-[min(16rem,calc(100%-2rem))] min-w-0 -translate-x-1/2 -translate-y-1/2 gap-2 rounded-lg border-border bg-background p-3 shadow-elevation-raised"
        >
          <span className="type-text-xs-normal text-muted-foreground">{loadingLabel}…</span>
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </Card>
      )}
      {status === 'empty' && (
        <CatalogState
          className="absolute inset-0 justify-center"
          icon={SearchIcon}
          title={emptyTitle}
          description={emptyDescription}
          actions={
            <Button size="sm" onClick={onShowList}>
              {listLabel}
            </Button>
          }
        />
      )}
      {status === 'offline' && (
        <Card
          size="sm"
          className="absolute top-1/2 left-1/2 w-[min(22rem,calc(100%-2rem))] min-w-0 -translate-x-1/2 -translate-y-1/2 rounded-lg border-border bg-background p-0 shadow-elevation-raised"
        >
          <CatalogState
            icon={WifiOffIcon}
            tone="warning"
            title={offlineTitle}
            description={offlineDescription}
            actions={
              <Button variant="outline" intent="neutral" size="sm" onClick={onShowList}>
                <Icon icon={ListIcon} />
                {listLabel}
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

export { MapPin, MapView, type MapPinData, type MapPreview, type MapViewStatus }
