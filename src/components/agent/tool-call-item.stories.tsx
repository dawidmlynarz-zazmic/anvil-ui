import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, RotateCcwIcon } from '@/components/ui/icon'

import {
  ToolCallItem,
  ToolCallItemActions,
  ToolCallItemCode,
  ToolCallItemContent,
  ToolCallItemDuration,
  ToolCallItemName,
  ToolCallItemSection,
  ToolCallItemSummary,
  ToolCallItemTrigger,
} from './tool-call-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10734-2925'

const STATUSES = ['running', 'done', 'failed'] as const

function Call(props: React.ComponentProps<typeof ToolCallItem>) {
  const failed = props.status === 'failed'
  return (
    <ToolCallItem {...props}>
      <ToolCallItemTrigger>
        <ToolCallItemName>Label</ToolCallItemName>
        <ToolCallItemSummary>Subtitle</ToolCallItemSummary>
        <ToolCallItemDuration>1.4s</ToolCallItemDuration>
      </ToolCallItemTrigger>
      <ToolCallItemContent>
        <ToolCallItemSection label="Input">
          <ToolCallItemCode>{'{ "key": "Value" }'}</ToolCallItemCode>
        </ToolCallItemSection>
        <ToolCallItemSection label={failed ? 'Error' : 'Output'}>
          <p>Subtitle</p>
        </ToolCallItemSection>
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
  title: 'Agent Primitives/Agent States/Tool Call Item',
  tags: ['composite'],
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
      { property: 'tool name', values: 'text', code: '`ToolCallItemName` children' },
      { property: 'summary', values: 'text', code: '`ToolCallItemSummary` children' },
      { property: 'duration', values: 'text', code: '`ToolCallItemDuration` children' },
    ],
    docs: {
      description: {
        component:
          'One tool call (`@/components/agent/tool-call-item`, on Collapsible). `ToolCallItem` (`status` running · done · failed; `open` / `defaultOpen`) › `ToolCallItemTrigger` (adds the status icon and chevron) › `ToolCallItemName`, `ToolCallItemSummary`, `ToolCallItemDuration`; `ToolCallItemContent` › `ToolCallItemSection` (`label`: Input, Output, Error) with `ToolCallItemCode` or text, and `ToolCallItemActions`. Figma state collapsed · expanded is the open state.',
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
  const trigger = canvas.getByRole('button', { name: /Label/ })
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
