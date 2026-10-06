import * as React from 'react'

import { cn } from '@/lib/utils'
import { IconTile } from '@/components/anvil/icon-tile'
import { ShellDescription, ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Link } from '@/components/anvil/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FolderIcon, Icon, UploadIcon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// Figma Agent Builder › Core Kit › Shell · project setup (10730:2624): create or edit a project.
// A `<form>` on Card (--card, --border, radius xl, shadow/sm, ≤640px), nothing re-drawn:
// - Shell Header card: an agent Icon Tile (32px, folder), `title` ("New project") and
//   `description`, with the divider.
// - Body (16px padding and gap): Name (Input with its built-in label), Instructions (Textarea with
//   its built-in label, 96px tall), Knowledge: the files (`children`, Attachments with a remove
//   action) and the upload hint; "browse" is a Link-styled button when `onBrowse` is set.
// - Shell Footer card: Cancel (ghost) + `submitLabel` (brand), sm.
// Figma draws the Instructions and Knowledge labels as text/xs/medium muted headings and Name as a
// Label; code uses the Label atom for all three (CLAUDE.md → Labels).

type ProjectValues = { name: string; instructions: string }

function ProjectSetup({
  title = 'New project',
  description = 'Chats in a project share instructions and files',
  defaultValues = { name: '', instructions: '' },
  submitLabel = 'Create project',
  onSubmit,
  onCancel,
  uploadHint = 'PDF, DOCX, XLSX, up to 30 MB',
  onBrowse,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'form'>, 'title' | 'onSubmit'> & {
  title?: React.ReactNode
  description?: React.ReactNode
  defaultValues?: ProjectValues
  /** "Create project", or "Save changes" when editing. */
  submitLabel?: React.ReactNode
  onSubmit?: (values: ProjectValues) => void
  onCancel?: () => void
  /** Accepted files and size, after "Drop files or browse". */
  uploadHint?: React.ReactNode
  /** Opens the file picker. */
  onBrowse?: () => void
  /** The knowledge files: Attachments. */
  children?: React.ReactNode
}) {
  const id = React.useId()
  return (
    <Card
      asChild
      className={cn('max-w-160 min-w-0 gap-0 rounded-xl border-border bg-card py-0 shadow-sm', className)}
    >
      <form
        data-slot="project-setup"
        aria-labelledby={`${id}-title`}
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          onSubmit?.({
            name: String(data.get('name') ?? ''),
            instructions: String(data.get('instructions') ?? ''),
          })
        }}
        {...props}
      >
        <ShellHeader variant="card" media={<IconTile icon={FolderIcon} tone="agent" size="sm" />}>
          <ShellTitle id={`${id}-title`}>{title}</ShellTitle>
          {description && <ShellDescription>{description}</ShellDescription>}
        </ShellHeader>
        <div className="flex flex-col gap-4 p-4">
          <Input label="Name" name="name" defaultValue={defaultValues.name} required />
          <Textarea
            label="Instructions"
            name="instructions"
            defaultValue={defaultValues.instructions}
            placeholder="How the assistant should work in this project"
            className="min-h-24"
          />
          <div role="group" aria-labelledby={`${id}-knowledge`} className="flex flex-col gap-1.5">
            <span id={`${id}-knowledge`} className="type-text-sm-medium text-foreground">
              Knowledge
            </span>
            {children && <div className="flex flex-col gap-1.5 *:w-full *:max-w-none">{children}</div>}
            <p className="flex items-center gap-1 type-text-xs-normal text-muted-foreground">
              <Icon icon={UploadIcon} size="xs" />
              Drop files or
              {onBrowse ? (
                <Link asChild className="type-text-xs-normal">
                  <button type="button" onClick={onBrowse}>
                    browse
                  </button>
                </Link>
              ) : (
                'browse'
              )}
              {uploadHint && <> · {uploadHint}</>}
            </p>
          </div>
        </div>
        <ShellFooter variant="card">
          <Button type="button" variant="ghost" intent="neutral" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" intent="brand" size="sm">
            {submitLabel}
          </Button>
        </ShellFooter>
      </form>
    </Card>
  )
}

export { ProjectSetup, type ProjectValues }
