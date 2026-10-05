import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CopyIcon, Icon, RotateCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/components/ui/icon'

import { CitationChip } from './citation-chip'
import { FileOutputCard } from './file-output-card'
import { MessageAction, MessageActions } from './message-actions'
import { MessageRow } from './message-row'
import {
  ThinkingPanel,
  ThinkingPanelDuration,
  ThinkingPanelTitle,
  ThinkingPanelTrigger,
} from './thinking-panel'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3597'

const ROLES = ['user', 'assistant', 'system', 'tool'] as const
const STATUSES = ['queued', 'streaming', 'complete', 'failed'] as const

function Thinking({ status }: { status: 'active' | 'completed' | 'failed' }) {
  return (
    <ThinkingPanel status={status}>
      <ThinkingPanelTrigger>
        <ThinkingPanelTitle>Title</ThinkingPanelTitle>
        <ThinkingPanelDuration>Subtitle</ThinkingPanelDuration>
      </ThinkingPanelTrigger>
    </ThinkingPanel>
  )
}

function Actions() {
  return (
    <MessageActions>
      <MessageAction label="Copy">
        <Icon icon={CopyIcon} />
      </MessageAction>
      <MessageAction label="Retry">
        <Icon icon={RotateCcwIcon} />
      </MessageAction>
      <MessageAction label="Good response">
        <Icon icon={ThumbsUpIcon} />
      </MessageAction>
      <MessageAction label="Bad response">
        <Icon icon={ThumbsDownIcon} />
      </MessageAction>
    </MessageActions>
  )
}

/** Fills the slots the way Figma's message row shows them for each role × status. */
function Row({
  role = 'assistant',
  status = 'complete',
  onRetry,
}: {
  role?: (typeof ROLES)[number]
  status?: (typeof STATUSES)[number]
  onRetry?: () => void
}) {
  if (role === 'system')
    return (
      <MessageRow role="system" status={status}>
        Subtitle · 14:02
      </MessageRow>
    )
  if (role === 'tool')
    return (
      <MessageRow
        role="tool"
        status={status}
        author="Title"
        timestamp="14:02"
        detail={status === 'complete' ? 'Subtitle' : status === 'failed' ? 'Subtitle' : undefined}
      >
        Label
      </MessageRow>
    )
  if (role === 'user')
    return (
      <MessageRow role="user" status={status} timestamp="14:02" onRetry={onRetry}>
        Subtitle
      </MessageRow>
    )
  return (
    <MessageRow
      status={status}
      author="Title"
      timestamp="14:02"
      thinking={
        <Thinking status={status === 'queued' ? 'active' : status === 'failed' ? 'failed' : 'completed'} />
      }
      citations={
        status === 'complete' && (
          <>
            <CitationChip index={1} confidence="high" />
            <CitationChip index={2} confidence="medium" />
          </>
        )
      }
      actions={status === 'complete' && <Actions />}
      error={
        <Alert tone="destructive">
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Subtitle</AlertDescription>
        </Alert>
      }
    >
      {status === 'queued' ? null : 'Subtitle'}
    </MessageRow>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Messages/Message Row',
  component: Row,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'The unit of a conversation thread (`@/components/agent/message-row`, on Message + Bubble). `role` user · assistant · system · tool × `status` queued · streaming · complete · failed. The answer is `children`; the assistant takes slots in Figma order — `thinking` (Thinking Panel), `citations` (Citation Chips), `widget`, `error` (shown when failed), `actions` (Message Actions). Users get `onRetry` when sending failed; tools a `detail` status. Figma show … booleans = pass the slot or not.',
      },
    },
  },
  args: { role: 'assistant', status: 'complete', onRetry: fn() },
  argTypes: {
    role: { control: 'inline-radio', options: ROLES },
    status: { control: 'inline-radio', options: STATUSES },
  },
})

/** Role and status are in Controls. */
export const Default = meta.story()

/** Figma role × state. */
export const Matrix = meta.story({
  render: () => (
    <div className="flex max-w-(--shell-thread-max) flex-col gap-8">
      {ROLES.map((role) =>
        STATUSES.map((status) => <Row key={`${role}-${status}`} role={role} status={status} />),
      )}
    </div>
  ),
})

/** A failed send offers Retry. */
export const UserFailed = meta.story({ args: { role: 'user', status: 'failed' } })

UserFailed.test('Retry is offered', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
  await expect(args.onRetry).toHaveBeenCalledOnce()
})

/** A full turn: thinking, answer with citations, a generated file and the actions. */
export const Composition = meta.story({
  render: () => (
    <div className="flex max-w-(--shell-thread-max) flex-col gap-8">
      <MessageRow role="user" timestamp="14:02">
        Subtitle
      </MessageRow>
      <MessageRow
        author="Title"
        timestamp="14:02"
        thinking={<Thinking status="completed" />}
        citations={<CitationChip index={1} domain="Label" confidence="high" />}
        widget={<FileOutputCard kind="document" name="Title" meta="Subtitle" href="#file" />}
        actions={<Actions />}
      >
        Subtitle
      </MessageRow>
    </div>
  ),
})

Composition.test('the user turn and the answer are both present', async ({ canvas }) => {
  await expect(canvas.getByText('You')).toBeVisible()
  await expect(canvas.getByRole('group', { name: 'Message actions' })).toBeVisible()
})
