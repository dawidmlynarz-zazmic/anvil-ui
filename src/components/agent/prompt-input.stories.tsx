import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { Button } from '@/components/ui/button'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileSpreadsheetIcon,
  FileTextIcon,
  Icon,
  CameraIcon,
  HardDriveIcon,
  HistoryIcon,
  ImageIcon,
  UploadIcon,
  SlidersHorizontalIcon,
  XIcon,
} from '@/components/ui/icon'

import { PromptInput } from './prompt-input'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2292'

/** The attach menu's items: standard Dropdown Menu items (Figma attachment menu). */
function AttachItems() {
  return (
    <>
      <DropdownMenuItem>
        <Icon icon={UploadIcon} />
        Upload files
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Icon icon={ImageIcon} />
        Photos and images
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Icon icon={CameraIcon} />
        Take a photo
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Icon icon={HardDriveIcon} />
          Add from Drive
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="rounded-xl p-1.5">
          <DropdownMenuItem>Q3 launch</DropdownMenuItem>
          <DropdownMenuItem>Northwind Sync research</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Icon icon={HistoryIcon} />
          Recent files
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="rounded-xl p-1.5">
          <DropdownMenuItem>pricing-research.xlsx</DropdownMenuItem>
          <DropdownMenuItem>launch-deck.pptx</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <p className="px-2.5 py-1.5 type-text-xs-normal text-muted-foreground">PDF, DOCX, XLSX up to 25 MB</p>
    </>
  )
}

function Tools() {
  return (
    <Button type="button" variant="ghost" intent="neutral" size="icon-sm" aria-label="Tools">
      <Icon icon={SlidersHorizontalIcon} />
    </Button>
  )
}

// Four files, so the tray overflows and scrolls in both sizes.
const FILES = [
  { name: 'hero-image.png', meta: 'PNG · 1.2 MB', icon: ImageIcon, state: 'done' as const },
  { name: 'q3-launch-plan.pdf', meta: 'Uploading · 2.4 MB', icon: FileTextIcon, state: 'uploading' as const },
  { name: 'launch-metrics.xlsx', meta: 'XLSX · 96 KB', icon: FileSpreadsheetIcon, state: 'done' as const },
  { name: 'partner-brief.docx', meta: 'DOCX · 64 KB', icon: FileTextIcon, state: 'done' as const },
]

function Files() {
  return FILES.map((file) => (
    <Attachment key={file.name} state={file.state}>
      <AttachmentMedia>
        <Icon icon={file.icon} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>{file.meta}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label={`Remove ${file.name}`}>
          <Icon icon={XIcon} />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ))
}

type DemoProps = {
  size?: 'default' | 'compact'
  status?: 'idle' | 'streaming'
  listening?: boolean
  withFiles?: boolean
  defaultValue?: string
  onSubmit?: (value: string) => void
  onStop?: () => void
}

function Demo({ size, status, listening, withFiles, defaultValue, onSubmit, onStop }: DemoProps) {
  const [voice, setVoice] = useState(listening ?? false)
  return (
    <PromptInput
      size={size}
      status={status}
      listening={voice}
      defaultValue={defaultValue}
      placeholder="Ask Assistant anything…"
      onSubmit={onSubmit}
      onStop={onStop}
      onVoice={() => setVoice((v) => !v)}
      attachMenu={<AttachItems />}
      attachMenuProps={{ modal: false }}
      tools={<Tools />}
      tokenCount="1,204 / 200k"
      attachments={withFiles ? <Files /> : undefined}
    />
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Input/Prompt Input',
  tags: ['agent-builder', 'input'],
  component: Demo,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'size', values: 'default · compact', code: '`size` prop' },
      {
        property: 'state',
        values: 'empty · typing · file-attached · voice-active · streaming-disabled',
        code: 'empty / typing = `value`; file-attached = `attachments`; voice-active = `listening`; streaming-disabled = `status="streaming"`',
      },
      { property: 'placeholder', values: 'text', code: '`placeholder` prop' },
      { property: 'input text', values: 'text', code: '`value` / `defaultValue` prop' },
      { property: 'token count', values: 'text', code: '`tokenCount` prop' },
      { property: 'show token count', values: 'boolean', code: 'pass `tokenCount` or not' },
      {
        property: 'show attach button · leading action',
        values: 'boolean · instance',
        code: '`attachMenu` (Dropdown Menu items behind the attach button; Figma attachment menu) or `onAttach`; `leading` replaces it (instance swap)',
      },
      { property: 'show voice button', values: 'boolean', code: 'pass `onVoice` or not' },
      { property: 'show tools menu', values: 'boolean', code: 'pass `tools` or not' },
    ],
    guide: {
      use: [
        'The one composer at the bottom of a conversation: the user types, attaches files and sends.',
        '`size` compact in narrow shells (popover, side panel, mobile); default in full-screen chat.',
        'Pass `status="streaming"` while the agent answers so Send becomes Stop; `response` after a stop offers Regenerate and Continue.',
      ],
      avoid: [
        'Form fields or search boxes: use Textarea, Text field or Search.',
        'Choosing between known answers: use Clarifying Question instead of asking the user to type.',
        'A second composer in the same thread (for example, for edits): reuse this one.',
      ],
      content: [
        'Placeholder: an invitation that names the assistant (“Ask Assistant anything…”), not instructions.',
        'Attachment chips: the file name, then type or status and size (“PDF · 2.4 MB”, “Uploading · 2.4 MB”).',
        '`tokenCount`: used / limit (“1,204 / 200k”), only when the limit matters to the user.',
      ],
      a11y: [
        'The textarea is named “Prompt”; every icon button has a name (Attach files, Voice input, Send, Stop).',
        'Enter sends and Shift+Enter adds a line; Send is disabled while the prompt is empty.',
        'The response controls are a group with a polite status line, so “Stopped” is announced.',
      ],
    },
    docs: {
      description: {
        component:
          'The composer (`@/components/agent/prompt-input`, on Input Group): `size` default · compact (one row growing to 4 lines); `value` / `defaultValue` / `onValueChange`, `onSubmit(value)` (Enter sends, Shift+Enter adds a line; send is disabled while empty); `status` streaming (input off, send becomes Stop, `onStop`); `listening` shows the waveform in place of the text; slots `attachments`, `attachMenu` (Dropdown Menu items behind the attach button) or `onAttach`, `leading` (any control in its place), `tools`, `tokenCount`; `onVoice` adds the voice button.',
      },
    },
  },
  args: { size: 'default', status: 'idle', listening: false, withFiles: false, onSubmit: fn(), onStop: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    status: { control: 'inline-radio', options: ['idle', 'streaming'] },
    listening: { control: 'boolean' },
    withFiles: { control: 'boolean' },
    defaultValue: { control: 'text' },
    onSubmit: { control: false, table: { category: 'Events' } },
    onStop: { control: false, table: { category: 'Events' } },
  },
})

