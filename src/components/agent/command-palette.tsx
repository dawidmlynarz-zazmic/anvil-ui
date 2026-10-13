import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { TextShimmer } from '@/components/agent/text-shimmer'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShortcutHint } from '@/components/anvil/shortcut-hint'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CommandDialog, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  CircleHelpIcon,
  CopyIcon,
  Icon,
  MessageSquareIcon,
  SparklesIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

// Figma Agent Builder › Surfaces › In-page assist · command palette (10750:6219): ⌘K search that
// also takes a question or a task. Built on Command Dialog (cmdk) + Badge + Button + Shortcut Hint (the answer's Sources are Citation Chips and
// the progress steps are Tool Log Lines, passed in), nothing re-drawn. The palette item is the Command item.
// Figma state → content, not a prop: idle / results are the groups you pass (`children`); ai answer
// is `answer`; executing is `progress`; the parsed request is `understood`.
// - CommandPalette: the dialog (640px, radius xl, no close button: Esc is in the input), a prompt row
//   (search glyph, or sparkles when `ai`), the parse status row (Figma parse status: `parseStatus` parsing · understood · unclear, with the
//   `understood` tokens), the
//   answer or progress panel, the list, and the legend row (--muted, `legend` = ShortcutHint list).
//   The list is not filtered by the text (the host decides what matches; `commandProps` can turn it
//   on). `children` are CommandGroups of CommandPaletteItems.
// - CommandPaletteItem: a Command item with a 32px Icon Tile, `label` (text/sm/medium), `meta`
//   (text/xs --muted-foreground) and an optional `shortcut` (Kbd group). `kind` ask (surface tile) ·
//   action (info tile) · page and person (neutral tile) is the Figma `type`.
// - CommandPaletteAnswer: the AI answer card (--agent-subtle): the assistant's name, the text,
//   Sources (Citation Chips) and the actions (`Continue in chat`, `Copy`).
// - CommandPaletteProgress: the executing panel: Tool Log Lines for the steps, then the actions.

type PaletteItemKind = 'ask' | 'action' | 'page' | 'person'

const KIND_TILE = { ask: 'surface', action: 'info', page: 'neutral', person: 'neutral' } as const

