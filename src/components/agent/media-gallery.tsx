import * as React from 'react'

import { cn } from '@/lib/utils'
import { CatalogState } from '@/components/agent/catalog-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { DownloadIcon, FolderPlusIcon, Icon, ImageIcon, RotateCcwIcon, XIcon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Patterns › Catalog & offers · media gallery (10773:3061): photos or video for one item. Built on
// Carousel (Embla), Dialog (the lightbox), Badge (the counter), Button, Skeleton and Empty State.
// - `layout` grid (a hero and four tiles, the last one a “+N photos” overlay when there are more) ·
//   carousel (one large photo, swipeable, a counter pill “2 / 16”, Previous / Next over the photo and
//   dots). Either opens the lightbox on a click.
// - The lightbox (`open` / `defaultOpen` / `onOpenChange`, `index` / `defaultIndex` / `onIndexChange`): a
//   dark Dialog with “title · 2 of 16”, Download (`onDownload`) and Close, the photo, and a row of
//   thumbnails; ← / → move between photos.
// - `items`: `{ src, alt }` (no `src` draws the placeholder); `total` is the full count when only the
//   first photos are loaded (“+12 photos”, “2 / 16”).
// - Figma state loaded · loading · empty (+ error) → `status`: loading = a block and two lines (status
//   “Loading photos”), empty = “No photos yet” with an optional action, error = Try again / Get help.
// Photos are buttons (“Open photo 3: alt”), so the keyboard and screen readers reach every one.

type MediaItem = { src?: string; alt: string }
type MediaGalleryStatus = 'loaded' | 'loading' | 'empty' | 'error'

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const set = React.useCallback(
    (next: T) => {
      if (value === undefined) setInner(next)
      onChange?.(next)
    },
    [value, onChange],
  )
  return [current, set] as const
}

function Photo({ item, className }: { item: MediaItem; className?: string }) {
  return item.src ? (
    <img src={item.src} alt="" className={cn('size-full object-cover', className)} />
  ) : (
    <span className={cn('grid size-full place-items-center bg-accent text-muted-foreground', className)}>
      <Icon icon={ImageIcon} className="size-5" />
    </span>
  )
}

