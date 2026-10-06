import * as React from 'react'

import { cn } from '@/lib/utils'
import { expandMotion } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RatingScale } from '@/components/agent/rating-scale'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckIcon, Icon, PencilIcon } from '@/components/ui/icon'
import { Textarea } from '@/components/ui/textarea'

// Figma Agent Builder › Core Kit › rating (10726:1937): a satisfaction check after a task. Composed,
// nothing re-drawn: Card (--card, --border, radius xl, shadow/sm as drawn, ≤400px, 16px padding,
// 12px gap) → the question (text/sm/semibold) → Rating Scale → when rated, the thanks line (Figma
// part / meta item sm: 14px --success check + text/xs/medium) and the comment flow (with
// `onCommentSubmit`, on Collapsible): collapsed = "Add a comment" (ghost xs Button, pencil) →
// expanded = a Textarea (focused) + Cancel (ghost xs) and Submit (brand xs, off while empty) →
// submitted = the form closes and the line says "Thanks for the comment." (polite). Cancel or Escape
// collapses it and returns focus to Add a comment. `commentStatus` / `onCommentStatusChange` control
// it. Figma type → `kind` stars · faces · csat; state unrated · rated = `value`.
// The scale is Rating Scale (`@/components/agent/rating-scale`), shared with NPS.

type RatingKind = 'stars' | 'faces' | 'csat'
type CommentStatus = 'collapsed' | 'expanded' | 'submitted'

function Rating({
  kind = 'stars',
  question,
  value,
  defaultValue,
  onValueChange,
  lowLabel = 'Very unsatisfied',
  highLabel = 'Very satisfied',
  thanks = 'Thanks! Anything we could do better?',
  commentPlaceholder = 'What could be better?',
  commentSent = 'Thanks for the comment.',
  onCommentSubmit,
  commentStatus,
  defaultCommentStatus = 'collapsed',
  onCommentStatusChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'defaultValue'> & {
  kind?: RatingKind
  question: React.ReactNode
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** CSAT: the low end label. */
  lowLabel?: React.ReactNode
  /** CSAT: the high end label. */
  highLabel?: React.ReactNode
  /** Rated: the thanks line. */
  thanks?: React.ReactNode
  commentPlaceholder?: string
  /** Submitted: replaces the thanks line. */
  commentSent?: React.ReactNode
  /** Rated: shows "Add a comment"; Submit sends the comment. */
  onCommentSubmit?: (comment: string) => void
  /** The comment flow: collapsed → expanded → submitted. */
  commentStatus?: CommentStatus
  defaultCommentStatus?: CommentStatus
  onCommentStatusChange?: (status: CommentStatus) => void
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const [innerStatus, setInnerStatus] = React.useState(defaultCommentStatus)
  const status = commentStatus ?? innerStatus
  const [comment, setComment] = React.useState('')
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const setStatus = (next: CommentStatus) => {
    setInnerStatus(next)
    onCommentStatusChange?.(next)
  }
  const collapse = () => {
    setStatus('collapsed')
    // Back to the trigger once it is rendered again.
    requestAnimationFrame(() => triggerRef.current?.focus())
  }
  return (
    <Card
      data-slot="rating"
      data-kind={kind}
      data-rated={current !== undefined}
      className={cn('max-w-100 min-w-0 gap-3 rounded-xl border-border p-4 shadow-sm', className)}
      {...props}
    >
      <p className="type-text-sm-semibold text-foreground">{question}</p>
      <RatingScale
        scale={kind === 'csat' ? 'numbers' : kind}
        value={current}
        onValueChange={(next) => {
          setInner(next)
          onValueChange?.(next)
        }}
        lowLabel={kind === 'csat' ? lowLabel : undefined}
        highLabel={kind === 'csat' ? highLabel : undefined}
        aria-label={typeof question === 'string' ? question : 'Rating'}
      />
      {current !== undefined && (
        <Collapsible
          open={status === 'expanded'}
          onOpenChange={(open) => (open ? setStatus('expanded') : collapse())}
          className="flex flex-col items-start gap-2"
        >
          <p role="status" className="flex items-center gap-1 type-text-xs-medium text-foreground">
            <Icon icon={CheckIcon} size="xs" className="text-success dark:text-success-medium" />
            {status === 'submitted' ? commentSent : thanks}
          </p>
          {onCommentSubmit && status === 'collapsed' && (
            <CollapsibleTrigger asChild>
              <Button ref={triggerRef} variant="ghost" intent="neutral" size="xs">
                <Icon icon={PencilIcon} />
                Add a comment
              </Button>
            </CollapsibleTrigger>
          )}
          {onCommentSubmit && (
            <CollapsibleContent asChild className={expandMotion}>
              <form
                data-slot="rating-comment"
                className="flex w-full flex-col gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!comment.trim()) return
                  onCommentSubmit(comment.trim())
                  setComment('')
                  setStatus('submitted')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') collapse()
                }}
              >
                <Textarea
                  aria-label="Comment"
                  placeholder={commentPlaceholder}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  autoFocus
                  className="min-h-18"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" intent="neutral" size="xs" onClick={collapse}>
                    Cancel
                  </Button>
                  <Button type="submit" intent="brand" size="xs" disabled={!comment.trim()}>
                    Submit
                  </Button>
                </div>
              </form>
            </CollapsibleContent>
          )}
        </Collapsible>
      )}
    </Card>
  )
}

export { Rating, type RatingKind, type CommentStatus }
