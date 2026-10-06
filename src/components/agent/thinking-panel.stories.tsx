import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { MessageBubble, MessageBubbleContent } from '@/components/ui/message-bubble'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'

import {
  ThinkingPanel,
  ThinkingPanelContent,
  ThinkingPanelStep,
  ThinkingPanelSteps,
  ThinkingPanelTrigger,
} from './thinking-panel'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-13166'

const STATUSES = ['running', 'done', 'failed'] as const

/** The header copy for each status: present participle while running, past when done. */
const HEADER = {
  running: { title: 'Planning the summary…', duration: '4s' },
  done: { title: 'Planning the summary', duration: 'Thought for 4s' },
  failed: { title: 'Couldn’t finish planning', duration: 'Stopped after 4s' },
} as const

const REASONING =
  'Maya wants a summary of the Q3 launch plan. She prefers concise answers with bullet points, so I’ll read the plan, pull out the dates, goals and risks, and check the latest trial conversion numbers.'

function Panel({
  steps = false,
  ...props
}: React.ComponentProps<typeof ThinkingPanel> & { steps?: boolean }) {
  const header = HEADER[props.status ?? 'running']
  return (
    <ThinkingPanel {...props}>
      <ThinkingPanelTrigger title={header.title} duration={header.duration} />
      <ThinkingPanelContent>
        <p>{REASONING}</p>
        {steps && (
          <ThinkingPanelSteps>
            <ThinkingPanelStep>Read q3-launch-plan.pdf</ThinkingPanelStep>
            <ThinkingPanelStep>Pulled the launch dates, goals and risks</ThinkingPanelStep>
            <ThinkingPanelStep>Checked trial conversion in the weekly metrics</ThinkingPanelStep>
          </ThinkingPanelSteps>
        )}
      </ThinkingPanelContent>
    </ThinkingPanel>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Thinking Panel',
  tags: ['agent-builder', 'agent-status'],
  component: Panel,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'status',
        values: 'running · done · failed',
        code: '`status` prop (the shared step vocabulary)',
      },
      {
        property: 'state',
        values: 'collapsed · expanded',
        code: '`open` / `defaultOpen` prop (`data-[state=open]`)',
      },
      { property: 'summary title', values: 'text', code: '`ThinkingPanelTrigger` `title`' },
      { property: 'duration label', values: 'text', code: '`ThinkingPanelTrigger` `duration`' },
      { property: 'reasoning body', values: 'text', code: '`ThinkingPanelContent` children' },
      { property: 'show pulse indicator', values: 'boolean', code: 'render the part or not' },
      { property: 'show duration', values: 'boolean', code: 'pass `duration` or not' },
      { property: 'show step list', values: 'boolean', code: 'render `ThinkingPanelSteps` or not' },
    ],
    guide: {
      use: [
        'Above an assistant answer, to show the model’s reasoning collapsed to one line the user can open.',
        'Keep it collapsed by default; the header alone tells the user the agent is (or was) thinking.',
        'Add `ThinkingPanelSteps` when the reasoning maps to a short list of concrete steps.',
      ],
      avoid: [
        'Tool calls with inputs and outputs: use Tool Call Item, or Tool Call Accordion for several.',
        'A single running action line (“Searching the web…”): use Tool Log Line.',
        'Waiting for the first token with nothing to show yet: use Streaming Placeholder.',
      ],
      content: [
        'Title: what the agent is working on, present participle while running (“Planning the summary…”), plain when done.',
        'Duration: “Thought for 4s” when done; “Stopped after 4s” when failed.',
        'Reasoning: short first-person prose; steps are past-tense actions (“Read q3-launch-plan.pdf”).',
      ],
      a11y: [
        'The header is a disclosure button with `aria-expanded`; Enter and Space toggle it.',
        'Status is shown by icon and title text, not color alone.',
        'Agent and danger titles switch to the -medium tone in dark to keep 4.5:1 contrast.',
      ],
    },
    docs: {
      description: {
        component:
          "The agent's reasoning, collapsed to one line (`@/components/agent/thinking-panel`, on Collapsible). `ThinkingPanel` (`status` running · done · failed, shared with tool calls; `open` / `defaultOpen` / `onOpenChange`) › `ThinkingPanelTrigger` (`title`, `duration`; adds the pulse dot, check or alert icon and the chevron); `ThinkingPanelContent` › text and optional `ThinkingPanelSteps` › `ThinkingPanelStep`. Figma state collapsed · expanded is the open state.",
      },
    },
  },
  args: { status: 'running' as const, open: false, steps: false },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    steps: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
})

/** Status, open and steps are in Controls. */
export const Default = meta.story()

Default.test('the header toggles the reasoning', async ({ canvas }) => {
  const trigger = canvas.getByRole('button', { name: /Planning the summary/ })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(trigger)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByText(REASONING, { selector: 'p' })).toBeVisible()
})

/** Figma status × state: each status collapsed and expanded. */
export const Statuses = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {STATUSES.map((status) => (
        <div key={status} className="flex flex-col gap-2">
          <Panel status={status} />
          <Panel status={status} defaultOpen />
        </div>
      ))}
    </div>
  ),
})

/** Figma show step list: the actions behind the reasoning. */
export const WithSteps = meta.story({ args: { status: 'done', open: true, steps: true } })

WithSteps.test('steps are a list', async ({ canvas }) => {
  await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
})

/** Inside an assistant message, above the answer (Figma message row). */
export const InMessage = meta.story({
  render: () => (
    <div className="max-w-(--shell-thread-max)">
      <Message>
        <MessageContent>
          <MessageHeader>
            <strong>Assistant</strong>
            <span>14:02</span>
          </MessageHeader>
          <Panel status="done" />
          <MessageBubble variant="ghost">
            <MessageBubbleContent>
              Northwind Sync launches on September 16 after a two-week beta with 24 design partners. The plan
              focuses on lifting trial conversion, which slipped to 4.6% last month.
            </MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
    </div>
  ),
})
