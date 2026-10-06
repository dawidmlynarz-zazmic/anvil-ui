import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentTitle,
} from '@/components/ui/attachment'
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
  RotateCcwIcon,
  XIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { IconTile } from '@/components/anvil/icon-tile'
import { Progress } from '@/components/ui/progress'

// Figma Agent Builder › Core Kit › file output card (10729:2552): a file the agent generated. --card,
// --border, radius xl, shadow-sm, 12px padding and gap, up to --shell-widget-max. 40px radius-lg
// tile by `kind` (Figma type): document --info-subtle · presentation --warning-subtle ·
// spreadsheet --success-subtle · pdf --danger-subtle, 18px icon in the base tone. Name
// text/sm/semibold (one line). `status` generating: agent status text/xs (--agent-medium in dark)
// + 4px agent Progress + Cancel; ready: meta text/xs --muted-foreground + Preview, Download (ghost
// icon-xs) and Open (outline xs); failed: Attachment's error look (--danger-muted stroke, danger
// meta) + Retry (Figma draws no failed file output card; the look is prompt attachment invalid).
// Built on Attachment (size lg; audit M8): generating = processing, ready = done, failed = error.

type FileKind = 'document' | 'presentation' | 'spreadsheet' | 'pdf'

const KIND: Record<FileKind, { tone: 'info' | 'warning' | 'success' | 'destructive'; icon: LucideIcon }> = {
  document: { tone: 'info', icon: FileTextIcon },
  presentation: { tone: 'warning', icon: PresentationIcon },
  spreadsheet: { tone: 'success', icon: FileSpreadsheetIcon },
  pdf: { tone: 'destructive', icon: FileTypeIcon },
}

const STATE = { generating: 'processing', ready: 'done', failed: 'error' } as const

function FileOutputCard({
  kind = 'document',
  status = 'ready',
  name,
  meta,
  progress,
  onCancel,
  onRetry,
  onPreview,
  onDownload,
  href,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Figma type: which file it is. */
  kind?: FileKind
  status?: 'generating' | 'ready' | 'failed'
  name: React.ReactNode
  /** Ready: format, size, pages. Generating: what the agent is doing. Failed: what went wrong. */
  meta?: React.ReactNode
  /** Generating: 0–100. */
  progress?: number
  onCancel?: () => void
  onRetry?: () => void
  onPreview?: () => void
  onDownload?: () => void
  /** Ready: opens the file. */
  href?: string
}) {
  const generating = status === 'generating'
  return (
    <Attachment
      data-slot="file-output-card"
      data-status={status}
      size="lg"
      state={STATE[status]}
      className={cn('w-full max-w-(--shell-widget-max) flex-nowrap', className)}
      {...props}
    >
      <IconTile icon={KIND[kind].icon} tone={KIND[kind].tone} />
      <AttachmentContent>
        <AttachmentTitle className="group-data-[state=processing]/attachment:animate-none group-data-[state=processing]/attachment:bg-none group-data-[state=processing]/attachment:text-foreground">
          {name}
        </AttachmentTitle>
        {meta && (
          <AttachmentDescription
            className={cn('whitespace-normal', generating && 'text-agent dark:text-agent-medium')}
          >
            {meta}
          </AttachmentDescription>
        )}
        {generating && <Progress tone="agent" size="sm" value={progress} aria-label="Generating" />}
      </AttachmentContent>
      <AttachmentActions className="gap-1">
        {generating && onCancel && (
          <AttachmentAction aria-label="Cancel" onClick={onCancel}>
            <Icon icon={XIcon} />
          </AttachmentAction>
        )}
        {status === 'failed' && onRetry && (
          <Button variant="outline" intent="neutral" size="xs" onClick={onRetry}>
            <Icon icon={RotateCcwIcon} />
            Retry
          </Button>
        )}
        {status === 'ready' && (
          <>
            {onPreview && (
              <AttachmentAction aria-label="Preview" onClick={onPreview}>
                <Icon icon={EyeIcon} />
              </AttachmentAction>
            )}
            {onDownload && (
              <AttachmentAction aria-label="Download" onClick={onDownload}>
                <Icon icon={DownloadIcon} />
              </AttachmentAction>
            )}
            {href && (
              <Button asChild variant="outline" intent="neutral" size="xs">
                <a href={href} target="_blank" rel="noreferrer">
                  <Icon icon={ExternalLinkIcon} />
                  Open
                </a>
              </Button>
            )}
          </>
        )}
      </AttachmentActions>
    </Attachment>
  )
}

export { FileOutputCard, type FileKind }
