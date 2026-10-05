import * as React from 'react'
import { Toggle as TogglePrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Icon, PlusIcon, SparklesIcon, XIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › quick reply (10668:15632), built on Button (outline, pill): a
// one-tap reply under a message. Pill, 12/8px padding, 4px gap, text/xs/medium, 14px icon, --border
// stroke. Figma type = sub-component: suggestion → `QuickReply` (button that sends it: --background,
// hover --muted + --input stroke, sparkles icon) · filter / applied → `QuickReplyFilter` (toggle:
// transparent with a plus; pressed = applied: --agent-subtle, --agent-soft stroke, agent label,
// remove ×). Focus → focus/ring; disabled → 50%. `QuickReplyGroup` (Figma quick reply group) wraps
// up to six, 8px apart. `icon` swaps the leading icon (null hides it, Figma show icon).

const base = [
  'inline-flex h-8 w-fit shrink-0 items-center gap-1 rounded-full px-3 type-text-xs-medium whitespace-nowrap text-foreground inset-ring inset-ring-border outline-none',
  'transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-out',
  'focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
]

function QuickReply({
  icon = SparklesIcon,
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & { icon?: React.ComponentProps<typeof Icon>['icon'] | null }) {
  return (
    <button
      type="button"
      data-slot="quick-reply"
      className={cn(base, 'bg-background hover:bg-muted hover:inset-ring-input', className)}
      {...props}
    >
      {icon && <Icon icon={icon} />}
      {children}
    </button>
  )
}

function QuickReplyFilter({
  icon = PlusIcon,
  className,
  children,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & {
  icon?: React.ComponentProps<typeof Icon>['icon'] | null
}) {
  return (
    <TogglePrimitive.Root
      data-slot="quick-reply-filter"
      className={cn(
        base,
        'group/filter bg-transparent hover:bg-muted hover:inset-ring-input',
        'data-[state=on]:bg-agent-subtle data-[state=on]:text-agent data-[state=on]:inset-ring-agent-soft data-[state=on]:hover:bg-agent-soft dark:data-[state=on]:text-agent-medium',
        className,
      )}
      {...props}
    >
      {icon && <Icon icon={icon} />}
      {children}
      <Icon icon={XIcon} className="hidden size-3 group-data-[state=on]/filter:block" />
    </TogglePrimitive.Root>
  )
}

function QuickReplyGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      data-slot="quick-reply-group"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    />
  )
}

export { QuickReply, QuickReplyFilter, QuickReplyGroup }
