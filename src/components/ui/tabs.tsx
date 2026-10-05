import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Figma: Tabs page → `tabs` (8218:18525) and `.tab-nav-item` (1623:6844). Underlined tab navigation:
// `variant` contained (a --overlay-8 rule under the list, default) · line (no rule) — the API
// Contract's names; shadcn's default · line. `fullWidth` (Figma full width) stretches the triggers.
// Trigger: padding 16 / 0, text/sm/medium, gap 4 for an icon and a count Badge (xs · subtle).
// Selected → --foreground with a 2px --foreground underline; unselected → --muted-foreground.
// Figma `state` → selectors: hover → hover: (unselected text --foreground; selected text
// --muted-foreground with a --foreground-subtle underline, as drawn), focus → focus-visible:
// (focus/ring), disabled → disabled: (50%). Vertical orientation (shadcn) underlines on the right.

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn('group/tabs flex gap-4 data-[orientation=horizontal]:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  [
    'group/tabs-list inline-flex w-fit items-center gap-4 px-4 text-muted-foreground',
    'group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:items-stretch group-data-[orientation=vertical]/tabs:gap-0 group-data-[orientation=vertical]/tabs:px-0',
    'data-[full-width=true]:w-full',
  ],
  {
    variants: {
      variant: {
        contained:
          'group-data-[orientation=horizontal]/tabs:border-b group-data-[orientation=vertical]/tabs:border-r border-overlay-8',
        line: '',
      },
    },
    defaultVariants: {
      variant: 'contained',
    },
  },
)

function TabsList({
  className,
  variant = 'contained',
  fullWidth = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & {
    /** Figma `full width`: the list fills its container and the triggers share it equally. */
    fullWidth?: boolean
  }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-full-width={fullWidth}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex items-center justify-center gap-1 py-4 type-text-sm-medium whitespace-nowrap text-muted-foreground outline-none',
        'transition-colors duration-(--duration-fast) ease-out',
        'group-data-[full-width=true]/tabs-list:flex-1',
        'group-data-[orientation=vertical]/tabs:justify-start group-data-[orientation=vertical]/tabs:px-4 group-data-[orientation=vertical]/tabs:py-2',
        'hover:text-foreground data-[state=active]:text-foreground data-[state=active]:hover:text-muted-foreground',
        'focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Underline: 2px, over the contained rule.
        'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100 data-[state=active]:hover:after:bg-foreground-subtle',
        'group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-px group-data-[orientation=horizontal]/tabs:after:h-0.5',
        'group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-px group-data-[orientation=vertical]/tabs:after:w-0.5',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 rounded-sm outline-none focus-visible:focus-ring', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
