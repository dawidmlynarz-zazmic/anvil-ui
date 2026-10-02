'use client'

import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon, SearchIcon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Figma: Command page → `command` (10942:147). Search input + grouped items + empty state (cmdk).
// Items, group headings and separators are the Dropdown Menu's (dropdown item / dropdown title):
// highlighted = keyboard selection → data-[selected=true]:bg-muted. Inside a Dialog it is the command
// palette (CommandDialog); inside a Popover it is the Combobox.

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className={cn('overflow-hidden p-0', className)} showCloseButton={showCloseButton}>
        {/* Same items as the standalone Command (Figma); shadcn enlarges them in the palette. */}
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="flex items-center gap-2 border-b border-border p-3">
      <Icon icon={SearchIcon} className="text-foreground-subtle" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'flex h-5 w-full bg-transparent type-text-sm-normal text-foreground outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-75 scroll-py-2 overflow-x-hidden overflow-y-auto p-2', className)}
      {...props}
    />
  )
}

/**
 * Place it after CommandList, not inside it: inside, it sits in the role="listbox", which may only
 * contain options or groups (axe aria-required-children). cmdk shows it from the Command's count.
 */
function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center type-text-sm-normal text-muted-foreground"
      {...props}
    />
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        // Heading = Figma dropdown title; items 4px apart (Figma list gap).
        'overflow-hidden text-foreground [&_[cmdk-group-heading]]:p-2 [&_[cmdk-group-heading]]:type-text-xs-medium [&_[cmdk-group-heading]]:text-foreground-subtle [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex h-9 cursor-default items-center gap-2 rounded-md px-2 type-text-sm-normal text-foreground outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn('ml-auto pl-2 type-text-xs-medium text-foreground-subtle', className)}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
