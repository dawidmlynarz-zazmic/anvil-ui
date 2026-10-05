import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  CopyIcon,
  Icon,
  PencilIcon,
  RotateCcwIcon,
  Share2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@/components/ui/icon'
import { Message, MessageContent, MessageFooter } from '@/components/ui/message'

import { MessageAction, MessageActions } from './message-actions'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10672-2620'

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
        <MessageAction label="Retry">
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
  title: 'Agent Builder/Core Kit/Messages/Message Actions',
  tags: ['agent-block'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'The actions under a message (`@/components/agent/message-actions`): `MessageActions` (a named group) › `MessageAction` (ghost icon button; `label` is its name and tooltip, `pressed` for toggles such as feedback). Figma show copy / retry / edit / feedback / share = render the actions you need. The retry action can open the Regenerate Menu.',
      },
    },
  },
  args: { copy: true, retry: true, edit: false, feedback: true, share: false },
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
          <Bubble variant="ghost">
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
          <MessageFooter>
            <Demo {...args} />
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  ),
})
