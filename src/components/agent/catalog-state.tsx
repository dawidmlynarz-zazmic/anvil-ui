import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { Icon, type LucideIcon } from '@/components/ui/icon'

// Internal to the Catalog & scheduling patterns (Offer Carousel, Media Gallery, Location List,
// Availability Calendar, Slot List, Map View): the borderless empty / error body Figma draws inside the
// pattern's own container. Empty State with either a bare 48px glyph (`empty`) or a 48px circle Icon
// Tile in a tone (`error` destructive, or `tone` warning for a permission). `actions` are sm Buttons.
// Not a story of its own (like Citation Confidence): its imports count as the importer's.

function CatalogState({
  icon,
  tone,
  title,
  description,
  actions,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  icon: LucideIcon
  /** A tone draws the glyph on a 48px circle tile (errors, permissions); none leaves the bare glyph. */
  tone?: 'destructive' | 'warning'
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <EmptyState
      data-slot="catalog-state"
      role={tone === 'destructive' ? 'alert' : 'status'}
      className={cn('gap-2.5 border-0 p-(--space-lg) md:p-(--space-lg)', className)}
      {...props}
    >
      <EmptyStateHeader className="max-w-none gap-2">
        <EmptyStateMedia className="mb-0">
          {tone ? (
            <IconTile icon={icon} tone={tone} size="lg" shape="circle" />
          ) : (
            <Icon icon={icon} className="size-8 text-muted-foreground" />
          )}
        </EmptyStateMedia>
        <EmptyStateTitle className="type-text-base-semibold">{title}</EmptyStateTitle>
        {description && (
          <EmptyStateDescription className="text-muted-foreground">{description}</EmptyStateDescription>
        )}
      </EmptyStateHeader>
      {actions && <EmptyStateContent className="flex-row justify-center gap-2">{actions}</EmptyStateContent>}
    </EmptyState>
  )
}

export { CatalogState }
