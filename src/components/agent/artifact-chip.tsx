import * as React from 'react'

import { cn } from '@/lib/utils'
import { TextShimmer } from '@/components/agent/text-shimmer'
import { IconTile } from '@/components/anvil/icon-tile'
import {
  ChevronRightIcon,
  Icon,
  LayoutDashboardIcon,
  PanelRightIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

// Figma Agent Builder › Surfaces › Split canvas · artifact chip (10744:3954): the in-chat link to an
// artifact in the canvas. Built on Item (outline, sm) as a `<button>`: --card, --border, radius md,
// 8px padding, 10px gap, a 32px info Icon Tile, `title` text/sm/semibold and `description` text/xs
// muted, then a chevron. Figma state → code: default · hover (`hover:`, --border-strong) · focus
// (focus ring) · updating (`loading`: the description becomes a Text Shimmer, e.g. "Updating to
// v4…") · active (`open`: the artifact is open in the canvas — a 2px --border-action stroke and a
// panel glyph; `aria-current`).

function ArtifactChip({
  title,
  description,
  icon = LayoutDashboardIcon,
  loading = false,
  loadingLabel = 'Updating…',
  open = false,
  className,
  type = 'button',
  ...props
}: Omit<React.ComponentProps<'button'>, 'title'> & {
  title: React.ReactNode
  /** Kind and version, e.g. "Interactive dashboard · v4". */
  description?: React.ReactNode
  /** The glyph in the tile. */
  icon?: LucideIcon
  /** Figma state updating: the agent is changing it. */
  loading?: boolean
  /** What the shimmer says while `loading`, e.g. "Updating to v4…". */
  loadingLabel?: string
  /** Figma state active: it is open in the canvas. */
  open?: boolean
}) {
  return (
    <Item
      asChild
      variant="outline"
      size="sm"
      className={cn(
        'w-full max-w-90 flex-nowrap gap-2.5 bg-card p-2 text-left hover:border-border-strong',
        open && 'border-2 border-border-action p-1.75 hover:border-border-action',
        className,
      )}
    >
      <button
        data-slot="artifact-chip"
        data-open={open || undefined}
        aria-current={open || undefined}
        aria-busy={loading || undefined}
        type={type}
        {...props}
      >
        <ItemMedia>
          <IconTile icon={icon} tone="info" size="sm" />
        </ItemMedia>
        <ItemContent className="gap-0">
          <ItemTitle className="block truncate type-text-sm-semibold">{title}</ItemTitle>
          {loading ? (
            <TextShimmer className="truncate">{loadingLabel}</TextShimmer>
          ) : (
            description && <ItemDescription className="line-clamp-1">{description}</ItemDescription>
          )}
        </ItemContent>
        <Icon icon={open ? PanelRightIcon : ChevronRightIcon} className="text-muted-foreground" />
      </button>
    </Item>
  )
}

export { ArtifactChip }
