import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Figma Agent Builder › Core Kit › message actions (10672:2620), built on Button Group: the row under
// a message — copy, retry, edit, good / bad response, share — as ghost · neutral icon buttons 4px
// apart (Figma 36px; code icon-sm 32px, the nearest Button size). Each action names itself
// (`label` → aria-label and tooltip). `pressed` marks a toggled action (feedback): aria-pressed and
// the --accent fill. An action works as a menu trigger (`asChild` chain), e.g. the regenerate menu.

function MessageActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      aria-label="Message actions"
      data-slot="message-actions"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  )
}

function MessageAction({
  label,
  pressed,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'aria-label'> & {
  /** Names the action: accessible name and tooltip. */
  label: string
  /** For toggles such as good / bad response. */
  pressed?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-slot="message-action"
          variant="ghost"
          intent="neutral"
          size="icon-sm"
          aria-label={label}
          aria-pressed={pressed}
          className={cn('aria-pressed:bg-accent', className)}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export { MessageActions, MessageAction }
