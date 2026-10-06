import * as React from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { VoiceWaveform } from '@/components/agent/voice-waveform'
import {
  Icon,
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  ScreenShareIcon,
  VideoIcon,
  XIcon,
  type LucideIcon,
} from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › live voice session (10732:2715): full-screen live voice mode
// (mobile), on --background-inverse, radius 2xl. Top bar (20px): "Live" info badge, timer
// text/sm/medium, close. Stage: an --agent orb in --agent-muted glows (`status` listening; speaking
// adds a pulse and the Voice Waveform) or, for camera, the `cameraPreview` (3:4, radius lg) above a
// 56px orb; status line text/sm/medium. Transcript under it. Controls: 60px circles on
// --overlay-inverse-16 — mute, camera (on: --background), share screen — and end (--destructive).

type SessionStatus = 'listening' | 'speaking' | 'camera'

const STATUS_TEXT: Record<SessionStatus, string> = {
  listening: 'Listening…',
  speaking: 'Speaking · tap anywhere to interrupt',
  camera: 'Looking through your camera',
}

function Control({
  icon,
  label,
  pressed,
  tone = 'default',
  ...props
}: React.ComponentProps<'button'> & {
  icon: LucideIcon
  label: string
  pressed?: boolean
  tone?: 'default' | 'end'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        'flex size-15 items-center justify-center rounded-full outline-none transition-colors duration-(--duration-fast) focus-visible:focus-ring focus-visible:ring-offset-background-inverse',
        tone === 'end'
          ? 'bg-destructive text-destructive-foreground hover:bg-button-destructive-hover'
          : 'bg-overlay-inverse-16 text-foreground-inverse hover:bg-overlay-inverse-24 aria-pressed:bg-background aria-pressed:text-foreground',
      )}
      {...props}
    >
      <Icon icon={icon} className="size-6" />
    </button>
  )
}

function LiveVoiceSession({
  status = 'listening',
  elapsed,
  statusText,
  transcript,
  cameraPreview,
  muted = false,
  onMutedChange,
  cameraOn,
  onCameraChange,
  onShareScreen,
  onEnd,
  onClose,
  onInterrupt,
  className,
  ...props
}: React.ComponentProps<'section'> & {
  status?: SessionStatus
  /** Timer, e.g. "02:14". */
  elapsed?: React.ReactNode
  /** Overrides the status line. */
  statusText?: React.ReactNode
  /** The running transcript (e.g. the last exchange). */
  transcript?: React.ReactNode
  /** Camera mode: the live preview. */
  cameraPreview?: React.ReactNode
  muted?: boolean
  onMutedChange?: (muted: boolean) => void
  /** Defaults to on in camera mode. */
  cameraOn?: boolean
  onCameraChange?: (on: boolean) => void
  onShareScreen?: () => void
  onEnd?: () => void
  onClose?: () => void
  /** Speaking: tap anywhere on the stage to interrupt. */
  onInterrupt?: () => void
}) {
  const camera = cameraOn ?? status === 'camera'
  return (
    <section
      aria-label={props['aria-label'] ?? 'Live voice session'}
      data-slot="live-voice-session"
      data-status={status}
      className={cn(
        'flex h-195 w-full max-w-97.5 flex-col overflow-hidden rounded-2xl bg-background-inverse text-foreground-inverse',
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-2 p-5">
        <Badge variant="semantic" tone="info" size="xs" indicator>
          Live
        </Badge>
        <span className="flex-1 type-text-sm-medium tabular-nums">{elapsed}</span>
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-sm outline-none focus-visible:focus-ring focus-visible:ring-offset-background-inverse"
          >
            <Icon icon={XIcon} className="size-5" />
          </button>
        )}
      </header>
      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 px-5"
        onClick={status === 'speaking' ? onInterrupt : undefined}
      >
        {status === 'camera' ? (
          <>
            <div className="aspect-3/4 w-full max-h-90 overflow-hidden rounded-lg bg-accent">
              {cameraPreview}
            </div>
            <span aria-hidden className="size-14 rounded-full bg-agent" />
          </>
        ) : (
          <span aria-hidden className="relative flex size-60 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-agent-muted blur-2xl" />
            <span className="absolute inset-6 rounded-full bg-agent-muted blur-xl" />
            <span
              className={cn(
                'relative size-37.5 rounded-full bg-agent',
                status === 'speaking' && 'animate-pulse-dot',
              )}
            />
          </span>
        )}
        {status === 'speaking' && <VoiceWaveform />}
        <p aria-live="polite" className="text-center type-text-sm-medium">
          {statusText ?? STATUS_TEXT[status]}
        </p>
      </div>
      {transcript && (
        <div className="flex flex-col gap-2 px-16 py-4 type-text-sm-normal [&>*:first-child]:text-foreground-inverse/60">
          {transcript}
        </div>
      )}
      <div className="flex items-center justify-center gap-4 p-6">
        <Control
          icon={muted ? MicOffIcon : MicIcon}
          label={muted ? 'Unmute' : 'Mute'}
          pressed={muted}
          onClick={() => onMutedChange?.(!muted)}
        />
        <Control
          icon={VideoIcon}
          label={camera ? 'Turn camera off' : 'Turn camera on'}
          pressed={camera}
          onClick={() => onCameraChange?.(!camera)}
        />
        <Control icon={ScreenShareIcon} label="Share screen" onClick={onShareScreen} />
        <Control icon={PhoneOffIcon} label="End session" tone="end" onClick={onEnd} />
      </div>
    </section>
  )
}

export { LiveVoiceSession, type SessionStatus }
