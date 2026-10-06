import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { FileXIcon, Icon, UploadIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › drop overlay (10735:3012): shown over the chat while files are
// dragged in. Full width, radius 2xl, 1.5px dashed stroke, centred column (8px): 32px icon, title
// text/base/semibold, detail text/sm. `status` ready (--info-subtle, --border-action stroke, upload,
// --info-strong title, --muted-foreground detail) · invalid (--danger-subtle, --danger stroke,
// file-x, --danger-strong title and detail). A polite live region, so the state is announced.
// Position it over the drop target (absolute inset-0) and handle the drag events in the app.
// Built on Empty State (media, title, description), tinted and dashed.

function DropOverlay({
  status = 'ready',
  title,
  detail,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  status?: 'ready' | 'invalid'
  title?: React.ReactNode
  detail?: React.ReactNode
}) {
  const invalid = status === 'invalid'
  return (
    <EmptyState
      data-slot="drop-overlay"
      data-status={status}
      role="status"
      aria-live="polite"
      className={cn(
        'min-h-55 w-full gap-2 rounded-2xl border-[1.5px] border-dashed p-6 md:p-6',
        invalid ? 'border-danger bg-danger-subtle' : 'border-border-action bg-info-subtle',
        className,
      )}
      {...props}
    >
      <EmptyStateMedia className={cn('mb-0', invalid ? 'text-danger' : 'text-info-medium')}>
        <Icon icon={invalid ? FileXIcon : UploadIcon} className="size-8" />
      </EmptyStateMedia>
      <EmptyStateTitle
        className={cn('type-text-base-semibold', invalid ? 'text-danger-strong' : 'text-info-strong')}
      >
        {title ?? (invalid ? 'This file type isn’t supported' : 'Drop files to attach')}
      </EmptyStateTitle>
      {detail && (
        <EmptyStateDescription
          className={cn('type-text-sm-normal', invalid ? 'text-danger-strong' : 'text-muted-foreground')}
        >
          {detail}
        </EmptyStateDescription>
      )}
    </EmptyState>
  )
}

export { DropOverlay }
