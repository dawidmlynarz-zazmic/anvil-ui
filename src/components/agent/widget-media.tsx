import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { VoiceWaveform } from '@/components/agent/voice-waveform'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { CircleAlertIcon, DownloadIcon, Icon, PauseIcon, PlayIcon } from '@/components/ui/icon'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

// Figma Agent Builder › Core Kit › widget media (10663:3268) and widget audio (10663:3468), one
// component (Figma: "widget-media (audio)"). Composed, nothing re-drawn:
// - `kind` image: Card (radius xl, --border, overflow hidden) → a 16:9 --muted media area (your
//   `<img>` as children when ready; Empty with "Loading media" or the error otherwise) → an Item
//   footer (16 / 12px): title text/sm/semibold, `meta` text/xs muted, Download (ghost icon-sm).
// - `kind` audio: Card (radius 2xl) → an Item row (16 / 12px, 12px gap): Play / Pause (a 40px brand
//   circle Button), title + Voice Waveform with `progress` (played bars --foreground-link), and
//   `duration` text/xs muted; invalid swaps the button for a destructive Icon Tile and the waveform
//   for the error (text/xs --danger), with a --danger-soft border. `transcript` sits under a divider.
// Figma state → `status` loading · ready · invalid (audio: ready · playing = `playing`). Figma
// type generated is Image Generation Card (one component per job).

type MediaStatus = 'loading' | 'ready' | 'invalid'

function WidgetMedia({
  kind = 'image',
  status = 'ready',
  title,
  meta,
  error,
  onDownload,
  playing = false,
  progress = 0,
  duration,
  onPlayToggle,
  transcript,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'title'> & {
  kind?: 'image' | 'audio'
  status?: MediaStatus
  title: React.ReactNode
  /** Format, size, dimensions (Figma caption). */
  meta?: React.ReactNode
  /** The invalid message; a default is used when omitted. */
  error?: React.ReactNode
  /** Shows the Download button (Figma show download). */
  onDownload?: () => void
  /** Audio: playing (Figma state playing). */
  playing?: boolean
  /** Audio: 0–1 of the waveform played. */
  progress?: number
  /** Audio: "2:14", or "0:48 / 2:14" while playing. */
  duration?: React.ReactNode
  onPlayToggle?: () => void
  /** Audio: the transcript under the player (Figma show transcript). */
  transcript?: React.ReactNode
  /** Image: the `<img>` (or `<video>`) when ready. */
  children?: React.ReactNode
}) {
  const invalid = status === 'invalid'
  if (kind === 'audio') {
    return (
      <Card
        data-slot="widget-media"
        data-kind="audio"
        data-status={status}
        className={cn(
          'max-w-120 min-w-0 gap-0 overflow-hidden rounded-2xl border-border py-0',
          invalid && 'border-danger-soft',
          className,
        )}
        {...props}
      >
        <Item size="sm" className="flex-nowrap rounded-none border-0 px-4 py-3">
          {invalid ? (
            <IconTile icon={CircleAlertIcon} tone="destructive" shape="circle" />
          ) : (
            <Button
              intent="brand"
              size="icon"
              shape="circle"
              aria-label={playing ? 'Pause' : 'Play'}
              aria-pressed={playing}
              onClick={onPlayToggle}
            >
              <Icon icon={playing ? PauseIcon : PlayIcon} />
            </Button>
          )}
          <ItemContent className="gap-1">
            <ItemTitle className="type-text-sm-semibold">{title}</ItemTitle>
            {invalid ? (
              <p className="type-text-xs-normal text-danger dark:text-danger-medium">
                {error ?? 'Couldn’t play audio.'}
              </p>
            ) : (
              <VoiceWaveform progress={progress} className="h-8 gap-0.5" />
            )}
          </ItemContent>
          {duration && (
            <ItemActions className="type-text-xs-normal whitespace-nowrap text-muted-foreground tabular-nums">
              {duration}
            </ItemActions>
          )}
        </Item>
        {transcript && (
          <p className="border-t px-4 py-3 type-text-sm-normal text-muted-foreground">{transcript}</p>
        )}
      </Card>
    )
  }
  return (
    <Card
      data-slot="widget-media"
      data-kind="image"
      data-status={status}
      aria-busy={status === 'loading' || undefined}
      className={cn('max-w-120 min-w-0 gap-0 overflow-hidden rounded-xl border-border py-0', className)}
      {...props}
    >
      <div className="relative flex aspect-video items-center justify-center bg-muted *:[img,video]:size-full *:[img,video]:object-cover">
        {status === 'ready' ? (
          children
        ) : (
          <Empty className="gap-2 border-0 p-0 md:p-0">
            {invalid && (
              <EmptyMedia className="mb-0 text-danger dark:text-danger-medium [&_svg]:size-4">
                <Icon icon={CircleAlertIcon} />
              </EmptyMedia>
            )}
            <EmptyDescription
              className={cn(
                'type-text-xs-medium text-muted-foreground',
                invalid && 'text-danger dark:text-danger-medium',
              )}
            >
              {invalid ? (error ?? 'Couldn’t load media') : 'Loading media'}
            </EmptyDescription>
          </Empty>
        )}
      </div>
      <Item size="sm" className="flex-nowrap rounded-none border-0 px-4 py-3">
        <ItemContent>
          <ItemTitle className="block truncate type-text-sm-semibold">{title}</ItemTitle>
          {meta && <ItemDescription className="line-clamp-1">{meta}</ItemDescription>}
        </ItemContent>
        {onDownload && (
          <ItemActions>
            <Button
              variant="ghost"
              intent="neutral"
              size="icon-sm"
              aria-label="Download"
              onClick={onDownload}
            >
              <Icon icon={DownloadIcon} />
            </Button>
          </ItemActions>
        )}
      </Item>
    </Card>
  )
}

export { WidgetMedia, type MediaStatus }
