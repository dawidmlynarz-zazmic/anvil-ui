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
} from '@/components/ui/icon'
import { Message, MessageContent, MessageFooter } from '@/components/ui/message'

import { MessageAction, MessageActions, MessageFeedback } from './message-actions'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10672-2620'

/**
 * Retry's menu (Figma regenerate menu): standard Dropdown Menu items — Try again, Modify response,
 * Switch model. Composed in Message Actions, not a component of its own.
 */
function RegenerateItems() {
  const [model, setModel] = useState('balanced')
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
            <DropdownMenuRadioItem value="fast">Fast</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="balanced">Balanced</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="deep">Deep reasoning</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  )
}

type DemoProps = { copy?: boolean; retry?: boolean; edit?: boolean; feedback?: boolean; share?: boolean }

function Demo({ copy = true, retry = true, edit = false, feedback = true, share = false }: DemoProps) {
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
      {feedback && <MessageFeedback />}
      {share && (
        <MessageAction label="Share">
          <Icon icon={Share2Icon} />
        </MessageAction>
      )}
    </MessageActions>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Message Actions',
  tags: ['molecule', 'messages'],
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
        code: 'render `MessageFeedback` (Good / Bad response as one exclusive choice) or not',
      },
      { property: 'show share', values: 'boolean', code: 'render the Share `MessageAction` or not' },
    ],
    guide: {
      use: [
        'The row under an assistant answer: Copy, Retry, Good response, Bad response, Share; Edit on the user’s own message.',
        '`menu` for actions with options: Retry opens Try again, Modify response (Shorter, More formal…) and Switch model.',
        '`MessageFeedback` for Good / Bad response: choosing one folds the other away and choosing it again brings it back; `pressed` and `collapsed` on `MessageAction` for your own toggles.',
      ],
      avoid: [
        'Bulk actions on a selection (“3 selected”): use Toolbar. Many commands on a conversation: use Dropdown Menu.',
        'A full rating or survey: use Rating Scale or the feedback blocks after the Bad response click.',
        'Suggested next prompts: use Quick Reply.',
      ],
      content: [
        'Each `label` names the action (“Copy”, “Retry”, “Good response”, “Bad response”, “Share”); it is the tooltip and the accessible name.',
        'Show only the actions that apply; keep the order Copy, Retry, Edit, feedback, Share.',
      ],
      a11y: [
        'Built on Toolbar: `role="toolbar"` named “Message actions”, one Tab stop, arrow keys between actions.',
        'Feedback toggles expose `aria-pressed`; confirm copies with a Toast or a status message, not only an icon change.',
        'Actions stay visible (or appear on focus), not only on hover, so keyboard users can reach them.',
      ],
    },
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

Default.test('choosing a vote folds the other away; choosing it again brings it back', async ({ canvas }) => {
  const good = canvas.getByRole('button', { name: 'Good response' })
  const bad = canvas.getByRole('button', { name: 'Bad response' })
  const fold = (el: HTMLElement) => el.closest('[data-slot=message-action-fold]') as HTMLElement
  await userEvent.click(good)
  await expect(good).toHaveAttribute('aria-pressed', 'true')
  await expect(fold(bad)).toHaveAttribute('data-collapsed', 'true')
  await expect(bad).toBeDisabled()
  await expect(fold(bad)).toHaveAttribute('inert')
  await userEvent.click(good)
  await expect(good).toHaveAttribute('aria-pressed', 'false')
  await expect(fold(bad)).not.toHaveAttribute('data-collapsed')
  await expect(bad).toBeEnabled()
  await userEvent.click(bad)
  await expect(bad).toHaveAttribute('aria-pressed', 'true')
  await expect(fold(good)).toHaveAttribute('data-collapsed', 'true')
})

/** Controlled: the vote comes from your data (for example, a saved rating); the other action is folded from the start. */
export const Voted = meta.story({
  render: () => (
    <MessageActions>
      <MessageFeedback defaultValue="good" />
    </MessageActions>
  ),
})

Voted.test('starts with the other action folded away', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Good response' })).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas.getByRole('button', { name: 'Bad response' })).toBeDisabled()
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
            <MessageBubbleContent>
              Northwind Sync launches on September 14. A private beta for 200 teams runs through August, and
              pricing goes live on launch day.
            </MessageBubbleContent>
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
