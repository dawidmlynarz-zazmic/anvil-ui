import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icon, LoaderCircleIcon, MicIcon, MicOffIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › mic button (10735:3052): voice input. A 40px circle in a 64px
// frame (the rings live in the margin, outside the layout box). Built on Button (circle): idle =
// outline neutral, listening = solid destructive; processing and error keep their Figma tints. `size`
// default (40px) · sm (32px, Prompt Input's toolbar). `status` idle (--background,
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
  size = 'default',
  label,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'aria-pressed' | 'size' | 'variant' | 'intent' | 'shape'> & {
  status?: MicStatus
  /** default 40px (Figma) · sm 32px (inside Prompt Input's toolbar). */
  size?: 'default' | 'sm'
  /** Overrides the accessible name for the status. */
  label?: string
}) {
  const listening = status === 'listening'
  return (
    <Button
      data-slot="mic-button"
      data-status={status}
      variant={listening ? 'default' : 'outline'}
      intent={listening ? 'destructive' : 'neutral'}
      size={size === 'sm' ? 'icon-sm' : 'icon'}
      shape="circle"
      aria-label={label ?? LABEL[status]}
      aria-pressed={listening}
      aria-busy={status === 'processing' || undefined}
      className={cn(
        'relative overflow-visible',
        status === 'processing' &&
          'bg-agent-subtle text-agent inset-ring-0 hover:bg-agent-subtle dark:text-agent-medium',
        status === 'error' &&
          'bg-danger-subtle text-danger inset-ring-danger-soft hover:bg-danger-soft dark:text-danger-medium',
        className,
      )}
      {...props}
    >
      {listening && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1.5 animate-mic-ring rounded-full bg-destructive/30"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 animate-mic-ring rounded-full bg-destructive/20 [animation-delay:0.4s]"
          />
        </>
      )}
      <Icon
        icon={status === 'processing' ? LoaderCircleIcon : status === 'error' ? MicOffIcon : MicIcon}
        className={cn(
          'relative',
          size === 'sm' ? 'size-4' : 'size-4.5',
          status === 'processing' && 'animate-spin',
        )}
      />
    </Button>
  )
}

export { MicButton, type MicStatus }
