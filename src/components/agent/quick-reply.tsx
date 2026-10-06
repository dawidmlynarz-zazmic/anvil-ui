import * as React from 'react'

import { cn } from '@/lib/utils'
import { Chip, chipVariants, type ToggleChipProps } from '@/components/anvil/chip'
import { CornerDownRightIcon, Icon, PlusIcon, SparklesIcon, XIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › quick reply (10668:15632) and follow up suggestions (10668:15663),
// one family in code (audit M1): one-tap replies and next questions under a message, built on Chip.
// - `QuickReply`: a button that sends it, styled as an outline pill Chip (`chipVariants`) at the
//   Figma quick reply size: 32px, 12px sides, text/xs/medium, 14px icon, --border stroke over
//   --background, hover --muted + --input stroke. Sparkles icon by default (`icon`; null hides it).
// - `QuickReplyFilter`: Figma type filter / applied, a toggle Chip: transparent with a plus;
//   pressed (applied) = --agent-subtle, --agent-soft stroke, agent label, remove ×.
// - `QuickReplyGroup` (Figma quick reply group + follow up suggestions): an optional `label` row
//   (12px sparkles + text/xs/medium muted) and the replies as a list, 8px below. `layout` chips
//   (wrapping, 8px apart) · list (one --input-bordered radius-lg block of text/sm rows with a corner
//   arrow and a plus, --border between rows). Screen readers hear the label and the count.
// Focus → focus/ring; disabled → 50% (after one is sent, disable the set).

type Layout = 'chips' | 'list'

/** null outside a group; the group's layout inside one. */
const GroupContext = React.createContext<Layout | null>(null)

const reply =
  'h-auto min-h-8 py-1.5 type-text-xs-medium inset-ring-border bg-background hover:bg-muted hover:inset-ring-input'

function Item({ children }: { children: React.ReactNode }) {
  const layout = React.useContext(GroupContext)
  return layout ? <li className="flex">{children}</li> : children
}

function QuickReply({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & { icon?: React.ComponentProps<typeof Icon>['icon'] | null }) {
  const layout = React.useContext(GroupContext)
  if (layout === 'list') {
    const glyph = icon === undefined ? CornerDownRightIcon : icon
    return (
      <Item>
        <button
          type="button"
          data-slot="quick-reply"
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-left type-text-sm-normal text-foreground outline-none',
            'transition-colors duration-(--duration-fast) hover:bg-muted focus-visible:focus-ring focus-visible:ring-offset-0',
            'disabled:pointer-events-none disabled:opacity-50',
            className,
          )}
          {...props}
        >
          {glyph && <Icon icon={glyph} className="size-3.5 shrink-0 text-muted-foreground" />}
          <span className="min-w-0 flex-1">{children}</span>
          <Icon icon={PlusIcon} className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </Item>
    )
  }
  const glyph = icon === undefined ? SparklesIcon : icon
  return (
    <Item>
      <button
        type="button"
        data-slot="quick-reply"
        className={cn(
          chipVariants({ variant: 'outline', size: 'lg', shape: 'pill', interactive: false }),
          reply,
          "max-w-full whitespace-normal [&_svg:not([class*='size-'])]:size-3.5",
          className,
        )}
        {...props}
      >
        {glyph && <Icon icon={glyph} />}
        {children}
      </button>
    </Item>
  )
}

function QuickReplyFilter({
  icon = PlusIcon,
  className,
  children,
  ...props
}: Omit<ToggleChipProps, 'onRemove'> & {
  icon?: React.ComponentProps<typeof Icon>['icon'] | null
}) {
  return (
    <Item>
      <Chip
        data-slot="quick-reply-filter"
        variant="outline"
        size="lg"
        shape="pill"
        className={cn(
          'group/filter h-8 bg-transparent type-text-xs-medium inset-ring-border hover:bg-muted hover:inset-ring-input',
          "[&_svg:not([class*='size-'])]:size-3.5",
          'data-[state=on]:bg-agent-subtle data-[state=on]:text-agent data-[state=on]:inset-ring-1 data-[state=on]:inset-ring-agent-soft data-[state=on]:hover:bg-agent-soft dark:data-[state=on]:text-agent-medium',
          className,
        )}
        {...props}
      >
        {icon && <Icon icon={icon} />}
        {children}
        <Icon icon={XIcon} className="hidden size-3 group-data-[state=on]/filter:block" />
      </Chip>
    </Item>
  )
}

function QuickReplyGroup({
  label,
  layout = 'chips',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** A label row above the replies, e.g. "Suggested follow-ups" (Figma show label). */
  label?: React.ReactNode
  layout?: Layout
}) {
  const id = React.useId()
  return (
    <GroupContext.Provider value={layout}>
      <div
        data-slot="quick-reply-group"
        data-layout={layout}
        className={cn('flex w-full max-w-(--shell-widget-max) flex-col gap-2', className)}
        {...props}
      >
        {label && (
          <p id={id} className="flex items-center gap-2 type-text-xs-medium text-muted-foreground">
            <Icon icon={SparklesIcon} size="xs" />
            {label}
          </p>
        )}
        <ul
          aria-labelledby={label ? id : undefined}
          className={cn(
            layout === 'chips'
              ? 'flex flex-wrap gap-2'
              : 'flex flex-col overflow-hidden rounded-lg inset-ring inset-ring-input [&>li:not(:last-child)]:border-b',
          )}
        >
          {children}
        </ul>
      </div>
    </GroupContext.Provider>
  )
}

export { QuickReply, QuickReplyFilter, QuickReplyGroup }
