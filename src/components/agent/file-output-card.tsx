import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileTypeIcon,
  Icon,
  PresentationIcon,
  XIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'

// Figma Agent Builder › Core Kit › file output card (10729:2552): a file the agent generated. --card,
// --border, radius xl, shadow-sm, 12px padding and gap, up to --shell-widget-max. 40px radius-lg
// tile by `kind` (Figma type): document --info-subtle · presentation --warning-subtle ·
// spreadsheet --success-subtle · pdf --danger-subtle, 18px icon in the base tone. Name
// text/sm/semibold (one line). `status` generating: agent status text/xs (--agent-medium in dark)
// + 4px agent Progress + Cancel; ready: meta text/xs --muted-foreground + Preview, Download (ghost
// icon-xs) and Open (outline xs).

type FileKind = 'document' | 'presentation' | 'spreadsheet' | 'pdf'

const KIND: Record<FileKind, { tile: string; icon: LucideIcon }> = {
  document: { tile: 'bg-info-subtle text-info', icon: FileTextIcon },
  presentation: { tile: 'bg-warning-subtle text-warning', icon: PresentationIcon },
  spreadsheet: { tile: 'bg-success-subtle text-success', icon: FileSpreadsheetIcon },
  pdf: { tile: 'bg-danger-subtle text-danger', icon: FileTypeIcon },
}

function FileOutputCard({
  kind = 'document',
  status = 'ready',
  name,
  meta,
  progress,
  onCancel,
  onPreview,
  onDownload,
  href,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Figma type: which file it is. */
  kind?: FileKind
  status?: 'generating' | 'ready'
  name: React.ReactNode
  /** Ready: format, size, pages. Generating: what the agent is doing. */
  meta?: React.ReactNode
  /** Generating: 0–100. */
  progress?: number
  onCancel?: () => void
  onPreview?: () => void
  onDownload?: () => void
  /** Ready: opens the file. */
  href?: string
}) {
  const generating = status === 'generating'
  return (
    <div
      data-slot="file-output-card"
      data-status={status}
      className={cn(
        'flex w-full max-w-(--shell-widget-max) items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', KIND[kind].tile)}>
        <Icon icon={KIND[kind].icon} className="size-4.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate type-text-sm-semibold text-foreground">{name}</span>
        {meta && (
          <span
            className={cn(
              'type-text-xs-normal',
              generating ? 'text-agent dark:text-agent-medium' : 'text-muted-foreground',
            )}
          >
            {meta}
          </span>
        )}
        {generating && <Progress tone="agent" size="sm" value={progress} aria-label="Generating" />}
      </div>
      {generating ? (
        onCancel && (
          <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Cancel" onClick={onCancel}>
            <Icon icon={XIcon} />
          </Button>
        )
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          {onPreview && (
            <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Preview" onClick={onPreview}>
              <Icon icon={EyeIcon} />
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              intent="neutral"
              size="icon-xs"
              aria-label="Download"
              onClick={onDownload}
            >
              <Icon icon={DownloadIcon} />
            </Button>
          )}
          {href && (
            <Button asChild variant="outline" intent="neutral" size="xs">
              <a href={href} target="_blank" rel="noreferrer">
                <Icon icon={ExternalLinkIcon} />
                Open
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export { FileOutputCard, type FileKind }
