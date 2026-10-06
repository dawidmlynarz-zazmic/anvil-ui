import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { MessageBubble, MessageBubbleContent } from '@/components/ui/message-bubble'
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import {
  BriefcaseIcon,
  CommandIcon,
  CopyIcon,
  CpuIcon,
  Icon,
  Maximize2Icon,
  Minimize2Icon,
  SmileIcon,
  SparklesIcon,
  PencilIcon,
  RotateCcwIcon,
  Share2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@/components/ui/icon'
import { Message, MessageContent, MessageFooter } from '@/components/ui/message'

import { MessageAction, MessageActions } from './message-actions'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10672-2620'

/**
 * Retry's menu (Figma regenerate menu): standard Dropdown Menu items — Try again, Modify response,
 * Switch model. Composed in Message Actions, not a component of its own.
 */
function RegenerateItems() {
  const [model, setModel] = useState('label-1')
  return (
    <>
      <DropdownMenuItem>
        <Icon icon={RotateCcwIcon} />
        Try again
        <Kbd className="ms-auto">
          <Icon icon={CommandIcon} />R
        </Kbd>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Modify response</DropdownMenuLabel>
      {(
        [
          [Minimize2Icon, 'Shorter'],
          [Maximize2Icon, 'Longer'],
          [SparklesIcon, 'Simpler'],
          [BriefcaseIcon, 'More formal'],
          [SmileIcon, 'More casual'],
        ] as const
      ).map(([icon, label]) => (
        <DropdownMenuItem key={label}>
          <Icon icon={icon} />
          {label}
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Icon icon={CpuIcon} />
          Switch model
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="rounded-xl p-1.5">
          <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
            <DropdownMenuRadioItem value="label-1">Label 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="label-2">Label 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )
}

type DemoProps = { copy?: boolean; retry?: boolean; edit?: boolean; feedback?: boolean; share?: boolean }

function Demo({ copy = true, retry = true, edit = false, feedback = true, share = false }: DemoProps) {
  const [vote, setVote] = useState<'good' | 'bad' | null>(null)
  return (
    <MessageActions>
      {copy && (
        <MessageAction label="Copy">
          <Icon icon={CopyIcon} />
        </MessageAction>
      )}
      {retry && (
        <MessageAction label="Retry" menu={<RegenerateItems />} menuProps={{ modal: false }}>
          <Icon icon={RotateCcwIcon} />
        </MessageAction>
      )}
      {edit && (
        <MessageAction label="Edit">
          <Icon icon={PencilIcon} />
        </MessageAction>
      )}
      {feedback && (
        <>
          <MessageAction
            label="Good response"
            pressed={vote === 'good'}
            onClick={() => setVote((v) => (v === 'good' ? null : 'good'))}
          >
            <Icon icon={ThumbsUpIcon} />
          </MessageAction>
          <MessageAction
            label="Bad response"
            pressed={vote === 'bad'}
            onClick={() => setVote((v) => (v === 'bad' ? null : 'bad'))}
          >
            <Icon icon={ThumbsDownIcon} />
          </MessageAction>
        </>
      )}
      {share && (
        <MessageAction label="Share">
          <Icon icon={Share2Icon} />
        </MessageAction>
      )}
    </MessageActions>
  )
}

const meta = preview.meta({
  title: 'Agent Primitives/Messages/Message Actions',
  tags: ['composite'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'show copy', values: 'boolean', code: 'render the Copy `MessageAction` or not' },
      { property: 'show retry', values: 'boolean', code: 'render the Retry `MessageAction` or not' },
      { property: 'show edit', values: 'boolean', code: 'render the Edit `MessageAction` or not' },
      {
        property: 'show feedback',
        values: 'boolean',
        code: 'render the feedback `MessageAction`s (with `pressed`) or not',
      },
      { property: 'show share', values: 'boolean', code: 'render the Share `MessageAction` or not' },
    ],
    docs: {
      description: {
        component:
          'The actions under a message (`@/components/agent/message-actions`): `MessageActions` (a named group) › `MessageAction` (ghost icon button; `label` is its name and tooltip, `pressed` for toggles such as feedback). Figma show copy / retry / edit / feedback / share = render the actions you need. `menu` opens Dropdown Menu items from an action: retry opens the regenerate items (Try again, Modify response, Switch model; Figma regenerate menu, composed here). Built on Toolbar: one tab stop, arrow keys between actions.',
      },
    },
  },
  args: { copy: true, retry: true, edit: false, feedback: true, share: false },
  argTypes: {
    copy: { control: 'boolean' },
    retry: { control: 'boolean' },
    edit: { control: 'boolean' },
    feedback: { control: 'boolean' },
    share: { control: 'boolean' },
  },
})

/** Which actions show is in Controls (Figma show … booleans). */
export const Default = meta.story()

Default.test('feedback is a pair of exclusive toggles', async ({ canvas }) => {
  const good = canvas.getByRole('button', { name: 'Good response' })
  const bad = canvas.getByRole('button', { name: 'Bad response' })
  await userEvent.click(good)
  await expect(good).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(bad)
  await expect(bad).toHaveAttribute('aria-pressed', 'true')
  await expect(good).toHaveAttribute('aria-pressed', 'false')
})

/** Every action Figma draws. */
export const All = meta.story({ args: { edit: true, share: true } })

/** Under an assistant message (Figma message row). */
export const InMessage = meta.story({
  render: (args) => (
    <div className="w-120">
      <Message>
        <MessageContent>
          <MessageBubble variant="ghost">
            <MessageBubbleContent>Subtitle</MessageBubbleContent>
          </MessageBubble>
          <MessageFooter>
            <Demo {...args} />
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  ),
})

/** Retry opens the regenerate items (Figma regenerate menu) as a Dropdown Menu. */
export const RetryMenu = meta.story({
  parameters: { docs: { story: { inline: false, height: '460px' } } },
})

RetryMenu.test(
  'retry opens Try again, the modifications and Switch model',
  async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
    const body = within(canvasElement.ownerDocument.body)
    await waitFor(() => expect(body.getByRole('menuitem', { name: /Try again/ })).toBeVisible())
    await expect(body.getByRole('menuitem', { name: 'More formal' })).toBeInTheDocument()
    await expect(body.getByRole('menuitem', { name: 'Switch model' })).toBeInTheDocument()
  },
)

RetryMenu.test('the actions are one toolbar with arrow-key navigation', async ({ canvas }) => {
  const toolbar = canvas.getByRole('toolbar', { name: 'Message actions' })
  canvas.getByRole('button', { name: 'Copy' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  await expect(canvas.getByRole('button', { name: 'Retry' })).toHaveFocus()
  await expect(toolbar).toBeVisible()
})
