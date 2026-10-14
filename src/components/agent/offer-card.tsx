import * as React from 'react'

import { cn } from '@/lib/utils'
import { RatingDisplay } from '@/components/anvil/rating-display'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Figma Agent Patterns › Catalog & offers · offer card (10668:15709): something the user can book or
// buy (events, stays, flights, products, providers). Built on Card (radius lg, --border, shadow/sm),
// Badge (passed in), Rating Display (compact), Button (sm) and Price text; nothing re-drawn.
// - `layout` vertical (220px: a square poster, then the body) · horizontal (a 120px poster beside the
//   body, up to 640px) · compact (a 48 × 60 thumbnail, title, subtitle and the price at the end; no
//   badge, rating or button).
// - Content: `media` (your image; --accent placeholder when none), `badge`, `title`, `subtitle`, `meta`,
//   `rating` ({ value, label }), `price`, and a button (`ctaLabel`, `onCta`: Figma “View dates”).
// - Figma state: hover = `hover:` (--input border + shadow/xl, only when the card is selectable) ·
//   focus = `has-focus-visible:` (--ring border + focus ring) · selected = `selected` (a 2px
//   --border-action stroke, drawn as border + inset ring so the card does not grow) and the button turns
//   brand · unavailable = `unavailable` (the poster at 45%, “Sold out” replaces the price and the button
//   reads `alternativesLabel`: “See alternatives”).
// - Selectable: pass `href` (a link) or `onSelect` (a button) and the title stretches over the whole
//   card (one tab stop, no nested interactive elements); the button sits above it. `selected` is
//   announced with aria-pressed on the button form.
// Figma flag: the button is drawn outline in some states and brand in others (horizontal default);
// here it is outline, and brand only when selected.

type OfferLayout = 'vertical' | 'horizontal' | 'compact'

type OfferCardProps = Omit<React.ComponentProps<'article'>, 'title'> & {
  layout?: OfferLayout
  /** The poster: an image or any node; leave out for the placeholder. */
  media?: React.ReactNode
  badge?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Dates or one key detail. */
  meta?: React.ReactNode
  rating?: { value: number; label?: React.ReactNode }
  /** “From $29”. */
  price?: React.ReactNode
  ctaLabel?: string
  onCta?: () => void
  selected?: boolean
  unavailable?: boolean
  soldOutLabel?: React.ReactNode
  alternativesLabel?: string
  /** Makes the card a link / a button (the title stretches over the card). */
  href?: string
  onSelect?: () => void
}

function OfferCard({
  layout = 'vertical',
  media,
  badge,
  title,
  subtitle,
  meta,
  rating,
  price,
  ctaLabel,
  onCta,
  selected,
  unavailable,
  soldOutLabel = 'Sold out',
  alternativesLabel = 'See alternatives',
  href,
  onSelect,
  className,
  ...props
}: OfferCardProps) {
  const compact = layout === 'compact'
  const selectable = Boolean(href || onSelect)
  const stretch =
    'outline-none after:absolute after:inset-0 after:content-[""] focus-visible:after:rounded-lg'
  const titleNode = href ? (
    <a data-slot="offer-title" href={href} aria-current={selected || undefined} className={stretch}>
      {title}
    </a>
  ) : onSelect ? (
    <button
      data-slot="offer-title"
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(stretch, 'text-left')}
    >
      {title}
    </button>
  ) : (
    title
  )
  const poster = (
    <div
      data-slot="offer-media"
      className={cn(
        'shrink-0 overflow-hidden bg-accent [&>img]:size-full [&>img]:object-cover',
        layout === 'vertical' && 'aspect-square w-full',
        layout === 'horizontal' && 'w-30 self-stretch',
        compact && 'h-15 w-12 rounded-sm',
        unavailable && 'opacity-45',
      )}
    >
      {media}
    </div>
  )
  const cta = ctaLabel && (
    <Button
      variant={selected && !unavailable ? 'default' : 'outline'}
      intent={selected && !unavailable ? 'brand' : 'neutral'}
      size="sm"
      onClick={onCta}
      className="relative z-10 shrink-0"
    >
      {unavailable ? alternativesLabel : ctaLabel}
    </Button>
  )
  return (
    <Card
      asChild
      size="sm"
      className={cn(
        'relative min-w-0 gap-0 overflow-hidden rounded-lg border-border bg-background p-0 shadow-sm transition-[border-color,box-shadow] duration-(--duration-fast) ease-out',
        layout === 'vertical' && 'w-55 max-w-full',
        layout !== 'vertical' && 'w-full max-w-160 flex-row',
        compact && 'items-center gap-3 p-2',
        selectable && 'hover:border-input hover:shadow-elevation-modal',
        'has-focus-visible:border-ring has-focus-visible:focus-ring',
        selected && 'border-border-action inset-ring-1 inset-ring-border-action',
        className,
      )}
    >
      <article
        data-slot="offer-card"
        data-layout={layout}
        data-unavailable={unavailable || undefined}
        {...props}
      >
        {poster}
        {compact ? (
          <>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h3 className="type-text-base-semibold text-foreground">{titleNode}</h3>
              {subtitle && <p className="type-text-xs-normal text-muted-foreground">{subtitle}</p>}
            </div>
            {(price || unavailable) && (
              <p
                className={cn(
                  'shrink-0 type-text-sm-medium whitespace-nowrap',
                  unavailable ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {unavailable ? soldOutLabel : price}
              </p>
            )}
          </>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
            {badge && <div className="flex">{badge}</div>}
            <h3 className="type-text-base-semibold text-foreground">{titleNode}</h3>
            {subtitle && <p className="type-text-xs-normal text-muted-foreground">{subtitle}</p>}
            {meta && <p className="type-text-xs-normal text-muted-foreground">{meta}</p>}
            {rating && <RatingDisplay display="compact" value={rating.value} label={rating.label} />}
            {(price || unavailable || cta) && (
              <div className="mt-auto flex items-center justify-between gap-2">
                <p
                  className={cn(
                    'type-text-sm-semibold whitespace-nowrap',
                    unavailable ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {unavailable ? soldOutLabel : price}
                </p>
                {cta}
              </div>
            )}
          </div>
        )}
      </article>
    </Card>
  )
}

export { OfferCard, type OfferLayout }