function CommandPaletteItem({
  kind = 'action',
  icon,
  label,
  meta,
  shortcut,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CommandItem>, 'children'> & {
  /** Figma type: ask the assistant · an action · a page or article · a person. */
  kind?: PaletteItemKind
  icon: LucideIcon
  label: React.ReactNode
  meta?: React.ReactNode
  /** Keys shown at the end, e.g. `['⌘', 'H']`. */
  shortcut?: string[]
}) {
  return (
    <CommandItem data-kind={kind} className={cn('h-auto gap-3 px-2.5 py-2', className)} {...props}>
      <IconTile icon={icon} tone={KIND_TILE[kind]} size="sm" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate type-text-sm-medium">{label}</span>
        {meta && <span className="truncate type-text-xs-normal text-muted-foreground">{meta}</span>}
      </span>
      {shortcut && (
        <KbdGroup aria-hidden>
          {shortcut.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </KbdGroup>
      )}
    </CommandItem>
  )
}

function CommandPaletteAnswer({
  name,
  sources,
  onContinue,
  continueLabel = 'Continue in chat',
  onCopy,
  copyLabel = 'Copy',
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'section'>, 'name'> & {
  /** Who answers, e.g. "Anvil UI Kit". */
  name: React.ReactNode
  /** Citation Chips for the sources. */
  sources?: React.ReactNode
  onContinue?: () => void
  continueLabel?: React.ReactNode
  onCopy?: () => void
  copyLabel?: React.ReactNode
}) {
  return (
    <section
      data-slot="command-palette-answer"
      className={cn('flex flex-col gap-2.5 rounded-lg bg-agent-subtle p-3', className)}
      {...props}
    >
      <p className="flex items-center gap-1 type-text-xs-semibold text-agent-strong dark:text-foreground">
        <Icon icon={SparklesIcon} size="xs" tone="agent" />
        {name}
      </p>
      <div className="type-text-sm-normal text-foreground">{children}</div>
      {sources && (
        <div className="flex items-center gap-1.5 type-text-xs-normal text-muted-foreground">
          Sources {sources}
        </div>
      )}
      {(onContinue || onCopy) && (
        <div className="flex gap-1.5">
          {onContinue && (
            <Button variant="outline" intent="neutral" size="xs" onClick={onContinue}>
              <Icon icon={MessageSquareIcon} />
              {continueLabel}
            </Button>
          )}
          {onCopy && (
            <Button variant="ghost" intent="neutral" size="xs" onClick={onCopy}>
              <Icon icon={CopyIcon} />
              {copyLabel}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

function CommandPaletteProgress({
  actions,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Buttons after the steps: Open in chat, Cancel. */
  actions?: React.ReactNode
}) {
  return (
    <div
      data-slot="command-palette-progress"
      role="status"
      aria-live="polite"
      className={cn('flex flex-col gap-1 rounded-lg border border-border bg-card p-3', className)}
      {...props}
    >
      {children}
      {actions && <div className="flex gap-1.5 pt-1">{actions}</div>}
    </div>
  )
}

const DEFAULT_LEGEND = (
  <>
    <ShortcutHint keys={['↑', '↓']}>Navigate</ShortcutHint>
    <ShortcutHint keys={['↵']}>Select</ShortcutHint>
    <ShortcutHint keys={['⌘', '↵']}>Ask AI</ShortcutHint>
    <ShortcutHint keys={['esc']}>Close</ShortcutHint>
  </>
)

function CommandPalette({
  open,
  onOpenChange,
  query,
  onQueryChange,
  placeholder = 'Search or ask anything…',
  ai = false,
  parseStatus = 'understood',
  parsingLabel = 'Understanding your request…',
  understood,
  understoodLabel = 'Understood:',
  answer,
  progress,
  legend = DEFAULT_LEGEND,
  commandProps,
  onOpenAutoFocus,
  title = 'Command palette',
  description = 'Search, ask a question or run an action',
  className,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  query?: string
  onQueryChange?: (query: string) => void
  placeholder?: string
  /** The text is a request for the assistant: the prompt row shows sparkles instead of search. */
  ai?: boolean
  /** Figma parse status: parsing (a shimmering line) · understood · unclear (a question and the options as tokens). */
  parseStatus?: 'parsing' | 'understood' | 'unclear'
  parsingLabel?: React.ReactNode
  /** What the assistant parsed from the request, e.g. `['Book', '2 tickets']`: shown as tokens (the options when unclear). */
  understood?: string[]
  /** The row's lead text: “Understood:”, or the question when unclear (“Which performance?”). */
  understoodLabel?: React.ReactNode
  /** A CommandPaletteAnswer, above the list. */
  answer?: React.ReactNode
  /** A CommandPaletteProgress, in place of the list. */
  progress?: React.ReactNode
  /** The legend row: Shortcut Hints. Pass `null` to hide it. */
  legend?: React.ReactNode
  commandProps?: React.ComponentProps<typeof CommandDialog>['commandProps']
  /** Radix's initial focus: the prompt row by default. */
  onOpenAutoFocus?: (event: Event) => void
  title?: string
  description?: string
  className?: string
  /** CommandGroups of CommandPaletteItems. */
  children?: React.ReactNode
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      showCloseButton={false}
      contentProps={{ onOpenAutoFocus }}
      commandProps={{ shouldFilter: false, label: title, ...commandProps }}
      className={cn('max-w-160 gap-0 rounded-xl', className)}
    >
      <CommandInput
        icon={ai ? SparklesIcon : undefined}
        placeholder={placeholder}
        value={query}
        onValueChange={onQueryChange}
        wrapperClassName="px-4 py-3"
        end={<Kbd aria-hidden>esc</Kbd>}
      />
      {(parseStatus === 'parsing' || understood) && (
        <div
          data-slot="command-palette-parse"
          data-status={parseStatus}
          role="status"
          className={cn(
            'mx-2 mt-2 flex flex-wrap items-center gap-1.5 rounded-md px-2.5 py-1.5',
            parseStatus === 'unclear' ? 'bg-warning-subtle' : 'bg-agent-subtle',
          )}
        >
          {parseStatus === 'parsing' ? (
            <>
              <PulseDot />
              <TextShimmer className="type-text-xs-medium">{parsingLabel}</TextShimmer>
            </>
          ) : (
            <>
              <Icon
                icon={parseStatus === 'unclear' ? CircleHelpIcon : SparklesIcon}
                size="xs"
                tone={parseStatus === 'unclear' ? 'warning' : 'agent'}
                className="size-3.5"
              />
              <span
                className={cn(
                  'type-text-xs-medium',
                  parseStatus === 'unclear'
                    ? 'text-warning-strong dark:text-foreground'
                    : 'text-agent-strong dark:text-foreground',
                )}
              >
                {understoodLabel}
              </span>
              {understood?.map((token) => (
                <Badge
                  key={token}
                  variant="outline"
                  tone={parseStatus === 'unclear' ? 'warning' : 'agent'}
                  size="sm"
                  className="text-foreground"
                >
                  {token}
                </Badge>
              ))}
            </>
          )}
        </div>
      )}
      {answer && <div className="px-2 pt-2">{answer}</div>}
      {progress && <div className="p-2">{progress}</div>}
      <CommandList hidden={!!progress} className="max-h-96">
        {children}
      </CommandList>
      {legend && (
        <div data-slot="command-palette-legend" className="flex items-center gap-4 bg-muted px-4 py-2.5">
          {legend}
        </div>
      )}
    </CommandDialog>
  )
}

export {
  CommandPalette,
  CommandPaletteAnswer,
  CommandPaletteItem,
  CommandPaletteProgress,
  type PaletteItemKind,
}
