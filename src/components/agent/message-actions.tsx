import * as React from 'react'

import { cn } from '@/lib/utils'
import { Icon, ThumbsDownIcon, ThumbsUpIcon } from '@/components/ui/icon'
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
// `collapsed` folds an action away (width, margin and opacity animate; the action becomes inert and is
// skipped by the toolbar's arrow keys) and brings it back when it clears: `MessageFeedback` uses it so
// that choosing Good or Bad response folds the other one away, and choosing it again restores both.

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
  collapsed = false,
  menu,
  menuProps,
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarButton>, 'aria-label'> & {
  /** Names the action: accessible name and tooltip. */
  label: string
  /** For toggles such as good / bad response. */
  pressed?: boolean
  /** Folds the action away with a short animation, and brings it back when it is false again. */
  collapsed?: boolean
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
      // Radix's roving focus skips disabled items, so the arrow keys never land on a folded action.
      disabled={collapsed || props.disabled}
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
  const content = menu ? (
    <DropdownMenu {...menuProps}>
      {action}
      <DropdownMenuContent data-slot="message-action-menu" align="start" className="w-65 rounded-xl p-1.5">
        {menu}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    action
  )
  return (
    // A one-column grid that goes from 1fr to 0fr (animatable) clips the button; the negative margin
    // takes back the toolbar's 4px gap. Entering is base + ease-out, leaving fast + ease-in-out.
    <span
      data-slot="message-action-fold"
      data-collapsed={collapsed || undefined}
      inert={collapsed || undefined}
      className={cn(
        'grid grid-cols-[1fr] transition-[grid-template-columns,margin,opacity,scale] duration-(--duration-base) ease-out',
        'data-[collapsed=true]:-ms-1 data-[collapsed=true]:grid-cols-[0fr] data-[collapsed=true]:scale-90 data-[collapsed=true]:opacity-0',
        'data-[collapsed=true]:duration-(--duration-fast) data-[collapsed=true]:ease-in-out',
        // Reduced motion: only the fade; no scaling or sliding.
        'motion-reduce:transition-opacity motion-reduce:data-[collapsed=true]:scale-100',
      )}
    >
      <span className="min-w-0 overflow-clip [overflow-clip-margin:0.375rem] in-data-[collapsed=true]:[overflow-clip-margin:0]">
        {content}
      </span>
    </span>
  )
}

type MessageFeedbackValue = 'good' | 'bad' | null

/**
 * Good / Bad response as one exclusive choice: pressing one marks it and folds the other away;
 * pressing it again clears the vote and both are back. Controlled (`value`) or uncontrolled
 * (`defaultValue`); `onValueChange` gets 'good' · 'bad' · null. Put it inside `MessageActions`.
 */
function MessageFeedback({
  value,
  defaultValue = null,
  onValueChange,
  goodLabel = 'Good response',
  badLabel = 'Bad response',
}: {
  value?: MessageFeedbackValue
  defaultValue?: MessageFeedbackValue
  onValueChange?: (value: MessageFeedbackValue) => void
  goodLabel?: string
  badLabel?: string
}) {
  const [inner, setInner] = React.useState<MessageFeedbackValue>(defaultValue)
  const vote = value === undefined ? inner : value
  const choose = (next: 'good' | 'bad') => {
    const result = vote === next ? null : next
    setInner(result)
    onValueChange?.(result)
  }
  return (
    <>
      <MessageAction
        label={goodLabel}
        pressed={vote === 'good'}
        collapsed={vote === 'bad'}
        onClick={() => choose('good')}
      >
        <Icon icon={ThumbsUpIcon} />
      </MessageAction>
      <MessageAction
        label={badLabel}
        pressed={vote === 'bad'}
        collapsed={vote === 'good'}
        onClick={() => choose('bad')}
      >
        <Icon icon={ThumbsDownIcon} />
      </MessageAction>
    </>
  )
}

export { MessageActions, MessageAction, MessageFeedback, type MessageFeedbackValue }
