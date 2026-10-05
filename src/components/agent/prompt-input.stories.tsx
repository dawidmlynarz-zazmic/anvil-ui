import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

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
  FileTextIcon,
  Icon,
  ImageIcon,
  PaperclipIcon,
  SlidersHorizontalIcon,
  XIcon,
} from '@/components/ui/icon'

import { PromptInput } from './prompt-input'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2292'

function Attach() {
  return (
    <Button
      type="button"
      variant="ghost"
      intent="neutral"
      size="icon-sm"
      shape="circle"
      aria-label="Attach files"
    >
      <Icon icon={PaperclipIcon} />
    </Button>
  )
}

function Tools() {
  return (
    <Button type="button" variant="ghost" intent="neutral" size="icon-sm" aria-label="Tools">
      <Icon icon={SlidersHorizontalIcon} />
    </Button>
  )
}

function Files() {
  return (
    <>
      <Attachment size="default">
        <AttachmentMedia>
          <Icon icon={ImageIcon} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Title</AttachmentTitle>
          <AttachmentDescription>Subtitle</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove">
            <Icon icon={XIcon} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <Icon icon={FileTextIcon} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Title</AttachmentTitle>
          <AttachmentDescription>Subtitle</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove">
            <Icon icon={XIcon} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </>
  )
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
      placeholder="Placeholder"
      onSubmit={onSubmit}
      onStop={onStop}
      onVoice={() => setVoice((v) => !v)}
      leading={<Attach />}
      tools={<Tools />}
      tokenCount="1,204 / 200k"
      attachments={withFiles ? <Files /> : undefined}
    />
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Input/Prompt Input',
  tags: ['agent-block'],
  component: Demo,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'The composer (`@/components/agent/prompt-input`, on Input Group): `size` default · compact (one row growing to 4 lines); `value` / `defaultValue` / `onValueChange`, `onSubmit(value)` (Enter sends, Shift+Enter adds a line; send is disabled while empty); `status` streaming (input off, send becomes Stop, `onStop`); `listening` shows the waveform in place of the text; slots `attachments`, `leading` (attach / Attachment Menu), `tools`, `tokenCount`; `onVoice` adds the voice button.',
      },
    },
  },
  args: { size: 'default', status: 'idle', listening: false, withFiles: false, onSubmit: fn(), onStop: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    status: { control: 'inline-radio', options: ['idle', 'streaming'] },
  },
})

/** Size, status, listening and files are in Controls. Type and press Enter. */
export const Default = meta.story()

Default.test('send is off while empty; Enter sends the text', async ({ canvas, args }) => {
  const send = canvas.getByRole('button', { name: 'Send' })
  await expect(send).toBeDisabled()
  const field = canvas.getByRole('textbox', { name: 'Prompt' })
  await userEvent.type(field, 'Value{Enter}')
  await expect(args.onSubmit).toHaveBeenCalledWith('Value')
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
          <Demo {...args} size={size} defaultValue="Subtitle" />
          <Demo {...args} size={size} defaultValue="Subtitle" withFiles />
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
