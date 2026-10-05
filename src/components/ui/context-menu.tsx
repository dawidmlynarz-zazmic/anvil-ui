import * as React from 'react'
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui'

import { CheckIcon, ChevronRightIcon, Icon } from '@/components/ui/icon'
import {
  MenuCheckboxSwitch,
  menuContentClassName,
  menuItemClassName,
  menuLabelClassName,
  menuSeparatorClassName,
  menuShortcutClassName,
} from '@/components/ui/menu-styles'
import { cn } from '@/lib/utils'

// Figma: Dropdown Menu page → `example · context menu` (10951:40097). A context menu is a Dropdown
// Menu opened by right-click or long-press instead of a button: same items, separators, titles and
// submenus, so it draws with the shared menu styles (menu-styles.tsx) and the same item API as
// Dropdown Menu (`intent="destructive"`, radio check and checkbox switch at the end).

function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
}

function ContextMenuGroup({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

function ContextMenuPortal({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
}

function ContextMenuSub({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

/** Figma item with the chevron suffix: opens a submenu beside the menu. */
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(menuItemClassName, 'data-[state=open]:bg-muted', className)}
      {...props}
    >
      {children}
      <Icon icon={ChevronRightIcon} size="xs" className="ml-auto text-foreground-subtle" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        menuContentClassName,
        'origin-(--radix-context-menu-content-transform-origin)',
        className,
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          menuContentClassName,
          'max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin)',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  intent = 'neutral',
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  /** Figma type=destructive (shadcn `variant`; `intent` as on Dropdown Menu). */
  intent?: 'neutral' | 'destructive'
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-intent={intent}
      className={cn(menuItemClassName, className)}
      {...props}
    />
  )
}

/** Figma type=checkbox: a small switch at the end shows the checked state. */
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(menuItemClassName, 'pr-2', className)}
      checked={checked}
      {...props}
    >
      {children}
      <MenuCheckboxSwitch slot="context-menu-checkbox-switch" />
    </ContextMenuPrimitive.CheckboxItem>
  )
}

/** Figma type=radio: a check at the end marks the selected item. */
function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(menuItemClassName, 'pr-8', className)}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Icon icon={CheckIcon} />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
    </ContextMenuPrimitive.RadioItem>
  )
}

/** Figma `dropdown title`: section title row. */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(menuLabelClassName, className)}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(menuSeparatorClassName, className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot="context-menu-shortcut" className={cn(menuShortcutClassName, className)} {...props} />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
