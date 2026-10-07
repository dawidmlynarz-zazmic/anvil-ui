import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { Card } from '@/components/ui/card'
import { FileTextIcon, type LucideIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › Shell · starter prompt card (10727:2096): a prompt to start a
// chat from the welcome screen. Built on the interactive Card (a `<button>` via `asChild`), not
// re-drawn: --card, 1px --border, radius md, 16px padding, 8px gap, up to 640px. A 32px neutral
// Icon Tile (16px icon), `title` text/sm/semibold, `description` text/xs muted.
// Figma state → selectors: hover → --muted fill, --border-strong stroke and shadow/sm; focus → the
// focus ring; disabled → 50%. Figma draws a quieter resting card than Card's interactive look
// (--border and no shadow, instead of --overlay-16 + shadow/sm), so those are overridden with the
// same selector Card uses (written out in full: Tailwind only sees literal class names).

function StarterPromptCard({
  title,
  description,
  icon = FileTextIcon,
  className,
  type = 'button',
  ...props
}: Omit<React.ComponentProps<'button'>, 'title'> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** The glyph in the tile. */
  icon?: LucideIcon
}) {
  return (
    <Card
      asChild
      className={cn(
        'max-w-160 min-w-0 items-start gap-2 bg-card px-4 text-left',
        '[&:is(a,button,[role=button])]:border-border [&:is(a,button,[role=button])]:shadow-none',
        '[&:is(a,button,[role=button])]:transition-[background-color,border-color,box-shadow]',
        '[&:is(a,button,[role=button])]:hover:border-border-strong [&:is(a,button,[role=button])]:hover:bg-muted [&:is(a,button,[role=button])]:hover:shadow-sm',
        className,
      )}
    >
      <button data-slot="starter-prompt-card" type={type} {...props}>
        <IconTile icon={icon} size="sm" />
        <span className="type-text-sm-semibold text-foreground">{title}</span>
        {description && <span className="type-text-xs-normal text-muted-foreground">{description}</span>}
      </button>
    </Card>
  )
}

export { StarterPromptCard }
