import * as React from 'react'

import { cn } from '@/lib/utils'
import { FileXIcon, Icon, UploadIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › drop overlay (10735:3012): shown over the chat while files are
// dragged in. Full width, radius 2xl, 1.5px dashed stroke, centred column (8px): 32px icon, title
// text/base/semibold, detail text/sm. `status` ready (--info-subtle, --border-action stroke, upload,
// --info-strong title, --muted-foreground detail) · invalid (--danger-subtle, --danger stroke,
// file-x, --danger-strong title and detail). A polite live region, so the state is announced.
// Position it over the drop target (absolute inset-0) and handle the drag events in the app.

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
    <div
      data-slot="drop-overlay"
      data-status={status}
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-55 w-full flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed p-6 text-center',
        invalid ? 'border-danger bg-danger-subtle' : 'border-border-action bg-info-subtle',
        className,
      )}
      {...props}
    >
      <Icon
        icon={invalid ? FileXIcon : UploadIcon}
        className={cn('size-8', invalid ? 'text-danger' : 'text-info-medium')}
      />
      <p className={cn('type-text-base-semibold', invalid ? 'text-danger-strong' : 'text-info-strong')}>
        {title ?? (invalid ? 'This file type isn’t supported' : 'Drop files to attach')}
      </p>
      {detail && (
        <p className={cn('type-text-sm-normal', invalid ? 'text-danger-strong' : 'text-muted-foreground')}>
          {detail}
        </p>
      )}
    </div>
  )
}

export { DropOverlay }
