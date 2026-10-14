import * as React from 'react'

import { cn } from '@/lib/utils'
import { Toolbar, ToolbarButton, ToolbarSeparator } from '@/components/anvil/toolbar'
import { CheckIcon, CornerDownLeftIcon, Icon, PencilIcon, RotateCcwIcon, XIcon } from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'

// Figma Agent Builder › Surfaces › Inline assist · inline suggestion (10748:5681): an in-place
// preview of an AI edit, with what to do about it. Built on Toolbar (`size="compact"`) + Button + Kbd,
// nothing re-drawn:
// - `original`: the text the suggestion applies to. Figma mode replace → struck through in
//   --foreground-subtle (a `<del>`); insert → the paragraph stays as is and the suggestion follows.
// - the suggestion (`children`): an `<ins>` block — --agent-subtle, a 2px --agent bar on the start,
//   12 × 10px padding, text/base like the document around it.
// - the actions bar: Replace / Insert (`mode`; brand · xs, check icon) + a ↵ Kbd, a separator,
//   Discard + an esc Kbd, a separator, Try again, Edit prompt.
// Keyboard: with focus on the block, Enter accepts and Escape discards (the Kbds say so); focus on a
// button keeps that button's own Enter. The block is a labelled group the host can focus.

type SuggestionMode = 'replace' | 'insert'

function InlineSuggestion({
  mode = 'replace',
  original,
  onAccept,
  onDiscard,
  onRetry,
  onEditPrompt,
  className,
  children,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onChange'> & {
  /** Figma mode: replace the original, or insert the suggestion after it. */
  mode?: SuggestionMode
  /** The text the suggestion is about. */
  original?: React.ReactNode
  /** Replace / Insert (also Enter on the block). */
  onAccept?: () => void
  /** Discard (also Escape). */
  onDiscard?: () => void
  onRetry?: () => void
  onEditPrompt?: () => void
  /** The suggested text. */
  children: React.ReactNode
}) {
  const accept = mode === 'insert' ? 'Insert' : 'Replace'
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the group is a keyboard target for Tab / Enter / Escape shortcuts (see the usage guide)
    <div
      data-slot="inline-suggestion"
      data-mode={mode}
      role="group"
      aria-label="Suggested edit"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the group is a keyboard target for the shortcuts
      tabIndex={0}
      className={cn(
        'flex w-full max-w-160 flex-col items-start gap-1.5 rounded-sm outline-none focus-visible:focus-ring',
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || event.target !== event.currentTarget) return
        if (event.key === 'Enter') {
          event.preventDefault()
          onAccept?.()
        } else if (event.key === 'Escape') {
          event.preventDefault()
          onDiscard?.()
        }
      }}
      {...props}
    >
      {original && (
        <p
          className={cn(
            'w-full type-text-base-normal',
            mode === 'replace' ? 'text-foreground-subtle' : 'text-foreground',
          )}
        >
          {mode === 'replace' ? <del>{original}</del> : original}
        </p>
      )}
      <p className="w-full border-s-2 border-agent bg-agent-subtle px-3 py-2.5 type-text-base-normal text-foreground">
        <ins className="no-underline">{children}</ins>
      </p>
      <Toolbar size="compact" aria-label="Suggested edit actions">
        <ToolbarButton variant="default" intent="brand" onClick={onAccept} aria-keyshortcuts="Enter">
          <Icon icon={CheckIcon} />
          {accept}
        </ToolbarButton>
        <Kbd aria-hidden>
          <Icon icon={CornerDownLeftIcon} />
        </Kbd>
        <ToolbarSeparator />
        <ToolbarButton onClick={onDiscard} aria-keyshortcuts="Escape">
          <Icon icon={XIcon} />
          Discard
        </ToolbarButton>
        <Kbd aria-hidden>esc</Kbd>
        <ToolbarSeparator />
        <ToolbarButton onClick={onRetry}>
          <Icon icon={RotateCcwIcon} />
          Try again
        </ToolbarButton>
        <ToolbarButton onClick={onEditPrompt}>
          <Icon icon={PencilIcon} />
          Edit prompt
        </ToolbarButton>
      </Toolbar>
    </div>
  )
}

export { InlineSuggestion, type SuggestionMode }
