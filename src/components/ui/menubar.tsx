import * as React from 'react'
import { Menubar as MenubarPrimitive } from 'radix-ui'

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

// Figma: Menu page → `menu` (10948:83) and `.menu trigger` (10948:57); the code keeps shadcn's
// Menubar name (API Contract). Bar: --background, 1px --border stroke, radius md, 4px padding and gap.
// Trigger: 28px, padding 4 / 8, radius sm, text/sm/medium --foreground; hover and open → --accent
// fill, focus → focus/ring. Menus are the Dropdown Menu's (shared menu-styles.tsx, same item API:
// `intent="destructive"`, radio check and checkbox switch at the end).

function Menubar({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        'flex w-fit items-center gap-1 rounded-md border border-border bg-background p-1',
        className,
      )}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'flex h-7 items-center rounded-sm px-2 py-1 type-text-sm-medium text-foreground outline-hidden select-none',
        'hover:bg-accent focus-visible:focus-ring data-[highlighted]:bg-accent data-[state=open]:bg-accent',
        className,
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(menuContentClassName, 'origin-(--radix-menubar-content-transform-origin)', className)}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  inset,
  intent = 'neutral',
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  /** Figma type=destructive (shadcn `variant`; `intent` as on Dropdown Menu). */
  intent?: 'neutral' | 'destructive'
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-intent={intent}
      className={cn(menuItemClassName, className)}
      {...props}
    />
  )
}

/** Figma type=checkbox: a small switch at the end shows the checked state. */
function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(menuItemClassName, 'pr-2', className)}
      checked={checked}
      {...props}
    >
      {children}
      <MenuCheckboxSwitch slot="menubar-checkbox-switch" />
    </MenubarPrimitive.CheckboxItem>
  )
}

/** Figma type=radio: a check at the end marks the selected item. */
function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(menuItemClassName, 'pr-8', className)}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Icon icon={CheckIcon} />
        </MenubarPrimitive.ItemIndicator>
      </span>
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(menuLabelClassName, className)}
      {...props}
    />
  )
}

function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn(menuSeparatorClassName, className)}
      {...props}
    />
  )
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="menubar-shortcut" className={cn(menuShortcutClassName, className)} {...props} />
}

function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(menuItemClassName, 'data-[state=open]:bg-muted', className)}
      {...props}
    >
      {children}
      <Icon icon={ChevronRightIcon} size="xs" className="ml-auto text-foreground-subtle" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(menuContentClassName, 'origin-(--radix-menubar-content-transform-origin)', className)}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
