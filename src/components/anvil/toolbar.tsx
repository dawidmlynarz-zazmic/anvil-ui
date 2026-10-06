import * as React from 'react'
import { Toolbar as ToolbarPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toggleVariants } from '@/components/ui/toggle'

// Figma: Toolbar page → `toolbar` (8218:17459). A floating bar of contextual actions (e.g. bulk
// actions on a selection), on Radix Toolbar: role="toolbar", arrow keys move between controls, one
// Tab stop. Card: --background, --overlay-16 stroke, radius lg, 12px padding, 32px between groups
// (--space-xl), elevation/raised (Figma still shadow/lg). Groups hold 8px-apart controls:
// ToolbarButton (outline · neutral · sm by default, any Button props), ToolbarToggleGroup /
// ToolbarToggleItem (Toggle styles), ToolbarSeparator; a ButtonGroup of ToolbarButtons joins them.
// ToolbarCount + ToolbarLabel draw the selection summary ("1 Selected").

function Toolbar({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Root>) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn(
        'flex w-fit items-center gap-(--space-xl) rounded-lg bg-background p-3 text-foreground shadow-elevation-raised inset-ring inset-ring-overlay-16',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  )
}

function ToolbarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      data-slot="toolbar-group"
      className={cn('flex items-center gap-2 in-data-[orientation=vertical]:flex-col', className)}
      {...props}
    />
  )
}

/** An Anvil Button that takes part in the toolbar's arrow-key navigation. */
function ToolbarButton({
  variant = 'outline',
  intent = 'neutral',
  size = 'sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <ToolbarPrimitive.Button asChild>
      <Button data-slot="toolbar-button" variant={variant} intent={intent} size={size} {...props} />
    </ToolbarPrimitive.Button>
  )
}

function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'self-stretch bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  )
}

function ToolbarToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>) {
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  )
}

function ToolbarToggleItem({
  className,
  size = 'sm',
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> & { size?: 'sm' | 'default' | 'lg' }) {
  return (
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      className={cn(toggleVariants({ size }), className)}
      {...props}
    />
  )
}

/** Figma selection count: an --info-subtle pill. */
/** A count in the toolbar, e.g. selected items: a Badge (semantic info, pill, sm). */
function ToolbarCount({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <Badge
      data-slot="toolbar-count"
      variant="semantic"
      tone="info"
      shape="pill"
      size="sm"
      className={cn('min-w-5', className)}
      {...props}
    />
  )
}

function ToolbarLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="toolbar-label"
      className={cn('type-text-sm-medium whitespace-nowrap text-foreground', className)}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarCount,
  ToolbarLabel,
}
