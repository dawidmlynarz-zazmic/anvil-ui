import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon, SparklesIcon, WifiOffIcon, XIcon, type LucideIcon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Figma Agent Builder › Surfaces › Shell parts · launcher (10739:232): the floating button that opens
// the popover chat, 24px from the bottom-right edge. Built on Popover + Button (brand, circle,
// 56px, 24px glyph, shadow/lg), nothing re-drawn. `children` is the panel: a Chat Shell with
// `surface="popover"`, sized by the popover shell tokens (400 × 640) and opening above, right-aligned.
// Figma state → code: idle (default) · hover (`hover:`, --button-primary-hover + shadow/xl) ·
// unread (`unread` count: a destructive pill Badge with a --background ring) · attention (`preview`:
// a Card message beside the button, dismissed with `onDismissPreview`, and a pulse ring that stops
// under reduced motion) · open (Radix `open`: the glyph becomes X) · offline (`offline`: --muted
// button, wifi-off, shadow/sm).

function Launcher({
  open,
  defaultOpen,
  onOpenChange,
  unread = 0,
  preview,
  onDismissPreview,
  offline = false,
  icon = SparklesIcon,
  label = 'Open the assistant',
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Unread messages: the count on the button. */
  unread?: number
  /** Figma state attention: a short message from the agent beside the button. */
  preview?: React.ReactNode
  onDismissPreview?: () => void
  /** The agent can't be reached. */
  offline?: boolean
  /** The glyph on the button. */
  icon?: LucideIcon
  /** The button's accessible name. */
  label?: string
  /** The panel: a Chat Shell with surface="popover". */
  children?: React.ReactNode
}) {
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false)
  const isOpen = open ?? innerOpen
  const setOpen = (next: boolean) => {
    setInnerOpen(next)
    onOpenChange?.(next)
  }
  const glyph = isOpen ? XIcon : offline ? WifiOffIcon : icon

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <div
        data-slot="launcher"
        data-offline={offline || undefined}
        className={cn('fixed right-6 bottom-6 z-(--z-sticky) flex items-center gap-3', className)}
        {...props}
      >
        {preview && !isOpen && (
          <Card
            role="status"
            className="w-65 min-w-0 flex-row items-start gap-2.5 rounded-xl border-border bg-popover p-3 shadow-md"
          >
            <p className="min-w-0 flex-1 type-text-sm-normal">{preview}</p>
            {onDismissPreview && (
              <Button
                variant="ghost"
                intent="neutral"
                size="icon-xs"
                aria-label="Dismiss"
                onClick={onDismissPreview}
                className="-mt-1 -mr-1"
              >
                <Icon icon={XIcon} />
              </Button>
            )}
          </Card>
        )}
        <div className="relative">
          {preview && !isOpen && (
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-primary/30 motion-reduce:animate-none"
            />
          )}
          <PopoverTrigger asChild>
            <Button
              intent={offline ? 'neutral' : 'brand'}
              variant={offline ? 'ghost' : 'default'}
              shape="circle"
              size="icon-lg"
              aria-label={isOpen ? 'Close the assistant' : offline ? `${label} (offline)` : label}
              className={cn(
                'relative size-14 shadow-lg transition-shadow hover:shadow-xl [&_svg]:size-6',
                offline && 'bg-muted shadow-sm hover:shadow-sm',
              )}
            >
              <Icon icon={glyph} />
            </Button>
          </PopoverTrigger>
          {unread > 0 && !isOpen && (
            <Badge
              tone="destructive"
              shape="pill"
              size="sm"
              aria-label={`${unread} unread`}
              className="absolute -top-0.5 -right-1 min-w-5 justify-center px-1 ring-2 ring-background"
            >
              {unread}
            </Badge>
          )}
        </div>
      </div>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        aria-label="Assistant"
        className="h-(--shell-container-height) max-h-[calc(100dvh-7rem)] w-(--shell-container-width) max-w-[calc(100vw-3rem)] gap-0 overflow-hidden rounded-xl p-0"
        data-shell="popover"
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}

export { Launcher }
