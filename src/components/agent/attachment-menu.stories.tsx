import preview from '#.storybook/preview'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Icon, PaperclipIcon } from '@/components/ui/icon'

import { AttachmentMenu, AttachmentMenuContent, AttachmentMenuTrigger } from './attachment-menu'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-2973'

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUploadFiles?: () => void
  onPhotos?: () => void
  onTakePhoto?: () => void
}

// modal={false} as in the Dropdown Menu stories (axe flags a modal menu's hidden page in a canvas).
function Demo({ open, onOpenChange, onUploadFiles, onPhotos, onTakePhoto }: DemoProps) {
  return (
    <AttachmentMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <AttachmentMenuTrigger asChild>
        <Button variant="ghost" intent="neutral" size="icon-sm" aria-label="Attach files">
          <Icon icon={PaperclipIcon} />
        </Button>
      </AttachmentMenuTrigger>
      <AttachmentMenuContent
        onUploadFiles={onUploadFiles}
        onPhotos={onPhotos}
        onTakePhoto={onTakePhoto}
        drive={{
          label: 'Label',
          children: (
            <>
              <DropdownMenuItem>Label 1</DropdownMenuItem>
              <DropdownMenuItem>Label 2</DropdownMenuItem>
            </>
          ),
        }}
        recent={
          <>
            <DropdownMenuItem>Label 1</DropdownMenuItem>
            <DropdownMenuItem>Label 2</DropdownMenuItem>
          </>
        }
        note="Subtitle"
      />
    </AttachmentMenu>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Input/Attachment Menu',
  tags: ['agent-block'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          "The composer's attach menu (`@/components/agent/attachment-menu`, on Dropdown Menu). `AttachmentMenu` › `AttachmentMenuTrigger` (the paperclip) + `AttachmentMenuContent`: `onUploadFiles`, `onPhotos`, `onTakePhoto` (omit to hide), `drive` and `recent` submenus, and a `note` of accepted types.",
      },
      story: { inline: false, height: '380px' },
    },
  },
  args: { open: false, onUploadFiles: fn(), onPhotos: fn(), onTakePhoto: fn() },
})

/** Click the paperclip; `open` is a live control. */
export const Default = meta.story()

Default.test('opens from the paperclip; Upload files reports', async ({ canvas, canvasElement, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Attach files' }))
  const menu = await within(canvasElement.ownerDocument.body).findByRole('menu')
  await userEvent.click(within(menu).getByRole('menuitem', { name: 'Upload files' }))
  await expect(args.onUploadFiles).toHaveBeenCalledOnce()
})

/** Open on load: the Figma drawing. */
export const Open = meta.story({ args: { open: true } })
