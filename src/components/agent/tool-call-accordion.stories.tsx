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

function Call({ index, ...props }: React.ComponentProps<typeof ToolCallItem> & { index: number }) {
  return (
    <ToolCallItem {...props}>
      <ToolCallItemTrigger name={<>Label {index}</>} summary="Subtitle" duration="1.4s" />
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
      <ToolCallAccordionTrigger title="Title" summary="Label 1, Label 2, Label 3" duration="4.2s" />
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
        <ToolCallAccordionTrigger title="Title" summary="Label 1, Label 2, Label 3" duration="4.2s" />
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
