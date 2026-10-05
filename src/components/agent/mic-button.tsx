import * as React from 'react'

import { cn } from '@/lib/utils'
import { Icon, LoaderCircleIcon, MicIcon, MicOffIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › mic button (10735:3052): voice input. A 40px circle in a 64px
// frame (the rings live in the margin, outside the layout box). `status` idle (--background,
// --input stroke, mic) · listening (--destructive, white mic, two --destructive rings 52 / 64px
// that grow and fade; steady under reduced motion) · processing (--agent-subtle, agent spinner,
// aria-busy) · error (--danger-subtle, --danger-soft stroke, --danger mic-off). A toggle: pressed
// while listening. Pair with the Voice Waveform while listening.

type MicStatus = 'idle' | 'listening' | 'processing' | 'error'

const LABEL: Record<MicStatus, string> = {
  idle: 'Start voice input',
  listening: 'Stop voice input',
  processing: 'Processing voice input',
  error: 'Voice input failed, try again',
}

function MicButton({
  status = 'idle',
  label,
  className,
  ...props
}: Omit<React.ComponentProps<'button'>, 'aria-pressed'> & {
  status?: MicStatus
  /** Overrides the accessible name for the status. */
  label?: string
}) {
  const listening = status === 'listening'
  return (
    <button
      type="button"
      data-slot="mic-button"
      data-status={status}
      aria-label={label ?? LABEL[status]}
      aria-pressed={listening}
      aria-busy={status === 'processing' || undefined}
      className={cn(
        'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full outline-none',
        'transition-colors duration-(--duration-fast) focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
        status === 'idle' && 'bg-background text-foreground inset-ring inset-ring-input hover:bg-muted',
        listening && 'bg-destructive text-destructive-foreground hover:bg-button-destructive-hover',
        status === 'processing' && 'bg-agent-subtle text-agent dark:text-agent-medium',
        status === 'error' &&
          'bg-danger-subtle text-danger inset-ring inset-ring-danger-soft hover:bg-danger-soft',
        className,
      )}
      {...props}
    >
      {listening && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1.5 animate-mic-ring rounded-full bg-destructive/25"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 animate-mic-ring rounded-full bg-destructive/15 [animation-delay:0.4s]"
          />
        </>
      )}
      <Icon
        icon={status === 'processing' ? LoaderCircleIcon : status === 'error' ? MicOffIcon : MicIcon}
        className={cn('relative size-4.5', status === 'processing' && 'animate-spin')}
      />
    </button>
  )
}

export { MicButton, type MicStatus }
