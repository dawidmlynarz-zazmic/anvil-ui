import * as React from 'react'

import { cn } from '@/lib/utils'
import { ShellDescription, ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import { BrainIcon, Icon, PencilIcon, SearchIcon, Trash2Icon } from '@/components/ui/icon'
import { IconTile } from '@/components/anvil/icon-tile'

// Figma Agent Builder › Core Kit › memory manager (10730:2779): review and manage what the
// assistant remembers. --card, border, radius xl, shadow-sm, max 640px. Header (part / card header,
// divider): 32px --agent-subtle tile (brain), title text/sm/semibold, description text/xs muted,
// a Switch that turns memory on or off (labelled by the title). Body (16px, 8px gap):
// MemoryManagerSearch, then MemoryManagerItem rows (border, radius md, 12/10px, 10px gap: the
// memory text/sm, an outline xs Badge `tag`, ghost icon-xs Edit and Delete). Footer
// (part / card footer, --muted): `note` + `action` (ghost destructive, e.g. Clear all).
// While memory is off the rows use --muted-foreground.

function MemoryManager({
  title,
  description,
  enabled,
  defaultEnabled = true,
  onEnabledChange,
  search,
  note,
  action,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Memory on or off (the header Switch). */
  enabled?: boolean
  defaultEnabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  /** MemoryManagerSearch. */
  search?: React.ReactNode
  /** Footer text, e.g. how memory is stored. */
  note?: React.ReactNode
  /** Footer action (ghost destructive Button, e.g. Clear all). */
  action?: React.ReactNode
}) {
  const titleId = React.useId()
  const [uncontrolled, setUncontrolled] = React.useState(defaultEnabled)
  const on = enabled ?? uncontrolled
  return (
    <article
      data-slot="memory-manager"
      data-enabled={on}
      aria-labelledby={titleId}
      className={cn(
        'group/memory flex w-full max-w-160 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      <ShellHeader
        variant="card"
        media={<IconTile icon={BrainIcon} tone="agent" size="sm" />}
        trailing={
          <Switch
            aria-labelledby={titleId}
            checked={on}
            onCheckedChange={(next) => {
              setUncontrolled(next)
              onEnabledChange?.(next)
            }}
          />
        }
      >
        <ShellTitle id={titleId}>{title}</ShellTitle>
        {description && <ShellDescription>{description}</ShellDescription>}
      </ShellHeader>
      {(search || children) && (
        <div className="flex flex-col gap-2 p-4">
          {search}
          {children && <ul className="flex flex-col gap-2">{children}</ul>}
        </div>
      )}
      {(note || action) && (
        <ShellFooter variant="card" note={note}>
          {action}
        </ShellFooter>
      )}
    </article>
  )
}

/** Search field for the list (InputGroup with a search icon). */
function MemoryManagerSearch({
  'aria-label': ariaLabel = 'Search memories',
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return (
    <InputGroup>
      <InputGroupAddon>
        <Icon icon={SearchIcon} />
      </InputGroupAddon>
      <InputGroupInput type="search" aria-label={ariaLabel} {...props} />
    </InputGroup>
  )
}

/** One memory: text, a `tag` (e.g. Preference, Work) and Edit / Delete. */
function MemoryManagerItem({
  tag,
  onEdit,
  onDelete,
  className,
  children,
  ...props
}: React.ComponentProps<'li'> & { tag?: React.ReactNode; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <li
      data-slot="memory-manager-item"
      className={cn('flex items-center gap-2.5 rounded-md border px-3 py-2.5', className)}
      {...props}
    >
      <span className="min-w-0 flex-1 type-text-sm-normal text-foreground group-data-[enabled=false]/memory:text-muted-foreground">
        {children}
      </span>
      {tag && (
        <Badge variant="outline" intent="neutral" size="xs" className="shrink-0">
          {tag}
        </Badge>
      )}
      {onEdit && (
        <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Edit" onClick={onEdit}>
          <Icon icon={PencilIcon} />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Delete" onClick={onDelete}>
          <Icon icon={Trash2Icon} />
        </Button>
      )}
    </li>
  )
}

export { MemoryManager, MemoryManagerItem, MemoryManagerSearch }
