import * as React from 'react'

import { cn } from '@/lib/utils'
import { Toolbar, ToolbarButton } from '@/components/anvil/toolbar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Figma Agent Builder › Core Kit › message actions (10672:2620), built on Toolbar: the row under a
// message — copy, retry, edit, good / bad response, share — as ghost · neutral icon buttons 4px
// apart (Figma 36px; code icon-sm 32px, the nearest Button size), one tab stop with arrow keys
// between them. Each action names itself (`label` → aria-label and tooltip). `pressed` marks a
// toggled action (feedback): aria-pressed and the --accent fill. `menu` opens Dropdown Menu items
// from the action — e.g. retry's regenerate items (Try again, Modify response, Switch model; Figma
// regenerate menu, 260px, radius xl) — composed here, not a component of its own.

function MessageActions({ className, ...props }: React.ComponentProps<typeof Toolbar>) {
  return (
    <Toolbar
      aria-label="Message actions"
      data-slot="message-actions"
      className={cn('gap-1 bg-transparent p-0 shadow-none inset-ring-0', className)}
      {...props}
    />
  )
}

function MessageAction({
  label,
  pressed,
  menu,
  menuProps,
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarButton>, 'aria-label'> & {
  /** Names the action: accessible name and tooltip. */
  label: string
  /** For toggles such as good / bad response. */
  pressed?: boolean
  /** Dropdown Menu items the action opens (DropdownMenuItem, DropdownMenuSub, …). */
  menu?: React.ReactNode
  /** Props for the menu's Dropdown Menu root (open, onOpenChange, modal). */
  menuProps?: Omit<React.ComponentProps<typeof DropdownMenu>, 'children'>
}) {
  const button = (
    <ToolbarButton
      data-slot="message-action"
      variant="ghost"
      intent="neutral"
      size="icon-sm"
      aria-label={label}
      aria-pressed={pressed}
      className={cn('aria-pressed:bg-accent', className)}
      {...props}
    />
  )
  // Tooltip trigger → (menu trigger →) toolbar button: each asChild layer adds its props.
  const action = (
    <Tooltip>
      <TooltipTrigger asChild>
        {menu ? <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger> : button}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
  if (!menu) return action
  return (
    <DropdownMenu {...menuProps}>
      {action}
      <DropdownMenuContent data-slot="message-action-menu" align="start" className="w-65 rounded-xl p-1.5">
        {menu}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { MessageActions, MessageAction }
