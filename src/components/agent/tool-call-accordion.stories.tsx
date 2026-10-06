import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { ToolCallAccordion, ToolCallAccordionContent, ToolCallAccordionTrigger } from './tool-call-accordion'
import {
  ToolCallItem,
  ToolCallItemCode,
  ToolCallItemContent,
  ToolCallItemSection,
  ToolCallItemTrigger,
} from './tool-call-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10734-3012'

/** The three calls of one turn: search the web, read the plan, chart the metrics. */
const CALLS = [
  {
    name: 'web_search',
    running: 'Searching the web…',
    done: 'Searched 6 sites',
    duration: '1.6s',
    input: '{\n  "query": "Northwind Sync competitor pricing 2026",\n  "max_results": 6\n}',
    output: 'Found 6 results from marketpulse.example, devsurvey.example and 4 more.',
  },
  {
    name: 'read_file',
    running: 'Reading q3-launch-plan.pdf…',
    done: 'Read q3-launch-plan.pdf',
    duration: '0.9s',
    input: '{\n  "path": "q3-launch-plan.pdf"\n}',
    output: '12 pages · 4,860 words. Sections: Goals, Timeline, Pricing, Risks.',
  },
  {
    name: 'create_chart',
    running: 'Creating the chart…',
    done: 'Created a line chart',
    duration: '1.7s',
    input: '{\n  "type": "line",\n  "metric": "weekly_active_users",\n  "weeks": 8\n}',
    output: 'Weekly active users, last 8 weeks: 12,480 (+8.2%).',
  },
] as const

function Call({ index, ...props }: React.ComponentProps<typeof ToolCallItem> & { index: number }) {
  const call = CALLS[index - 1]
  const running = props.status === 'running'
  return (
    <ToolCallItem {...props}>
      <ToolCallItemTrigger
        name={call.name}
        summary={running ? call.running : call.done}
        duration={running ? undefined : call.duration}
      />
      <ToolCallItemContent>
        <ToolCallItemSection label="Input">
          <ToolCallItemCode>{call.input}</ToolCallItemCode>
        </ToolCallItemSection>
        <ToolCallItemSection label="Output">
          <p>{call.output}</p>
        </ToolCallItemSection>
      </ToolCallItemContent>
    </ToolCallItem>
  )
}

function Group(props: React.ComponentProps<typeof ToolCallAccordion>) {
  const running = props.status === 'running'
  return (
    <ToolCallAccordion {...props}>
      <ToolCallAccordionTrigger
        title={running ? 'Using tools…' : 'Used 3 tools'}
        summary={running ? 'web_search, read_file' : 'web_search, read_file, create_chart'}
        duration={running ? undefined : '4.2s'}
      />
      <ToolCallAccordionContent>
        <Call index={1} status="done" />
        <Call index={2} status={running ? 'running' : 'done'} />
        {!running && <Call index={3} status="done" />}
      </ToolCallAccordionContent>
    </ToolCallAccordion>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Agent status/Tool Call Accordion',
  tags: ['agent-builder', 'agent-status'],
  component: Group,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'collapsed · expanded · running',
        code: 'collapsed / expanded = `open` prop (`data-[state=open]`); running = `status="running"`',
      },
    ],
    guide: {
      use: [
        'Two or more tool calls in one assistant turn, collapsed to one line above the answer.',
        'While the agent works, `status="running"` shows the pulse and the calls so far; switch to done when the last call ends.',
      ],
      avoid: [
        'A single call: use Tool Call Item on its own.',
        'Inline progress with nothing to inspect: use Tool Log Line.',
        'Reasoning without tool calls: use Thinking Panel.',
      ],
      content: [
        'Title: the count, past tense when done (“Used 3 tools”); “Using tools…” while running.',
        '`summary`: the tool ids in call order (“web_search, read_file, create_chart”); it truncates, so keep the order meaningful.',
        '`duration`: total time for the group (“4.2s”), only once done.',
      ],
      a11y: [
        'The header and each call are separate disclosure buttons with `aria-expanded`.',
        'Opening the group doesn’t open the calls; each opens on its own, so keyboard users aren’t flooded with detail.',
      ],
    },
    docs: {
      description: {
        component:
          'Tool calls grouped under one line (`@/components/agent/tool-call-accordion`, on Collapsible, built from Tool Call Item). `ToolCallAccordion` (`status` done · running; `open` / `defaultOpen`) › `ToolCallAccordionTrigger` (`title`, `summary` — the tools, truncated — and `duration`; adds the wrench or pulse tile and the chevron); `ToolCallAccordionContent` › `ToolCallItem`s. Figma state collapsed · expanded is the open state; running is `status`.',
      },
    },
  },
  args: { status: 'done', open: false },
  argTypes: {
    status: { control: 'inline-radio', options: ['done', 'running'] },
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
})

/** Status and open are in Controls. */
export const Default = meta.story()

Default.test('opens to the calls; each call opens on its own', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Used 3 tools/ }))
  const call = canvas.getByRole('button', { name: /^read_file/ })
  await userEvent.click(call)
  await expect(call).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByText('Input')).toBeVisible()
})

/** Figma states: collapsed, expanded (one call open), running. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-6">
      <Group />
      <ToolCallAccordion defaultOpen>
        <ToolCallAccordionTrigger
          title="Used 3 tools"
          summary="web_search, read_file, create_chart"
          duration="4.2s"
        />
        <ToolCallAccordionContent>
          <Call index={1} status="done" />
          <Call index={2} status="done" defaultOpen />
          <Call index={3} status="done" />
        </ToolCallAccordionContent>
      </ToolCallAccordion>
      <Group status="running" defaultOpen />
    </div>
  ),
})
