import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CameraIcon, HardDriveIcon, HistoryIcon, Icon, ImageIcon, UploadIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › attachment menu (10735:2973), built on Dropdown Menu: the
// composer's attach menu. Upload files, Photos and images, Take a photo, a connected drive and Recent
// files (submenus, when given), then a note of accepted types (text/xs --muted-foreground). 280px,
// radius xl, 6px padding as drawn; elevation/raised. Items are Dropdown Menu items with 16px icons.

const AttachmentMenu = DropdownMenu
const AttachmentMenuTrigger = DropdownMenuTrigger

function AttachmentMenuContent({
  onUploadFiles,
  onPhotos,
  onTakePhoto,
  drive,
  recent,
  note,
  className,
  align = 'start',
  ...props
}: React.ComponentProps<typeof DropdownMenuContent> & {
  onUploadFiles?: () => void
  onPhotos?: () => void
  /** Omit to hide Take a photo (e.g. no camera). */
  onTakePhoto?: () => void
  /** A connected drive submenu: its name and items (e.g. "From Google Drive"). */
  drive?: { label: React.ReactNode; children: React.ReactNode }
  /** Recent files submenu items. */
  recent?: React.ReactNode
  /** Accepted types and limits, under a separator. */
  note?: React.ReactNode
}) {
  return (
    <DropdownMenuContent
      data-slot="attachment-menu"
      align={align}
      className={cn('w-70 rounded-xl p-1.5', className)}
      {...props}
    >
      <DropdownMenuItem onSelect={onUploadFiles}>
        <Icon icon={UploadIcon} />
        Upload files
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onPhotos}>
        <Icon icon={ImageIcon} />
        Photos and images
      </DropdownMenuItem>
      {onTakePhoto && (
        <DropdownMenuItem onSelect={onTakePhoto}>
          <Icon icon={CameraIcon} />
          Take a photo
        </DropdownMenuItem>
      )}
      {drive && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icon icon={HardDriveIcon} />
            {drive.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="rounded-xl p-1.5">{drive.children}</DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      {recent && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icon icon={HistoryIcon} />
            Recent files
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="rounded-xl p-1.5">{recent}</DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      {note && (
        <>
          <DropdownMenuSeparator />
          <p className="px-2.5 py-1.5 type-text-xs-normal text-muted-foreground">{note}</p>
        </>
      )}
    </DropdownMenuContent>
  )
}

export { AttachmentMenu, AttachmentMenuTrigger, AttachmentMenuContent }
