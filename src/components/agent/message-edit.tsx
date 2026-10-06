import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  Icon,
  PencilIcon,
} from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › message edit (10728:2229): editing a sent user message, and
// moving between the branches an edit creates. Figma state editing = `MessageEditor`: the UI
// Textarea (its hint carries the branch note) + Cancel (ghost) and Send (primary, arrow) Buttons
// at the end — composed, not re-drawn. Escape cancels, ⌘/Ctrl+Enter sends. Figma state branched =
// `MessageBranch` under the bubble: "Edited" + previous / position / next + Edit and Copy (ghost
// icon-xs). Figma's "Edited" is --foreground-subtle; code uses --muted-foreground (contrast).

function MessageEditor({
  defaultValue,
  hint = 'Editing creates a new branch; the original is kept.',
  onCancel,
  onSend,
  className,
  ...props
}: Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  defaultValue?: string
  /** Shown under the editor; pass null to hide it. */
  hint?: React.ReactNode
  onCancel?: () => void
  onSend?: (value: string) => void
}) {
  const [value, setValue] = React.useState(defaultValue ?? '')
  const send = () => value.trim() && onSend?.(value.trim())
  return (
    <form
      data-slot="message-editor"
      className={cn('flex w-full max-w-(--shell-widget-max) flex-col gap-2', className)}
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
      {...props}
    >
      <Textarea
        aria-label="Edit message"
        hint={hint ?? undefined}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel?.()
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            send()
          }
        }}
      />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" intent="neutral" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!value.trim()}>
          <Icon icon={ArrowUpIcon} />
          Send
        </Button>
      </div>
    </form>
  )
}

function MessageBranch({
  index,
  count,
  label = 'Edited',
  onPrevious,
  onNext,
  onEdit,
  onCopy,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** 1-based branch shown. */
  index: number
  count: number
  label?: React.ReactNode
  onPrevious?: () => void
  onNext?: () => void
  onEdit?: () => void
  onCopy?: () => void
}) {
  return (
    <div
      data-slot="message-branch"
      className={cn('flex items-center gap-1 type-text-xs-normal text-muted-foreground', className)}
      {...props}
    >
      {label && <span>{label}</span>}
      <Button
        variant="ghost"
        intent="neutral"
        size="icon-xs"
        aria-label="Previous version"
        disabled={index <= 1}
        onClick={onPrevious}
      >
        <Icon icon={ChevronLeftIcon} />
      </Button>
      <span className="type-text-xs-medium tabular-nums">
        <span aria-hidden>
          {index} / {count}
        </span>
        <span className="sr-only">
          Version {index} of {count}
        </span>
      </span>
      <Button
        variant="ghost"
        intent="neutral"
        size="icon-xs"
        aria-label="Next version"
        disabled={index >= count}
        onClick={onNext}
      >
        <Icon icon={ChevronRightIcon} />
      </Button>
      {onEdit && (
        <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Edit" onClick={onEdit}>
          <Icon icon={PencilIcon} />
        </Button>
      )}
      {onCopy && (
        <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Copy" onClick={onCopy}>
          <Icon icon={CopyIcon} />
        </Button>
      )}
    </div>
  )
}

export { MessageEditor, MessageBranch }
