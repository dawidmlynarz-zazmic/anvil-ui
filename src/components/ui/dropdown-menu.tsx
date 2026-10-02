import * as React from 'react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'

import { CheckIcon, ChevronRightIcon, Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Dropdown Menu page → `dropdown menu` (8257:3156), `dropdown item` (1650:28172),
// `dropdown item slot` (8585:5179), `dropdown title` (8308:2662). Also the Context Menu items.
// Figma item `type` → sub-component: default → DropdownMenuItem, radio → DropdownMenuRadioItem
// (check at the end), checkbox → DropdownMenuCheckboxItem (small switch at the end), destructive →
// DropdownMenuItem intent="destructive". `state` → selectors: highlighted → data-[highlighted]
// (--muted), disabled → data-[disabled] (50%, as drawn).

const contentClassName = [
  // Figma menu: --popover, 1px --overlay-4 stroke, radius lg, 8px padding. Figma still uses
  // shadow/lg here; elevation/raised is the same value (CLAUDE.md → known gaps).
  'z-(--z-popover) min-w-54 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-2 text-popover-foreground',
  'inset-ring inset-ring-overlay-4 shadow-elevation-raised',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
]

const itemClassName = [
  'group/item relative flex h-9 cursor-default items-center gap-2 rounded-md px-2 type-text-sm-normal text-foreground outline-hidden select-none',
  'data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
]

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          contentClassName,
          'max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuItem({
  className,
  inset,
  intent = 'neutral',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  /** Figma type=destructive. Text uses --danger-medium (Figma --danger is 3.25:1 on dark). */
  intent?: 'neutral' | 'destructive'
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-intent={intent}
      className={cn(itemClassName, 'data-[intent=destructive]:text-danger-medium', className)}
      {...props}
    />
  )
}

/** Figma type=checkbox: a small switch at the end shows the checked state (visual only). */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(itemClassName, 'pr-2', className)}
      checked={checked}
      {...props}
    >
      {children}
      <span
        aria-hidden
        data-slot="dropdown-menu-checkbox-switch"
        className="ml-auto flex h-4 w-6 shrink-0 items-center rounded-full bg-background-medium p-0.5 inset-shadow-xs group-data-[state=checked]/item:bg-primary"
      >
        <span className="size-3 rounded-full bg-primary-foreground shadow-sm transition-[translate] duration-(--duration-fast) group-data-[state=checked]/item:translate-x-2" />
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

/** Figma type=radio: a check at the end marks the selected item. */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(itemClassName, 'pr-8', className)}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Icon icon={CheckIcon} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.RadioItem>
  )
}

/** Figma `dropdown title`: section title row. */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn('p-2 type-text-xs-medium text-foreground-subtle data-[inset]:pl-8', className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('mx-2 my-2 h-px bg-border', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      // --foreground-subtle on the highlighted --muted row is 4.34:1; --muted-foreground passes.
      className={cn(
        'ml-auto pl-2 type-text-xs-medium text-foreground-subtle in-data-[highlighted]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

/** Figma type=default with the chevron suffix: opens a submenu. */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(itemClassName, 'data-[state=open]:bg-muted', className)}
      {...props}
    >
      {children}
      <Icon icon={ChevronRightIcon} size="xs" className="ml-auto text-foreground-subtle" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(contentClassName, 'origin-(--radix-dropdown-menu-content-transform-origin)', className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
