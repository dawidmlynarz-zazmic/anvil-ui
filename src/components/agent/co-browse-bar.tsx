import * as React from 'react'

import { cn } from '@/lib/utils'
import { PulseDot } from '@/components/agent/pulse-dot'
import { Button } from '@/components/ui/button'
import { CircleCheckIcon, HandIcon, Icon, PauseIcon, PlayIcon, SquareIcon, XIcon } from '@/components/ui/icon'

// Figma Agent Builder › Surfaces › Ambient overlay · co-browse bar (10752:6787): the control bar
// while the agent acts on the page. Built on Button (inverse intent, pill shape) + Pulse Dot, nothing
// re-drawn. An inverse floating pill (--background-inverse, --foreground-inverse, elevation/raised
// where Figma has shadow/lg), 12px start / 6px end padding, 8px gap. Figma state → `status`:
// - working: pulse dot, the message (text/sm/medium), Pause (`onPause`), Take over (`onTakeOver`),
//   and Stop (destructive, `onStop`).
// - paused: a pause glyph, the message, Resume (`onResume`) and Stop.
// - done: a check, the message, Review (`onReview`) and a dismiss button (`onDismiss`).
// The message is a polite status, so a change of state is announced; the bar is a named group and
// every control is a real button.

type CoBrowseStatus = 'working' | 'paused' | 'done'

function CoBrowseBar({
  status = 'working',
  onPause,
  onResume,
  onTakeOver,
  onStop,
  onReview,
  onDismiss,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Figma state working · paused · done. */
  status?: CoBrowseStatus
  onPause?: () => void
  onResume?: () => void
  onTakeOver?: () => void
  onStop?: () => void
  onReview?: () => void
  onDismiss?: () => void
}) {
  return (
    <div
      data-slot="co-browse-bar"
      data-status={status}
      role="group"
      aria-label="Assistant controls"
      className={cn(
        'flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1.5 rounded-full bg-background-inverse py-1.5 pe-1.5 ps-3 text-foreground-inverse shadow-elevation-raised',
        className,
      )}
      {...props}
    >
      {status === 'working' ? <PulseDot /> : <Icon icon={status === 'done' ? CircleCheckIcon : PauseIcon} />}
      <p role="status" className="min-w-0 type-text-sm-medium">
        {children}
      </p>
      {status === 'working' && (
        <>
          <Button variant="ghost" intent="inverse" size="sm" shape="pill" onClick={onPause}>
            <Icon icon={PauseIcon} />
            Pause
          </Button>
          <Button variant="ghost" intent="inverse" size="sm" shape="pill" onClick={onTakeOver}>
            <Icon icon={HandIcon} />
            Take over
          </Button>
        </>
      )}
      {status === 'paused' && (
        <Button intent="inverse" size="sm" shape="pill" onClick={onResume}>
          <Icon icon={PlayIcon} />
          Resume
        </Button>
      )}
      {status === 'done' && (
        <Button intent="inverse" size="sm" shape="pill" onClick={onReview}>
          Review
        </Button>
      )}
      {status !== 'done' && (
        <Button intent="destructive" size="sm" shape="pill" onClick={onStop}>
          <Icon icon={SquareIcon} />
          Stop
        </Button>
      )}
      {status === 'done' && (
        <Button
          variant="ghost"
          intent="inverse"
          size="icon-sm"
          shape="circle"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <Icon icon={XIcon} />
        </Button>
      )}
    </div>
  )
}

export { CoBrowseBar, type CoBrowseStatus }
