import preview from '#.storybook/preview'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { CopyIcon, DownloadIcon, FileTextIcon, Icon, ShareIcon } from '@/components/ui/icon'

import { ShareDialog } from './share-dialog'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10727-2445'

const onExport = fn()

const EXPORTS = (
  <>
    <Button variant="outline" intent="neutral" size="sm" onClick={() => onExport('docs')}>
      <Icon icon={FileTextIcon} />
      Export to Docs
    </Button>
    <Button variant="outline" intent="neutral" size="sm" onClick={() => onExport('pdf')}>
      <Icon icon={DownloadIcon} />
      PDF
    </Button>
    <Button variant="outline" intent="neutral" size="sm" onClick={() => onExport('markdown')}>
      <Icon icon={CopyIcon} />
      Markdown
    </Button>
  </>
)

const meta = preview.meta({
  title: 'Agent Builder/Shell/Share Dialog',
  tags: ['agent-builder'],
  component: ShareDialog,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '520px' },
      description: {
        component:
          'Share a chat as a read-only link and export it (`@/components/agent/share-dialog`), built on Dialog: `shared` (Figma private · public), the `link` with Copy link, two options as Switch Fields (`settings`), the `exports` slot, and Create public link (`onShare`) or Stop sharing (`onStopSharing`) + Done.',
      },
    },
    figmaProps: [
      { property: 'state', values: 'private · public', code: '`shared` prop' },
      { property: 'export actions', values: '3 × button', code: '`exports` slot (outline sm Buttons)' },
    ],
    guide: {
      use: [
        'From a Share button in the chat or project header, to make a read-only link to the chat or export it.',
        'Show the link only once it exists (`shared`); creating it is an explicit action (Create public link).',
      ],
      avoid: [
        'Inviting named people to collaborate: use a members or permissions dialog.',
        'Downloading a single generated file: use File Output Card.',
      ],
      content: [
        'Say who can see the chat in the description, in plain words.',
        'Export buttons name the destination or format (“PDF”, “Markdown”).',
        'Stop sharing is destructive: it breaks the link for everyone who has it.',
      ],
      a11y: [
        'It is a Dialog: focus moves in, Escape closes, focus returns to the Share button.',
        'The link is a read-only text field named “Share link”; each option is a Switch labelled by its title.',
      ],
    },
  },
  args: {
    open: false,
    shared: false,
    link: 'app.example.com/share/7f3k2q',
    onShare: fn(),
    onStopSharing: fn(),
    onCopyLink: fn(),
    onSettingsChange: fn(),
  },
  argTypes: {
    open: { control: 'boolean' },
    shared: { control: 'boolean' },
    link: { control: 'text' },
    title: { control: 'text' },
    trigger: { control: false },
    exports: { control: false },
    settings: { control: false },
    defaultSettings: { control: 'object' },
    onShare: { control: false, table: { category: 'Events' } },
    onStopSharing: { control: false, table: { category: 'Events' } },
    onCopyLink: { control: false, table: { category: 'Events' } },
    onSettingsChange: { control: false, table: { category: 'Events' } },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onOpenAutoFocus: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <ShareDialog
      {...args}
      exports={EXPORTS}
      trigger={
        <Button variant="outline" intent="neutral" size="sm">
          <Icon icon={ShareIcon} />
          Share
        </Button>
      }
    />
  ),
})

/** Closed, behind the Share button. Shared and the link are in Controls. */
export const Default = meta.story()

Default.test('creates a public link', async ({ canvas, canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Share' }))
  await userEvent.click(await body.findByRole('switch', { name: 'Include files and artifacts' }))
  await expect(args.onSettingsChange).toHaveBeenCalledWith({ includeFiles: true, allowContinue: false })
  await userEvent.click(body.getByRole('button', { name: 'Create public link' }))
  await expect(args.onShare).toHaveBeenCalledOnce()
})

/** Figma state private. */
export const Private = meta.story({ args: { open: true, onOpenAutoFocus: (e: Event) => e.preventDefault() } })

/** Figma state public: the link, Copy link, Stop sharing. */
export const Shared = meta.story({
  args: {
    open: true,
    shared: true,
    defaultSettings: { includeFiles: true, allowContinue: false },
    onOpenAutoFocus: (e: Event) => e.preventDefault(),
  },
})

Shared.test('copies the link and stops sharing', async ({ canvasElement, args }) => {
  const body = within(canvasElement.ownerDocument.body)
  await expect(body.getByRole('textbox', { name: 'Share link' })).toHaveValue('app.example.com/share/7f3k2q')
  await userEvent.click(body.getByRole('button', { name: 'Copy link' }))
  await expect(args.onCopyLink).toHaveBeenCalledWith('app.example.com/share/7f3k2q')
  await userEvent.click(body.getByRole('button', { name: 'Stop sharing' }))
  await expect(args.onStopSharing).toHaveBeenCalledOnce()
})
