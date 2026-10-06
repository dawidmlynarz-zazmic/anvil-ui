import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import {
  ToolCallAccordion,
  ToolCallAccordionContent,
  ToolCallAccordionDuration,
  ToolCallAccordionSummary,
  ToolCallAccordionTitle,
  ToolCallAccordionTrigger,
} from './tool-call-accordion'
import {
  ToolCallItem,
  ToolCallItemCode,
  ToolCallItemContent,
  ToolCallItemDuration,
  ToolCallItemName,
  ToolCallItemSection,
  ToolCallItemSummary,
  ToolCallItemTrigger,
} from './tool-call-item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10734-3012'

function Call({ index, ...props }: React.ComponentProps<typeof ToolCallItem> & { index: number }) {
  return (
    <ToolCallItem {...props}>
      <ToolCallItemTrigger>
        <ToolCallItemName>Label {index}</ToolCallItemName>
        <ToolCallItemSummary>Subtitle</ToolCallItemSummary>
        <ToolCallItemDuration>1.4s</ToolCallItemDuration>
      </ToolCallItemTrigger>
      <ToolCallItemContent>
        <ToolCallItemSection label="Input">
          <ToolCallItemCode>{'{ "key": "Value" }'}</ToolCallItemCode>
        </ToolCallItemSection>
        <ToolCallItemSection label="Output">
          <p>Subtitle</p>
        </ToolCallItemSection>
      </ToolCallItemContent>
    </ToolCallItem>
  )
}

function Group(props: React.ComponentProps<typeof ToolCallAccordion>) {
  const running = props.status === 'running'
  return (
    <ToolCallAccordion {...props}>
      <ToolCallAccordionTrigger>
        <ToolCallAccordionTitle>Title</ToolCallAccordionTitle>
        <ToolCallAccordionSummary>Label 1, Label 2, Label 3</ToolCallAccordionSummary>
        <ToolCallAccordionDuration>4.2s</ToolCallAccordionDuration>
      </ToolCallAccordionTrigger>
      <ToolCallAccordionContent>
        <Call index={1} status="done" />
        <Call index={2} status={running ? 'running' : 'done'} />
        {!running && <Call index={3} status="done" />}
      </ToolCallAccordionContent>
    </ToolCallAccordion>
  )
}

const meta = preview.meta({
  title: 'Agent Blocks/Agent States/Tool Call Accordion',
  tags: ['feature'],
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
    docs: {
      description: {
        component:
          'Tool calls grouped under one line (`@/components/agent/tool-call-accordion`, on Collapsible, built from Tool Call Item). `ToolCallAccordion` (`status` done · running; `open` / `defaultOpen`) › `ToolCallAccordionTrigger` (adds the wrench or pulse tile and the chevron) › `ToolCallAccordionTitle`, `ToolCallAccordionSummary` (the tools, truncated), `ToolCallAccordionDuration`; `ToolCallAccordionContent` › `ToolCallItem`s. Figma state collapsed · expanded is the open state; running is `status`.',
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
  await userEvent.click(canvas.getByRole('button', { name: /Title/ }))
  const call = canvas.getByRole('button', { name: /^Label 2/ })
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
        <ToolCallAccordionTrigger>
          <ToolCallAccordionTitle>Title</ToolCallAccordionTitle>
          <ToolCallAccordionSummary>Label 1, Label 2, Label 3</ToolCallAccordionSummary>
          <ToolCallAccordionDuration>4.2s</ToolCallAccordionDuration>
        </ToolCallAccordionTrigger>
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