/** Size, status, listening and files are in Controls. Type and press Enter. */
export const Default = meta.story()

Default.test('send is off while empty; Enter sends the text', async ({ canvas, args }) => {
  const send = canvas.getByRole('button', { name: 'Send' })
  await expect(send).toBeDisabled()
  const field = canvas.getByRole('textbox', { name: 'Prompt' })
  await userEvent.type(field, 'Summarize the Q3 launch plan{Enter}')
  await expect(args.onSubmit).toHaveBeenCalledWith('Summarize the Q3 launch plan')
  await expect(field).toHaveValue('')
})

/** Figma state × size: empty, typing, file attached, voice active, streaming. */
export const States = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['default', 'compact'] as const).map((size) => (
        <div
          key={size}
          className={size === 'compact' ? 'flex max-w-90 flex-col gap-4' : 'flex flex-col gap-4'}
        >
          <Demo {...args} size={size} />
          <Demo {...args} size={size} defaultValue="Summarize the Q3 launch plan" />
          <Demo {...args} size={size} defaultValue="Summarize the Q3 launch plan" withFiles />
          <Demo {...args} size={size} listening />
          <Demo {...args} size={size} status="streaming" />
        </div>
      ))}
    </div>
  ),
})

/** Streaming: the input waits and Send becomes Stop. */
export const Streaming = meta.story({ args: { status: 'streaming' } })

Streaming.test('Stop replaces Send', async ({ canvas, args }) => {
  await expect(canvas.getByRole('textbox', { name: 'Prompt' })).toBeDisabled()
  await userEvent.click(canvas.getByRole('button', { name: 'Stop' }))
  await expect(args.onStop).toHaveBeenCalledOnce()
})

/** Compact: one row (popover and mobile shells). */
export const Compact = meta.story({ args: { size: 'compact' } })

/**
 * Figma show attach button: the attach button opens a Dropdown Menu of the items you pass
 * (`attachMenu`). The Figma attachment menu is composed here, not a component of its own.
 */
export const AttachMenu = meta.story({
  parameters: { docs: { story: { inline: false, height: '420px' } } },
})

AttachMenu.test('the attach button opens the attach menu', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Attach files' }))
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByRole('menuitem', { name: 'Upload files' })).toBeVisible())
  await expect(body.getByRole('menuitem', { name: 'Recent files' })).toBeInTheDocument()
})

/**
 * Figma response controls, after a response stops: a status line + Buttons above the composer
 * (`response` stopped · incomplete). While streaming, Send is Stop, so there is no pill.
 */
export const Response = meta.story({
  render: (args) => (
    <div className="flex w-160 flex-col gap-24 pt-14">
      <PromptInput
        placeholder="Ask Assistant anything…"
        response="stopped"
        onRegenerate={args.onSubmit as () => void}
        onContinue={args.onStop}
      />
      <PromptInput placeholder="Ask Assistant anything…" response="incomplete" onContinue={args.onStop} />
    </div>
  ),
})

Response.test('Regenerate and Continue call back', async ({ canvas, args }) => {
  const [stopped, incomplete] = canvas.getAllByRole('group', { name: 'Response controls' })
  await expect(stopped).toHaveTextContent('Stopped')
  await userEvent.click(within(stopped).getByRole('button', { name: 'Regenerate' }))
  await expect(args.onSubmit).toHaveBeenCalledOnce()
  await userEvent.click(within(incomplete).getByRole('button', { name: 'Continue generating' }))
  await expect(args.onStop).toHaveBeenCalledOnce()
})