function MediaGallery({
  items,
  total,
  layout = 'grid',
  status = 'loaded',
  title,
  open,
  defaultOpen,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  onDownload,
  emptyTitle = 'No photos yet',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  errorTitle = 'Couldn’t load photos',
  errorDescription,
  onRetry,
  onHelp,
  loadingLabel = 'Loading photos',
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  items: MediaItem[]
  /** The full count when `items` is only the first few. */
  total?: number
  layout?: 'grid' | 'carousel'
  status?: MediaGalleryStatus
  /** The item's name, shown in the lightbox: “Paper Kingdoms · 2 of 16”. */
  title: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  onDownload?: (item: MediaItem, index: number) => void
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
  const count = total ?? items.length
  const [lightbox, setLightbox] = useControllable(open, defaultOpen ?? false, onOpenChange)
  const [current, setCurrent] = useControllable(index, defaultIndex, onIndexChange)
  const [api, setApi] = React.useState<CarouselApi>()
  const [slide, setSlide] = React.useState(0)
  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setSlide(api.selectedScrollSnap())
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  const openAt = (at: number) => {
    setCurrent(at)
    setLightbox(true)
  }
  const step = (by: number) => setCurrent((current + by + items.length) % items.length)

  if (status === 'loading')
    return (
      <div
        data-slot="media-gallery"
        data-status="loading"
        role="status"
        aria-label={loadingLabel}
        aria-busy
        className={cn('flex w-full max-w-145 flex-col gap-2', className)}
        {...props}
      >
        <Skeleton className="aspect-2/1 w-full rounded-lg" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    )
  if (status === 'empty')
    return (
      <div
        data-slot="media-gallery"
        data-status="empty"
        className={cn('w-full max-w-145', className)}
        {...props}
      >
        <CatalogState
          icon={FolderPlusIcon}
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
      </div>
    )
  if (status === 'error')
    return (
      <div
        data-slot="media-gallery"
        data-status="error"
        className={cn('w-full max-w-145', className)}
        {...props}
      >
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
      </div>
    )

  const tile = (item: MediaItem, at: number, className?: string, overlay?: React.ReactNode) => (
    <button
      key={at}
      type="button"
      aria-label={`Open photo ${at + 1}: ${item.alt}`}
      onClick={() => openAt(at)}
      className={cn(
        'relative block overflow-hidden outline-none focus-visible:focus-ring focus-visible:ring-inset focus-visible:ring-offset-0',
        className,
      )}
    >
      <Photo item={item} />
      {overlay}
    </button>
  )
  const more = count - 5
  const shown = items.slice(0, 5)

  return (
    <div
      data-slot="media-gallery"
      data-layout={layout}
      data-status="loaded"
      className={cn('w-full max-w-145', className)}
      {...props}
    >
      {layout === 'grid' ? (
        <div className="grid aspect-2/1 grid-cols-4 grid-rows-2 gap-0.5 overflow-hidden rounded-lg">
          {shown.map((item, at) =>
            tile(
              item,
              at,
              at === 0 ? 'col-span-2 row-span-2' : undefined,
              at === 4 && more > 0 ? (
                <span className="absolute inset-0 grid place-items-center bg-background-inverse/70 type-text-sm-medium text-foreground-inverse">
                  +{more} photos
                </span>
              ) : undefined,
            ),
          )}
        </div>
      ) : (
        <Carousel setApi={setApi} opts={{ loop: false }} className="relative">
          <CarouselContent className="ml-0">
            {items.map((item, at) => (
              <CarouselItem key={at} className="pl-0">
                {tile(item, at, 'aspect-16/9 w-full rounded-lg')}
              </CarouselItem>
            ))}
          </CarouselContent>
          <Badge
            variant="default"
            tone="neutral"
            size="sm"
            className="pointer-events-none absolute top-3 right-3"
          >
            {slide + 1} / {count}
          </Badge>
          <CarouselPrevious className="left-3 bg-background/90" />
          <CarouselNext className="right-3 bg-background/90" />
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <CarouselDots className="pointer-events-auto mt-0 rounded-full bg-background-inverse/60 px-2 py-1 [&_[aria-current=true]>span]:bg-foreground-inverse [&_span]:bg-foreground-inverse/50" />
          </div>
        </Carousel>
      )}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          showCloseButton={false}
          size="lg"
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') step(-1)
            if (event.key === 'ArrowRight') step(1)
          }}
          className="max-w-4xl gap-0 border-overlay-inverse-16 bg-background-inverse p-0 text-foreground-inverse"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <DialogTitle className="type-text-sm-medium text-foreground-inverse">
              {title} · {current + 1} of {count}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Photo viewer. Use the left and right arrow keys to move between photos.
            </DialogDescription>
            <div className="flex items-center gap-1">
              {onDownload && (
                <Button
                  variant="ghost"
                  intent="inverse"
                  size="icon-sm"
                  aria-label="Download photo"
                  onClick={() => onDownload(items[current], current)}
                >
                  <Icon icon={DownloadIcon} />
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="ghost" intent="inverse" size="icon-sm" aria-label="Close">
                  <Icon icon={XIcon} />
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mx-4 aspect-video overflow-hidden rounded-md bg-overlay-inverse-16">
            <Photo item={items[current]} className="object-contain" />
          </div>
          <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
            {items.map((item, at) => (
              <button
                key={at}
                type="button"
                aria-label={`Show photo ${at + 1}: ${item.alt}`}
                aria-current={at === current || undefined}
                onClick={() => setCurrent(at)}
                className="h-10 w-12.5 shrink-0 overflow-hidden rounded-sm opacity-60 outline-none focus-visible:focus-ring aria-[current=true]:opacity-100"
              >
                <Photo item={item} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { MediaGallery, type MediaGalleryStatus, type MediaItem }
