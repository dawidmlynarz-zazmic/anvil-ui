import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CopyIcon, Icon, RotateCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/components/ui/icon'

import { CitationChip } from './citation-chip'
import { FileOutputCard } from './file-output-card'
import { MessageAction, MessageActions } from './message-actions'
import { MessageRow } from './message-row'
import { ThinkingPanel, ThinkingPanelTrigger } from './thinking-panel'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3597'

const ROLES = ['user', 'assistant', 'system', 'tool'] as const
const STATUSES = ['queued', 'streaming', 'complete', 'failed'] as const

const PROMPT = 'Summarize the Q3 launch plan'
const ANSWER =
  'Northwind Sync launches on September 16 after a two-week beta with 24 design partners. The plan focuses on trial conversion, which slipped to 4.6% last month, with a new onboarding email and an in-app checklist.'

function Thinking({ status }: { status: 'running' | 'done' | 'failed' }) {
  return (
    <ThinkingPanel status={status}>
      <ThinkingPanelTrigger
        title={status === 'running' ? 'Planning the summary…' : 'Planning the summary'}
        duration={status === 'running' ? undefined : 'Thought for 4s'}
      />
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
        {status === 'failed' ? 'Couldn’t connect to Drive' : 'Drive connected'} · 14:02
      </MessageRow>
    )
  if (role === 'tool')
    return (
      <MessageRow
        role="tool"
        status={status}
        author="Assistant"
        timestamp="14:02"
        detail={
          status === 'complete' ? 'Read 12 pages · 1.8s' : status === 'failed' ? 'File not found' : undefined
        }
      >
        read_file q3-launch-plan.pdf
      </MessageRow>
    )
  if (role === 'user')
    return (
      <MessageRow role="user" status={status} timestamp="14:02" onRetry={onRetry}>
        {PROMPT}
      </MessageRow>
    )
  return (
    <MessageRow
      status={status}
      author="Assistant"
      timestamp="14:02"
      thinking={
        <Thinking status={status === 'queued' ? 'running' : status === 'failed' ? 'failed' : 'done'} />
      }
      citations={
        status === 'complete' && (
          <>
            <CitationChip index={1} domain="northwind.example/blog" confidence="high" />
            <CitationChip index={2} domain="marketpulse.example" confidence="medium" />
          </>
        )
      }
      actions={status === 'complete' && <Actions />}
      error={
        <Alert tone="destructive">
          <AlertTitle>Couldn’t finish the summary</AlertTitle>
          <AlertDescription>
            The connection dropped while I was reading q3-launch-plan.pdf. Retry to continue.
          </AlertDescription>
        </Alert>
      }
    >
      {status === 'queued' ? null : ANSWER}
    </MessageRow>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Message Row',
  tags: ['agent-builder', 'messages'],
  component: Row,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'role', values: 'user · assistant · system · tool', code: '`role` prop' },
      {
        property: 'state',
        values: 'queued · complete · invalid · streaming',
        code: '`status` prop (invalid is `failed`)',
      },
      { property: 'message text', values: 'text', code: 'children' },
      { property: 'author name', values: 'text', code: '`author` prop' },
      { property: 'timestamp', values: 'text', code: '`timestamp` prop' },
      {
        property: 'show avatar · avatar',
        values: 'boolean · instance',
        code: '`avatar` prop (agent avatar by default)',
      },
      { property: 'show author', values: 'boolean', code: 'pass `author` or not' },
      { property: 'show timestamp', values: 'boolean', code: 'pass `timestamp` or not' },
      { property: 'show thinking', values: 'boolean', code: 'pass `thinking` or not' },
      { property: 'show widget slot · widget', values: 'boolean · instance', code: 'pass `widget` or not' },
      { property: 'show citations', values: 'boolean', code: 'pass `citations` or not' },
      { property: 'show action toolbar', values: 'boolean', code: 'pass `actions` or not' },
    ],
    guide: {
      use: [
        'Every turn in a conversation thread: the user’s prompt, the assistant’s answer, a system event or a tool call.',
        'Fill the assistant slots only when they exist for that turn: `thinking`, `citations`, `widget`, `error`, `actions`.',
        'Drive `status` from the stream: queued → streaming → complete, or failed with `error` (assistant) or `onRetry` (user).',
      ],
      avoid: [
        'The empty placeholder before the first token: use Streaming Placeholder.',
        'Several tool calls in one turn: put a Tool Call Accordion in the assistant row instead of one tool row per call.',
        'Notices about the conversation itself (memory saved, instructions applied): use Memory Notice or Instructions Banner.',
      ],
      content: [
        'Author: “Assistant” for the agent; the user row says “You”. Timestamps are short local times (“14:02”).',
        'System rows are one short past-tense event (“Drive connected”). Tool rows show the call (“read_file q3-launch-plan.pdf”) and a past-tense `detail` (“Read 12 pages · 1.8s”).',
        'Errors say what went wrong and what to do next (“The connection dropped… Retry to continue.”).',
      ],
      a11y: [
        'Each row names its author, so screen readers know who is speaking without the avatar.',
        'Queued content uses `--muted-foreground` instead of opacity, keeping 4.5:1 contrast.',
        'Message actions are a toolbar named “Message actions” with labelled icon buttons.',
      ],
    },
    docs: {
      description: {
        component:
          'The unit of a conversation thread (`@/components/agent/message-row`, on Message + MessageBubble). `role` user · assistant · system · tool × `status` queued · streaming · complete · failed. The answer is `children`; the assistant takes slots in Figma order — `thinking` (Thinking Panel), `citations` (Citation Chips), `widget`, `error` (shown when failed), `actions` (Message Actions). Users get `onRetry` when sending failed; tools a `detail` status. Figma show … booleans = pass the slot or not.',
      },
    },
  },
  args: { role: 'assistant', status: 'complete', onRetry: fn() },
  argTypes: {
    role: { control: 'inline-radio', options: ROLES },
    status: { control: 'inline-radio', options: STATUSES },
    onRetry: { control: false, table: { category: 'Events' } },
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
        {PROMPT}
      </MessageRow>
      <MessageRow
        author="Assistant"
        timestamp="14:02"
        thinking={<Thinking status="done" />}
        citations={
          <>
            <CitationChip index={1} domain="northwind.example/blog" confidence="high" />
            <CitationChip index={2} domain="marketpulse.example" confidence="medium" />
          </>
        }
        widget={
          <FileOutputCard kind="document" name="q3-launch-summary.docx" meta="DOCX · 18 KB" href="#file" />
        }
        actions={<Actions />}
      >
        {ANSWER}
      </MessageRow>
    </div>
  ),
})

Composition.test('the user turn and the answer are both present', async ({ canvas }) => {
  await expect(canvas.getByText('You')).toBeVisible()
  await expect(canvas.getByRole('toolbar', { name: 'Message actions' })).toBeVisible()
})

const LONG =
  'A long message that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long messages and an unbroken URL from both sides of a narrow thread. */
export const LongContent = meta.story({
  render: () => (
    <div data-testid="thread" className="flex w-80 flex-col gap-8">
      <MessageRow role="user" timestamp="14:02">
        {`${LONG} ${UNBROKEN}`}
      </MessageRow>
      <MessageRow role="assistant" author="Assistant" timestamp="14:02">
        {`${LONG} ${UNBROKEN}`}
      </MessageRow>
    </div>
  ),
})

LongContent.test('messages stay inside the thread', async ({ canvas }) => {
  const thread = canvas.getByTestId('thread')
  const { right } = thread.getBoundingClientRect()
  for (const el of thread.querySelectorAll<HTMLElement>('*')) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(right + 1)
  }
})
