import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, RotateCcwIcon } from '@/components/ui/icon'

import {
  ToolCallItem,
  ToolCallItemActions,
  ToolCallItemCode,
  ToolCallItemContent,
  ToolCallItemSection,
  ToolCallItemTrigger,
} from './tool-call-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10734-2925'

const STATUSES = ['running', 'done', 'failed'] as const

const SUMMARY = {
  running: 'Searching the web…',
  done: 'Searched 6 sites',
  failed: 'Couldn’t reach the search service',
} as const

const INPUT = `{
  "query": "Northwind Sync competitor pricing 2026",
  "max_results": 6
}`

const OUTPUT = `{
  "results": [
    { "title": "Team plans for sync tools, compared", "url": "https://marketpulse.example/sync-pricing" },
    { "title": "2026 developer tools survey", "url": "https://devsurvey.example/2026" }
  ],
  "total": 6
}`

function Call(props: React.ComponentProps<typeof ToolCallItem>) {
  const status = props.status ?? 'running'
  const failed = status === 'failed'
  return (
    <ToolCallItem {...props}>
      <ToolCallItemTrigger
        name="web_search"
        summary={SUMMARY[status]}
        duration={status === 'running' ? undefined : failed ? '10.0s' : '4.2s'}
      />
      <ToolCallItemContent>
        <ToolCallItemSection label="Input">
          <ToolCallItemCode>{INPUT}</ToolCallItemCode>
        </ToolCallItemSection>
        {status === 'done' && (
          <ToolCallItemSection label="Output">
            <ToolCallItemCode>{OUTPUT}</ToolCallItemCode>
          </ToolCallItemSection>
        )}
        {failed && (
          <ToolCallItemSection label="Error">
            <p>The request timed out after 10 seconds. Retry, or skip and answer without web results.</p>
          </ToolCallItemSection>
        )}
        {failed && (
          <ToolCallItemActions>
            <Button variant="outline" intent="neutral" size="xs">
              <Icon icon={RotateCcwIcon} />
              Retry
            </Button>
            <Button variant="ghost" intent="neutral" size="xs">
              Skip
            </Button>
          </ToolCallItemActions>
        )}
      </ToolCallItemContent>
    </ToolCallItem>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Agent status/Tool Call Item',
  tags: ['agent-builder', 'agent-status'],
  component: Call,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'status', values: 'running · done · failed', code: '`status` prop' },
      {
        property: 'state',
        values: 'collapsed · expanded',
        code: '`open` / `defaultOpen` prop (`data-[state=open]`)',
      },
      { property: 'tool name', values: 'text', code: '`ToolCallItemTrigger` `name`' },
      { property: 'summary', values: 'text', code: '`ToolCallItemTrigger` `summary`' },
      { property: 'duration', values: 'text', code: '`ToolCallItemTrigger` `duration`' },
    ],
    guide: {
      use: [
        'One tool call the user may want to inspect: the tool name, a one-line result, and its input and output on demand.',
        'Collapsed by default; open it automatically only when the call failed and needs a decision (Retry, Skip).',
      ],
      avoid: [
        'Several calls in one turn: group them in a Tool Call Accordion.',
        'A lightweight status with no detail to inspect: use Tool Log Line.',
        'The model’s reasoning between calls: use Thinking Panel.',
      ],
      content: [
        '`name`: the tool id as code (`web_search`). `summary`: present participle while running (“Searching the web…”), past result when done (“Searched 6 sites”).',
        'Input and Output: the real payload, pretty-printed JSON; trim long outputs.',
        'Error: what failed and the next step, then Retry and Skip.',
      ],
      a11y: [
        'The row is a disclosure button with `aria-expanded`; its name includes the tool and the summary.',
        'Status is an icon plus summary text, never color alone; the duration uses `--muted-foreground` for 4.5:1.',
      ],
    },
    docs: {
      description: {
        component:
          'One tool call (`@/components/agent/tool-call-item`, on Collapsible). `ToolCallItem` (`status` running · done · failed; `open` / `defaultOpen`) › `ToolCallItemTrigger` (`name`, `summary`, `duration`; adds the status icon and chevron); `ToolCallItemContent` › `ToolCallItemSection` (`label`: Input, Output, Error) with `ToolCallItemCode` or text, and `ToolCallItemActions`. Figma state collapsed · expanded is the open state.',
      },
    },
  },
  args: { status: 'running', open: false },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
})

/** Status and open are in Controls. */
export const Default = meta.story()

Default.test('the row toggles the detail', async ({ canvas }) => {
  const trigger = canvas.getByRole('button', { name: /web_search/ })
  await userEvent.click(trigger)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(canvas.getByText('Input')).toBeVisible()
})

/** Figma status × state. */
export const Statuses = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {STATUSES.map((status) => (
        <div key={status} className="flex flex-col gap-2">
          <Call status={status} />
          <Call status={status} defaultOpen />
        </div>
      ))}
    </div>
  ),
})

/** A failed call offers Retry and Skip. */
export const Failed = meta.story({ args: { status: 'failed', open: true } })

Failed.test('offers Retry and Skip', async ({ canvas }) => {
  await expect(canvas.getByText('Error')).toBeVisible()
  await expect(canvas.getByRole('button', { name: 'Retry' })).toBeEnabled()
  await expect(canvas.getByRole('button', { name: 'Skip' })).toBeEnabled()
})
