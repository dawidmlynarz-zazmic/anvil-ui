import * as React from 'react'

import { cn } from '@/lib/utils'
import { MessageActions } from '@/components/agent/message-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Icon, ImageIcon, SparklesIcon } from '@/components/ui/icon'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Figma Agent Builder › Core Kit › image generation card (10732:2829): an image the agent generates,
// with its prompt. Composed, nothing re-drawn: Card (--card, --border, radius xl, up to 480px); the
// prompt row (Figma part / meta item: 12px agent sparkles + text/xs muted); a 16px-inset media area
// (radius lg): generating = Empty on --muted (28px image icon + `statusText` text/xs/medium agent),
// ready = your `<img>`, variations = a 2 × 2 single-choice Toggle Group of images (8px gap; selected
// = 3px --border-action ring); the action row (16 / 12px): generating shows a note (text/xs, Figma
// --foreground-subtle → --muted-foreground for contrast) and Cancel (ghost xs); ready and variations
// show `actions` in Message Actions (pass MessageAction icon-xs: download, edit, regenerate, copy)
// and the primary action — Variations (outline xs) or Use selected (brand xs).
// Figma state → `status` generating · ready · variations. Figma widget media type=generated is this.

type GenerationStatus = 'generating' | 'ready' | 'variations'

function ImageGenerationCard({
  status = 'ready',
  prompt,
  statusText = 'Generating',
  note = 'Generated images may not be accurate.',
  onCancel,
  actions,
  primaryAction,
  variations,
  selected,
  onSelectedChange,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Card> & {
  status?: GenerationStatus
  /** The prompt the image was generated from. */
  prompt: React.ReactNode
  /** Generating: e.g. "Generating · 8s". */
  statusText?: React.ReactNode
  /** Generating: the disclaimer beside Cancel. */
  note?: React.ReactNode
  onCancel?: () => void
  /** Ready / variations: MessageAction items (download, edit, regenerate, copy). */
  actions?: React.ReactNode
  /** Ready: Variations (outline xs); variations: Use selected (brand xs). */
  primaryAction?: React.ReactNode
  /** Variations: the candidate images by value. */
  variations?: { value: string; image: React.ReactNode; label: string }[]
  selected?: string
  onSelectedChange?: (value: string) => void
  /** Ready: the generated `<img>`. */
  children?: React.ReactNode
}) {
  return (
    <Card
      data-slot="image-generation-card"
      data-status={status}
      aria-busy={status === 'generating' || undefined}
      className={cn(
        'max-w-120 min-w-0 gap-0 overflow-hidden rounded-xl border-border bg-card py-0',
        className,
      )}
      {...props}
    >
      <p className="flex min-w-0 items-center gap-1 px-4 pt-3 pb-2 type-text-xs-normal text-muted-foreground">
        <Icon icon={SparklesIcon} size="xs" className="text-agent dark:text-agent-medium" />
        <span className="truncate">{prompt}</span>
      </p>
      <div className="px-4">
        {status === 'generating' && (
          <Empty className="aspect-video gap-2 rounded-lg border-0 bg-muted p-0 md:p-0">
            <EmptyMedia className="mb-0 text-muted-foreground [&_svg]:size-7">
              <Icon icon={ImageIcon} />
            </EmptyMedia>
            <EmptyDescription
              className="type-text-xs-medium text-agent dark:text-agent-medium"
              aria-live="polite"
            >
              {statusText}
            </EmptyDescription>
          </Empty>
        )}
        {status === 'ready' && (
          <div className="aspect-video overflow-hidden rounded-lg bg-accent *:[img]:size-full *:[img]:object-cover">
            {children}
          </div>
        )}
        {status === 'variations' && variations && (
          <ToggleGroup
            type="single"
            value={selected}
            onValueChange={(value) => value && onSelectedChange?.(value)}
            aria-label="Variations"
            spacing={2}
            className="grid w-full grid-cols-2"
          >
            {variations.map((v) => (
              <ToggleGroupItem
                key={v.value}
                value={v.value}
                aria-label={v.label}
                className="aspect-video h-auto w-full overflow-hidden rounded-lg bg-accent p-0 data-[state=on]:bg-accent data-[state=on]:ring-3 data-[state=on]:ring-border-action *:[img]:size-full *:[img]:object-cover"
              >
                {v.image}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-1 px-4 py-3">
        {status === 'generating' ? (
          <>
            <p className="min-w-0 flex-1 type-text-xs-normal text-muted-foreground">{note}</p>
            {onCancel && (
              <Button variant="ghost" intent="neutral" size="xs" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </>
        ) : (
          <>
            {actions && <MessageActions className="gap-1">{actions}</MessageActions>}
            <span className="flex-1" />
            {primaryAction}
          </>
        )}
      </div>
    </Card>
  )
}

export { ImageGenerationCard, type GenerationStatus }
