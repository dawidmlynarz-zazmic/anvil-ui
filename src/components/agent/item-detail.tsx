import * as React from 'react'

import { cn } from '@/lib/utils'
import { RatingDisplay } from '@/components/anvil/rating-display'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Patterns › Catalog & offers · item detail (10668:15913): the full view of one item: media,
// badges, title, subtitle, rating, quick facts, description, a note and the actions (a product page, a
// hotel, a provider profile, an event, a fund). Built on Card (radius xl, 16px, 12px apart), Badge,
// Rating Display (stars), Alert (the note, neutral, small) and Button; nothing re-drawn.
// - `media` is the 128 × 96 poster (--accent placeholder when none); `badges` sit above the title.
// - `facts`: pill Badges (subtle neutral) with an icon each (“2h 40m incl. interval”, “Ages 8+”).
// - `note`: a requirement or policy in a neutral Alert (`noteIcon`).
// - Actions: `primary` (brand, with an icon: “Check dates”), `secondary` (outline: “Save”) and `tertiary`
//   (a ghost button pushed to the end: “Venue info”), each `{ label, icon, onClick }`.

type DetailAction = { label: string; icon?: LucideIcon; onClick?: () => void }
type DetailFact = { icon?: LucideIcon; label: string }

function ItemDetail({
  media,
  badges,
  title,
  subtitle,
  rating,
  facts,
  description,
  note,
  noteIcon,
  primary,
  secondary,
  tertiary,
  className,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  media?: React.ReactNode
  badges?: React.ReactNode
  title: React.ReactNode
  /** Subtitle · location · dates. */
  subtitle?: React.ReactNode
  rating?: { value: number; label?: React.ReactNode }
  facts?: DetailFact[]
  description?: React.ReactNode
  note?: React.ReactNode
  noteIcon?: LucideIcon
  primary?: DetailAction
  secondary?: DetailAction
  tertiary?: DetailAction
}) {
  return (
    <Card
      asChild
      className={cn(
        'w-full max-w-160 min-w-0 gap-3 rounded-xl border-border bg-background px-(--card-padding) shadow-sm',
        className,
      )}
    >
      <article data-slot="item-detail" {...props}>
        <div className="flex gap-4 max-sm:flex-col">
          <div
            data-slot="item-detail-media"
            className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-accent [&>img]:size-full [&>img]:object-cover"
          >
            {media}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {badges && <div className="flex flex-wrap gap-1.5">{badges}</div>}
            <h3 className="type-heading-xl text-foreground">{title}</h3>
            {subtitle && <p className="type-text-xs-normal text-muted-foreground">{subtitle}</p>}
            {rating && <RatingDisplay value={rating.value} label={rating.label} />}
            {facts && facts.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {facts.map((fact) => (
                  <li key={fact.label}>
                    <Badge variant="subtle" tone="neutral" shape="pill" size="sm">
                      {fact.icon && <Icon icon={fact.icon} size="xs" />}
                      {fact.label}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {description && <p className="type-text-sm-normal text-foreground">{description}</p>}
        {note && (
          <Alert tone="neutral" size="xs" role="note">
            {noteIcon && <Icon icon={noteIcon} />}
            <AlertDescription>{note}</AlertDescription>
          </Alert>
        )}
        {(primary || secondary || tertiary) && (
          <div className="flex flex-wrap items-center gap-2">
            {primary && (
              <Button intent="brand" size="sm" onClick={primary.onClick}>
                {primary.icon && <Icon icon={primary.icon} />}
                {primary.label}
              </Button>
            )}
            {secondary && (
              <Button variant="outline" intent="neutral" size="sm" onClick={secondary.onClick}>
                {secondary.icon && <Icon icon={secondary.icon} />}
                {secondary.label}
              </Button>
            )}
            {tertiary && (
              <Button
                variant="ghost"
                intent="neutral"
                size="sm"
                onClick={tertiary.onClick}
                className="ms-auto"
              >
                {tertiary.icon && <Icon icon={tertiary.icon} />}
                {tertiary.label}
              </Button>
            )}
          </div>
        )}
      </article>
    </Card>
  )
}

export { ItemDetail, type DetailAction, type DetailFact }
