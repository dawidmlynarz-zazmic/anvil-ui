import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckIcon, Icon, MinusIcon, PlusIcon, XIcon } from '@/components/ui/icon'

// Figma Agent Builder › Surfaces › Split canvas · document canvas (10745:4213) + diff line
// (10744:4006): a document artifact in the canvas, with the agent's suggested edits inline. Figma's
// header (title, version, sync, history / share / export, close) is the Artifact Panel's, so this is
// the panel's content, not a second shell: put a DocumentCanvas in an Artifact Panel and it fills
// the preview edge to edge.
// - DocumentCanvas: the --muted reading area (24px padding, 16px gap, centred) holding an optional
//   `review` bar (an Alert, agent tone, size sm, with Reject all / Accept all) and the page: --card,
//   --border, radius md, shadow/sm, --space-2xl × --space-3xl padding, 14px gap, up to 720px.
// - DocumentCanvasTitle (heading/2xl) and DocumentCanvasMeta (text/sm muted) head the page.
// - DocumentCanvasLine (diff line): one paragraph, text/base. Figma `type` unchanged · added ·
//   removed (content kind): a 16px marker column, then for changes a --success-subtle / --danger-subtle
//   row (radius sm, 8 × 6px) in the tone's strong text with a plus / minus and Accept / Reject (ghost
//   icon-xs Buttons, `onAccept` / `onReject`). Unchanged lines keep the marker column so text aligns.

function DocumentCanvas({
  review,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** The review bar above the page: an Alert (tone agent, size sm) with Reject all / Accept all. */
  review?: React.ReactNode
  /** The page: DocumentCanvasTitle, DocumentCanvasMeta, DocumentCanvasLines. */
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="document-canvas"
      className={cn(
        'flex min-h-full flex-1 flex-col items-center gap-4 bg-muted p-(--space-lg) *:w-full *:max-w-180',
        className,
      )}
      {...props}
    >
      {review}
      <article className="flex flex-col gap-3.5 rounded-md border border-border bg-card px-(--space-3xl) py-(--space-2xl) shadow-sm max-md:px-(--space-lg) max-md:py-(--space-lg)">
        {children}
      </article>
    </div>
  )
}

function DocumentCanvasTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="document-canvas-title"
      className={cn('type-heading-2xl text-foreground', className)}
      {...props}
    />
  )
}

function DocumentCanvasMeta({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="document-canvas-meta"
      className={cn('type-text-sm-normal text-muted-foreground', className)}
      {...props}
    />
  )
}

type LineType = 'unchanged' | 'added' | 'removed'

function DocumentCanvasLine({
  type = 'unchanged',
  onAccept,
  onReject,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Figma type: an unchanged paragraph, or a suggested addition / removal. */
  type?: LineType
  onAccept?: () => void
  onReject?: () => void
}) {
  const changed = type !== 'unchanged'
  const label = type === 'added' ? 'Added' : 'Removed'
  return (
    <div
      data-slot="document-canvas-line"
      data-type={type}
      className={cn(
        'flex items-start gap-2 rounded-sm px-2 py-1.5 type-text-base-normal text-foreground',
        'data-[type=added]:bg-success-subtle data-[type=added]:text-success-strong',
        'data-[type=removed]:bg-danger-subtle data-[type=removed]:text-danger-strong',
        className,
      )}
      {...props}
    >
      <span aria-hidden={!changed} className="flex h-6 w-4 shrink-0 items-center justify-center">
        {changed && <Icon icon={type === 'added' ? PlusIcon : MinusIcon} size="xs" label={label} />}
      </span>
      <p className="min-w-0 flex-1">{children}</p>
      {changed && (onAccept || onReject) && (
        <span className="flex shrink-0 gap-0.5">
          {onAccept && (
            <Button
              variant="ghost"
              intent="neutral"
              size="icon-xs"
              aria-label="Accept change"
              onClick={onAccept}
            >
              <Icon icon={CheckIcon} />
            </Button>
          )}
          {onReject && (
            <Button
              variant="ghost"
              intent="neutral"
              size="icon-xs"
              aria-label="Reject change"
              onClick={onReject}
            >
              <Icon icon={XIcon} />
            </Button>
          )}
        </span>
      )}
    </div>
  )
}

export { DocumentCanvas, DocumentCanvasTitle, DocumentCanvasMeta, DocumentCanvasLine }
