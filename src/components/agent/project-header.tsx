import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { FolderIcon, type LucideIcon } from '@/components/ui/icon'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

// Figma Agent Builder › Core Kit › Shell · project header (10730:2696): the bar above the chats in a
// project. Built on Item (size sm) as a `<header>`: --background, a --border rule below, 12px
// padding (16px at the start), 12px gap, up to 768px. A 32px info Icon Tile (folder), the `name`
// text/sm/semibold and `details` text/xs muted on one line each, then `actions` (Buttons, xs:
// ghost Files and Instructions, outline Share in Figma).

function ProjectHeader({
  name,
  details,
  icon = FolderIcon,
  actions,
  className,
  ...props
}: React.ComponentProps<'header'> & {
  /** The project name. */
  name: React.ReactNode
  /** One line of facts, e.g. "12 chats · 3 files · shared with 4 people". */
  details?: React.ReactNode
  /** The glyph in the info tile. */
  icon?: LucideIcon
  /** Buttons (xs) at the end. */
  actions?: React.ReactNode
}) {
  return (
    <Item
      asChild
      size="sm"
      className={cn(
        'w-full max-w-192 flex-nowrap rounded-none border-0 border-b border-border bg-background py-3 ps-4 pe-3',
        className,
      )}
    >
      <header data-slot="project-header" {...props}>
        <ItemMedia>
          <IconTile icon={icon} tone="info" size="sm" />
        </ItemMedia>
        <ItemContent className="gap-0">
          <ItemTitle role="heading" aria-level={2} className="block truncate type-text-sm-semibold">
            {name}
          </ItemTitle>
          {details && <ItemDescription className="line-clamp-none truncate">{details}</ItemDescription>}
        </ItemContent>
        {actions && <ItemActions className="gap-1">{actions}</ItemActions>}
      </header>
    </Item>
  )
}

export { ProjectHeader }
