import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icon, RotateCcwIcon, SquareIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › response controls (10735:3117), built on Button Group: a floating
// pill above the composer while a response runs. --popover, --border, fully rounded, 4px padding,
// pill buttons sm. `status` streaming (Stop generating, ghost, square icon) · stopped ("Stopped"
// text/xs/medium --muted-foreground + Regenerate ghost + Continue outline) · incomplete ("Reached
// the length limit" + Continue generating, primary). `message` overrides the status text, which is a
// polite live region.

type ResponseStatus = 'streaming' | 'stopped' | 'incomplete'

function ResponseControls({
  status = 'streaming',
  message,
  onStop,
  onRegenerate,
  onContinue,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  status?: ResponseStatus
  message?: React.ReactNode
  onStop?: () => void
  onRegenerate?: () => void
  onContinue?: () => void
}) {
  const text =
    message ??
    (status === 'stopped' ? 'Stopped' : status === 'incomplete' ? 'Reached the length limit' : null)
  return (
    <div
      role="group"
      aria-label="Response controls"
      data-slot="response-controls"
      data-status={status}
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-full border bg-popover p-1 text-popover-foreground',
        status !== 'streaming' && 'ps-3',
        className,
      )}
      {...props}
    >
      <span
        aria-live="polite"
        className={cn('type-text-xs-medium text-muted-foreground', !text && 'sr-only')}
      >
        {text}
      </span>
      {status === 'streaming' && (
        <Button variant="ghost" intent="neutral" size="sm" shape="pill" onClick={onStop}>
          <Icon icon={SquareIcon} />
          Stop generating
        </Button>
      )}
      {status === 'stopped' && (
        <>
          <Button variant="ghost" intent="neutral" size="sm" shape="pill" onClick={onRegenerate}>
            <Icon icon={RotateCcwIcon} />
            Regenerate
          </Button>
          <Button variant="outline" intent="neutral" size="sm" shape="pill" onClick={onContinue}>
            Continue
          </Button>
        </>
      )}
      {status === 'incomplete' && (
        <Button size="sm" shape="pill" onClick={onContinue}>
          Continue generating
        </Button>
      )}
    </div>
  )
}

export { ResponseControls, type ResponseStatus }
