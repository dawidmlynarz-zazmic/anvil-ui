import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'

import {
  ThinkingPanel,
  ThinkingPanelContent,
  ThinkingPanelDuration,
  ThinkingPanelStep,
  ThinkingPanelSteps,
  ThinkingPanelTitle,
  ThinkingPanelTrigger,
} from './thinking-panel'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-13166'

const STATUSES = ['running', 'done', 'failed'] as const

function Panel({
  steps = false,
  ...props
}: React.ComponentProps<typeof ThinkingPanel> & { steps?: boolean }) {
  return (
    <ThinkingPanel {...props}>
      <ThinkingPanelTrigger>
        <ThinkingPanelTitle>Title</ThinkingPanelTitle>
        <ThinkingPanelDuration>Subtitle</ThinkingPanelDuration>
      </ThinkingPanelTrigger>
      <ThinkingPanelContent>
        <p>Subtitle</p>
        {steps && (
          <ThinkingPanelSteps>
            <ThinkingPanelStep>Label 1</ThinkingPanelStep>
            <ThinkingPanelStep>Label 2</ThinkingPanelStep>
            <ThinkingPanelStep>Label 3</ThinkingPanelStep>
          </ThinkingPanelSteps>
        )}
      </ThinkingPanelContent>
    </ThinkingPanel>
  )
}

const meta = preview.meta({
  title: 'Agent Primitives/Agent States/Thinking Panel',
  tags: ['composite'],
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
      { property: 'summary title', values: 'text', code: '`ThinkingPanelTitle` children' },
      { property: 'duration label', values: 'text', code: '`ThinkingPanelDuration` children' },
      { property: 'reasoning body', values: 'text', code: '`ThinkingPanelContent` children' },
      { property: 'show pulse indicator', values: 'boolean', code: 'render the part or not' },
      { property: 'show duration', values: 'boolean', code: 'render `ThinkingPanelDuration` or not' },
      { property: 'show step list', values: 'boolean', code: 'render `ThinkingPanelSteps` or not' },
    ],
    docs: {
      description: {
        component:
          "The agent's reasoning, collapsed to one line (`@/components/agent/thinking-panel`, on Collapsible). `ThinkingPanel` (`status` running · done · failed, shared with tool calls; `open` / `defaultOpen` / `onOpenChange`) › `ThinkingPanelTrigger` (adds the pulse dot, check or alert icon and the chevron) › `ThinkingPanelTitle` + `ThinkingPanelDuration`; `ThinkingPanelContent` › text and optional `ThinkingPanelSteps` › `ThinkingPanelStep`. Figma state collapsed · expanded is the open state.",
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
  const trigger = canvas.getByRole('button', { name: /Title/ })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(trigger)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByText('Subtitle', { selector: 'p' })).toBeVisible()
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
            <strong>Title</strong>
            <span>14:02</span>
          </MessageHeader>
          <Panel status="done" />
          <Bubble variant="ghost">
            <BubbleContent>Subtitle</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  ),
})
