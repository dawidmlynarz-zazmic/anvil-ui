import * as React from 'react'
import { cva } from 'class-variance-authority'
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
// `size` compact (Figma selection toolbar and inline suggestion actions, Surfaces › Inline assist):
// a small floating bar for AI actions on a selection — --popover, --border stroke, radius md, 4px
// padding, 2px between controls, elevation/raised (Figma shadow/lg) — whose ToolbarButtons default to
// ghost · xs (24px) instead of outline · sm.

const toolbarVariants = cva(
  'flex w-fit items-center text-foreground shadow-elevation-raised inset-ring data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  {
    variants: {
      size: {
        default: 'gap-(--space-xl) rounded-lg bg-background p-3 inset-ring-overlay-16',
        compact: 'gap-0.5 rounded-md bg-popover p-1 inset-ring-border',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

type ToolbarSize = 'default' | 'compact'

const ToolbarSizeContext = React.createContext<ToolbarSize>('default')

function Toolbar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root> & { size?: ToolbarSize }) {
  return (
    <ToolbarSizeContext.Provider value={size}>
      <ToolbarPrimitive.Root
        data-slot="toolbar"
        data-size={size}
        className={cn(toolbarVariants({ size }), className)}
        {...props}
      />
    </ToolbarSizeContext.Provider>
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
  variant: variantProp,
  intent = 'neutral',
  size: sizeProp,
  ...props
}: React.ComponentProps<typeof Button>) {
  const compact = React.useContext(ToolbarSizeContext) === 'compact'
  const variant = variantProp ?? (compact ? 'ghost' : 'outline')
  const size = sizeProp ?? (compact ? 'xs' : 'sm')
  return (
    <ToolbarPrimitive.Button asChild>
      <Button data-slot="toolbar-button" variant={variant} intent={intent} size={size} {...props} />
    </ToolbarPrimitive.Button>
  )
}

function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const compact = React.useContext(ToolbarSizeContext) === 'compact'
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'self-stretch bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px',
        // Figma: the compact bar's divider is 20px tall, centred between the 24px buttons.
        compact && 'self-center data-[orientation=vertical]:h-5',
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
/** A count in the toolbar, e.g. selected items: a Badge (subtle info, pill, sm). */
function ToolbarCount({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <Badge
      data-slot="toolbar-count"
      variant="subtle"
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
