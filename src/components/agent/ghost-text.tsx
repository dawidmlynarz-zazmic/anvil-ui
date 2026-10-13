import * as React from 'react'

import { cn } from '@/lib/utils'
import { CheckIcon, Icon } from '@/components/ui/icon'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group'
import { ShortcutHint } from '@/components/anvil/shortcut-hint'

// Figma Agent Builder › Surfaces › Inline assist · ghost text (10748:5716): inline autocomplete in a
// text field. Built on Input Group (a Textarea, with the hint as a block-end addon) + Shortcut Hint, nothing
// re-drawn. The typed text is real; the `suggestion` is drawn after it in --foreground-subtle by a
// mirror layer (same box, type and wrapping, hidden from assistive tech) behind the transparent
// textarea. Tab at the end of the text accepts it (`onAccept`), Escape dismisses it (`onDismiss`).
// Figma state → suggesting (the hint "Tab to accept", the group's focus stroke while typing) ·
// accepted (a check and "Accepted" until the next edit). Text is text/sm like Input and Textarea
// (Figma draws text/base here: a deviation, noted in the status doc).

function GhostText({
  value,
  defaultValue = '',
  onValueChange,
  suggestion,
  onAccept,
  onDismiss,
  acceptedLabel = 'Accepted',
  className,
  placeholder,
  disabled,
  ...props
}: Omit<React.ComponentProps<'textarea'>, 'value' | 'defaultValue' | 'onChange'> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** The completion after the caret; omit when there is none. */
  suggestion?: string
  /** Tab accepted it: the completion that was added. The text is already updated. */
  onAccept?: (suggestion: string) => void
  /** Escape dismissed it. */
  onDismiss?: () => void
  /** The hint after accepting. */
  acceptedLabel?: React.ReactNode
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const [accepted, setAccepted] = React.useState(false)
  const text = value ?? inner
  const suggesting = !!suggestion && !accepted && !disabled
  const set = (next: string) => {
    setInner(next)
    onValueChange?.(next)
  }

  return (
    <InputGroup
      data-slot="ghost-text"
      data-state={accepted ? 'accepted' : suggesting ? 'suggesting' : undefined}
      className={cn('h-auto flex-col items-stretch', className)}
      data-disabled={disabled || undefined}
    >
      <div className="grid w-full">
        <div
          aria-hidden
          className="pointer-events-none col-start-1 row-start-1 py-3 type-text-sm-normal break-words whitespace-pre-wrap"
        >
          <span className="invisible">{text}</span>
          {suggesting && <span className="text-foreground-subtle">{suggestion}</span>}
          {'​'}
        </div>
        <InputGroupTextarea
          {...props}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={suggesting ? undefined : props['aria-describedby']}
          onChange={(event) => {
            setAccepted(false)
            set(event.target.value)
          }}
          onKeyDown={(event) => {
            props.onKeyDown?.(event)
            if (event.defaultPrevented) return
            const field = event.currentTarget
            if (
              event.key === 'Tab' &&
              !event.shiftKey &&
              suggesting &&
              field.selectionStart === text.length &&
              field.selectionEnd === text.length
            ) {
              event.preventDefault()
              set(text + suggestion)
              setAccepted(true)
              onAccept?.(suggestion)
            } else if (event.key === 'Escape' && suggesting) {
              event.preventDefault()
              onDismiss?.()
            }
          }}
          className="col-start-1 row-start-1 h-full min-h-0 [field-sizing:fixed] py-3 overflow-hidden"
        />
      </div>
      {(suggesting || accepted) && (
        <InputGroupAddon
          align="block-end"
          className="gap-1.5 pt-0 pb-3 type-text-xs-normal text-muted-foreground"
        >
          {accepted ? (
            <>
              <Icon icon={CheckIcon} size="xs" className="text-success-medium" />
              <span role="status">{acceptedLabel}</span>
            </>
          ) : (
            <ShortcutHint keys={['Tab']}>to accept</ShortcutHint>
          )}
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

export { GhostText }
