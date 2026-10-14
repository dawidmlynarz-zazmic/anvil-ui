import * as React from 'react'

import { cn } from '@/lib/utils'
import { CatalogState } from '@/components/agent/catalog-state'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card } from '@/components/ui/card'
import { Icon, RotateCcwIcon, SearchIcon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

// Figma Agent Patterns › Catalog & offers · offer carousel (10668:15841): a horizontally scrolling set of
// Offer Cards with a count, previous / next controls, dots and “See all”. Built on Card (radius xl),
// Carousel (Embla; slides 16px apart, dots), Button, Skeleton and Empty State; nothing re-drawn.
// - Header: `title` (text/base/semibold) with the `count` beside it (“12 results”, text/xs muted), then
//   Previous / Next (outline icon-sm Buttons, disabled at the ends). Footer: the dots and `seeAllLabel`
//   (link Button, `onSeeAll`).
// - `children` are the slides: pass `<OfferCard />`s (vertical); each is wrapped in a CarouselItem.
// - Figma state loaded · loading · empty → `status`, plus `error` (Figma draws it as a fourth card):
//   loading = three skeleton cards (role=status, “Loading results”), empty = a search glyph and
//   `emptyTitle`, error = a destructive tile, `errorTitle`, `errorDescription`, Try again (`onRetry`) and
//   Get help (`onHelp`).

type OfferCarouselStatus = 'loaded' | 'loading' | 'empty' | 'error'

function OfferCarousel({
  title,
  count,
  status = 'loaded',
  seeAllLabel,
  onSeeAll,
  emptyTitle = 'Nothing matches these filters',
  emptyDescription,
  errorTitle = 'Couldn’t load results',
  errorDescription,
  onRetry,
  retryLabel = 'Try again',
  onHelp,
  helpLabel = 'Get help',
  loadingLabel = 'Loading results',
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  title: React.ReactNode
  /** “12 results”. */
  count?: React.ReactNode
  status?: OfferCarouselStatus
  /** “See all 12”. */
  seeAllLabel?: string
  onSeeAll?: () => void
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  errorTitle?: React.ReactNode
  errorDescription?: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  onHelp?: () => void
  helpLabel?: string
  loadingLabel?: string
}) {
  const titleId = React.useId()
  return (
    <Card
      asChild
      className={cn(
        'w-full max-w-160 min-w-0 gap-3 rounded-xl border-border bg-background shadow-sm',
        className,
      )}
    >
      <section data-slot="offer-carousel" data-status={status} {...props}>
        <Carousel
          aria-labelledby={titleId}
          opts={{ align: 'start' }}
          className="flex flex-col gap-3 px-(--card-padding)"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-baseline gap-2">
              <h3 id={titleId} className="type-text-base-semibold text-foreground">
                {title}
              </h3>
              {count && (
                <span className="type-text-xs-normal whitespace-nowrap text-muted-foreground">{count}</span>
              )}
            </div>
            <div className="flex gap-1">
              <CarouselPrevious shape="default" className="static translate-y-0" />
              <CarouselNext shape="default" className="static translate-y-0" />
            </div>
          </div>
          {status === 'loaded' && (
            <CarouselContent>
              {React.Children.map(children, (child) => (
                <CarouselItem className="basis-52">{child}</CarouselItem>
              ))}
            </CarouselContent>
          )}
          {status === 'loading' && (
            <div role="status" aria-label={loadingLabel} aria-busy className="flex gap-4 overflow-hidden">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex w-52 shrink-0 flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}
          {status === 'empty' && (
            <CatalogState icon={SearchIcon} title={emptyTitle} description={emptyDescription} />
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
                    {retryLabel}
                  </Button>
                  {onHelp && (
                    <Button variant="ghost" intent="neutral" size="sm" onClick={onHelp}>
                      {helpLabel}
                    </Button>
                  )}
                </>
              }
            />
          )}
          {status !== 'error' && (
            <div className="flex items-center justify-between gap-2">
              <CarouselDots className="mt-0 justify-start" />
              {seeAllLabel && (
                <Button variant="ghost" intent="neutral" size="xs" onClick={onSeeAll} className="ms-auto">
                  {seeAllLabel}
                </Button>
              )}
            </div>
          )}
        </Carousel>
      </section>
    </Card>
  )
}

export { OfferCarousel, type OfferCarouselStatus }
