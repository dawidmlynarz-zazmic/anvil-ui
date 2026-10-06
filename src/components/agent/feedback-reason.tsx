import * as React from 'react'

import { cn } from '@/lib/utils'
import { QuickReplyFilter } from '@/components/agent/quick-reply'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellCloseButton, ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CircleCheckIcon } from '@/components/ui/icon'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { Textarea } from '@/components/ui/textarea'

// Figma Agent Builder › Core Kit › feedback reason (10726:1783): opens after a thumbs-down. Composed,
// nothing re-drawn: Card (--card, --border, radius xl, shadow/sm as drawn, ≤480px) →
// - open: Shell Header card (12 / 16px, no divider: title text/sm/semibold + Close icon-xs) → the
//   reasons as Quick Reply Filters (multi-select toggle Chips, no leading icon; applied = agent tint
//   with ×), 8px apart and wrapping → Textarea (bare, "Tell us more (optional)") → `note` (text/xs
//   muted) → Shell Footer card: Cancel (ghost sm) + Send feedback (brand sm).
// - submitted: an Item row (16px): success Icon Tile (32px), title + description, Undo (ghost sm).
// Figma state → `status` open · submitted.

type FeedbackReasonStatus = 'open' | 'submitted'

function FeedbackReason({
  status = 'open',
  title = 'What went wrong?',
  reasons,
  selected,
  defaultSelected = [],
  onSelectedChange,
  comment,
  defaultComment,
  onCommentChange,
  placeholder = 'Tell us more (optional)',
  note,
  onSubmit,
  onCancel,
  onClose,
  submittedTitle = 'Thanks for the feedback',
  submittedDescription,
  onUndo,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'title' | 'onSubmit'> & {
  status?: FeedbackReasonStatus
  title?: React.ReactNode
  /** The reasons to pick from. */
  reasons: string[]
  selected?: string[]
  defaultSelected?: string[]
  onSelectedChange?: (selected: string[]) => void
  comment?: string
  defaultComment?: string
  onCommentChange?: (comment: string) => void
  placeholder?: string
  /** Under the comment, e.g. who may review it. */
  note?: React.ReactNode
  /** Send feedback: the picked reasons and the comment. */
  onSubmit?: (feedback: { reasons: string[]; comment: string }) => void
  /** Shows Cancel. */
  onCancel?: () => void
  /** Shows Close in the header. */
  onClose?: () => void
  submittedTitle?: React.ReactNode
  submittedDescription?: React.ReactNode
  /** Submitted: shows Undo. */
  onUndo?: () => void
}) {
  const [innerSelected, setInnerSelected] = React.useState(defaultSelected)
  const [innerComment, setInnerComment] = React.useState(defaultComment ?? '')
  const picked = selected ?? innerSelected
  const text = comment ?? innerComment
  const titleId = React.useId()

  const toggle = (reason: string, on: boolean) => {
    const next = on ? [...picked, reason] : picked.filter((r) => r !== reason)
    setInnerSelected(next)
    onSelectedChange?.(next)
  }

  if (status === 'submitted') {
    return (
      <Card
        data-slot="feedback-reason"
        data-status="submitted"
        className={cn('max-w-120 min-w-0 gap-0 rounded-xl border-border py-0 shadow-sm', className)}
        {...props}
      >
        <Item role="status" className="flex-nowrap rounded-none border-0 p-4">
          <IconTile icon={CircleCheckIcon} tone="success" size="sm" />
          <ItemContent className="gap-0.5">
            <ItemTitle className="type-text-sm-semibold">{submittedTitle}</ItemTitle>
            {submittedDescription && (
              <ItemDescription className="type-text-xs-normal">{submittedDescription}</ItemDescription>
            )}
          </ItemContent>
          {onUndo && (
            <ItemActions>
              <Button variant="ghost" intent="neutral" size="sm" onClick={onUndo}>
                Undo
              </Button>
            </ItemActions>
          )}
        </Item>
      </Card>
    )
  }

  return (
    <Card
      data-slot="feedback-reason"
      data-status="open"
      role="group"
      aria-labelledby={titleId}
      className={cn('max-w-120 min-w-0 gap-0 rounded-xl border-border py-0 shadow-sm', className)}
      {...props}
    >
      <ShellHeader
        variant="card"
        className="border-b-0 px-4 py-3"
        close={onClose && <ShellCloseButton size="icon-xs" onClick={onClose} />}
      >
        <ShellTitle id={titleId}>{title}</ShellTitle>
      </ShellHeader>
      <div className="flex flex-col gap-3 px-4 pb-4">
        <ul aria-label="Reasons" className="flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <li key={reason} className="flex">
              <QuickReplyFilter
                icon={null}
                pressed={picked.includes(reason)}
                onPressedChange={(on) => toggle(reason, on)}
              >
                {reason}
              </QuickReplyFilter>
            </li>
          ))}
        </ul>
        <Textarea
          aria-label="Comment"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setInnerComment(e.target.value)
            onCommentChange?.(e.target.value)
          }}
          className="min-h-18"
        />
        {note && <p className="type-text-xs-normal text-muted-foreground">{note}</p>}
      </div>
      <ShellFooter variant="card">
        {onCancel && (
          <Button variant="ghost" intent="neutral" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button intent="brand" size="sm" onClick={() => onSubmit?.({ reasons: picked, comment: text })}>
          Send feedback
        </Button>
      </ShellFooter>
    </Card>
  )
}

export { FeedbackReason, type FeedbackReasonStatus }
