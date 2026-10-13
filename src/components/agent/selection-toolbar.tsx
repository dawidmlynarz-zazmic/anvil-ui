import * as React from 'react'

import { TextShimmer } from '@/components/agent/text-shimmer'
import { Toolbar, ToolbarButton, ToolbarSeparator } from '@/components/anvil/toolbar'
import { Command, CommandInput, CommandList } from '@/components/ui/command'
import { CornerDownLeftIcon, Icon, SparklesIcon, SquareIcon, type LucideIcon } from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Figma Agent Builder › Surfaces › Inline assist · selection toolbar (10748:5572): the AI toolbar
// that appears over selected text. Built on Toolbar (`size="compact"`: popover surface, 24px ghost
// buttons) + a menu, nothing re-drawn. Figma says "Toolbar + Dropdown Menu"; the menu is a Popover
// with a Command list instead, because a menu may not contain a text field (axe: a role="menu" only
// owns menu items) and this one starts with a prompt. Same look as the Dropdown Menu: the Command
// items and group headings are its items and titles.
// - SelectionToolbar: the bar. `children` are ToolbarButtons (Improve, Fix grammar, …), the first
//   usually a SelectionToolbarMenu ("Ask AI"). Figma state default · working: `working` swaps the
//   actions for a status line (sparkles + a Text Shimmer `workingLabel`) and Stop (`onStop`).
//   `expanded` is the menu open.
// - SelectionToolbarMenu: a ToolbarButton that opens a Popover (300px, radius md): a prompt row
//   first (Command Input with sparkles and a ↵ Kbd, focused on open) and a Command list of what you
//   pass — CommandGroups with a heading ("Edit", "Generate", "Translate") and CommandItems (36px,
//   icon, label, a chevron when it leads on). `children` can be a function that gets `close`, to
//   close after an item runs. Enter sends the typed prompt (`onPrompt`); arrow keys move through
//   the items and Enter runs the highlighted one. The list isn't filtered by the prompt.
// Positioning over the selection is the host page's job (a Popover or its own layer).

function SelectionToolbar({
  working = false,
  workingLabel = 'Working…',
  onStop,
  children,
  className,
  'aria-label': ariaLabel = 'AI actions on the selection',
  ...props
}: Omit<React.ComponentProps<typeof Toolbar>, 'size'> & {
  /** Figma state working: the assistant is editing the selection. */
  working?: boolean
  /** The status while working, e.g. "Rephrasing selection…". */
  workingLabel?: React.ReactNode
  /** Stop while working. */
  onStop?: () => void
}) {
  return (
    <Toolbar
      size="compact"
      aria-label={ariaLabel}
      aria-busy={working || undefined}
      data-slot="selection-toolbar"
      data-working={working || undefined}
      className={className}
      {...props}
    >
      {working ? (
        <>
          <span role="status" className="flex items-center gap-2 px-2 py-1">
            <Icon icon={SparklesIcon} tone="agent" size="xs" className="size-3.5" />
            <TextShimmer>{workingLabel}</TextShimmer>
          </span>
          <ToolbarSeparator />
          <ToolbarButton onClick={onStop}>
            <Icon icon={SquareIcon} />
            Stop
          </ToolbarButton>
        </>
      ) : (
        children
      )}
    </Toolbar>
  )
}

function SelectionToolbarMenu({
  label = 'Ask AI',
  icon = SparklesIcon,
  promptPlaceholder = 'Tell the assistant what to do',
  onPrompt,
  open,
  defaultOpen,
  onOpenChange,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarButton>, 'children'> & {
  /** The button's label. */
  label?: React.ReactNode
  icon?: LucideIcon
  promptPlaceholder?: string
  /** Enter in the prompt row: the instruction to run on the selection. */
  onPrompt?: (prompt: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** CommandGroups of CommandItems below the prompt, or a function that gets `close`. */
  children?: React.ReactNode | ((api: { close: () => void }) => React.ReactNode)
}) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false)
  const isOpen = open ?? innerOpen
  const setOpen = (next: boolean) => {
    setInnerOpen(next)
    onOpenChange?.(next)
  }
  const [prompt, setPrompt] = React.useState('')
  // Enter sends the prompt unless the user moved into the list with the arrow keys.
  const navigated = React.useRef(false)

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolbarButton className={className} {...props}>
          <Icon icon={icon} />
          {label}
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        data-slot="selection-toolbar-menu"
        align="start"
        aria-label="Ask the assistant"
        className="w-75 gap-0 rounded-md p-1.5"
      >
        <Command label="Prompt" shouldFilter={false} className="rounded-none bg-transparent">
          <CommandInput
            placeholder={promptPlaceholder}
            icon={SparklesIcon}
            wrapperClassName="mb-1 rounded-md border-2 border-ring px-2.5 py-2"
            end={
              <Kbd aria-hidden>
                <Icon icon={CornerDownLeftIcon} />
              </Kbd>
            }
            value={prompt}
            onValueChange={(next) => {
              navigated.current = false
              setPrompt(next)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') navigated.current = true
              if (event.key !== 'Enter' || navigated.current) return
              // cmdk would run the first item: here Enter sends what was typed (or does nothing).
              event.preventDefault()
              event.stopPropagation()
              if (!prompt.trim()) return
              onPrompt?.(prompt.trim())
              setPrompt('')
              setOpen(false)
            }}
          />
          <CommandList className="max-h-none p-0">
            {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { SelectionToolbar, SelectionToolbarMenu }
