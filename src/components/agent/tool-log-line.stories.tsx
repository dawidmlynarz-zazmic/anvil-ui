import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, RotateCcwIcon } from '@/components/ui/icon'

import { ToolLogLine } from './tool-log-line'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-2892'

/** web_search through its lifecycle. */
const LABEL = {
  running: 'Searching the web…',
  done: 'Searched 6 sites · 4.2s',
  failed: 'Couldn’t reach the web. Try again.',
} as const

function Demo({
  status = 'running',
  onDetails,
  onRetry,
}: {
  status?: 'running' | 'done' | 'failed'
  onDetails?: () => void
  onRetry?: () => void
}) {
  return (
    <ToolLogLine
      status={status}
      action={
        status === 'done' ? (
          <Button variant="ghost" intent="neutral" size="xs" onClick={onDetails}>
            Details
          </Button>
        ) : status === 'failed' ? (
          <Button variant="ghost" intent="neutral" size="xs" onClick={onRetry}>
            <Icon icon={RotateCcwIcon} />
            Retry
          </Button>
        ) : undefined
      }
    >
      {LABEL[status]}
    </ToolLogLine>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Tool Log Line',
  tags: ['molecule', 'agent-status'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'status', values: 'running · done · failed', code: '`status` prop' }],
    guide: {
      use: [
        'A one-line status for each tool the agent runs inside an answer: “Searching the web…”, “Read q3-launch-plan.pdf”.',
        'Quick, low-stakes steps where the user only needs to know what happened; Details opens more when done, Retry when failed.',
      ],
      avoid: [
        'Tool calls the user may want to inspect (inputs, outputs, timing): use Tool Call Item. Several steps grouped under one summary: use Tool Call Accordion.',
        'Actions with side effects the user approved: use Action Status on the Approval Card.',
      ],
      content: [
        'Running: a present participle with an ellipsis (“Searching the web…”). Done: past tense with the result (“Searched 6 sites · 4.2s”).',
        'Name the object, not the tool id: “Read q3-launch-plan.pdf”, not “read_file”. Failures say what to do next.',
      ],
      a11y: [
        'The status icon is decorative: the label must say the state in words (“Searching…”, “Searched…”, “Couldn’t…”), never color alone.',
        'Put the lines in a live region (or announce completion in the message) so screen readers hear progress; the shimmer is decorative.',
        'Details and Retry are real buttons with visible labels.',
      ],
    },
    docs: {
      description: {
        component:
          'One inline tool status in a message (`@/components/agent/tool-log-line`), lighter than a Tool Call Item: `status` running (pulse dot + shimmering label) · done (check) · failed (alert, danger label), and an optional `action` after the label (Details, Retry).',
      },
    },
  },
  args: { status: 'running', onDetails: fn(), onRetry: fn() },
  argTypes: {
    status: { control: 'inline-radio', options: ['running', 'done', 'failed'] },
    onDetails: { control: false, table: { category: 'Events' } },
    onRetry: { control: false, table: { category: 'Events' } },
  },
})

/** Status is in Controls. */
export const Default = meta.story()

/** Figma status: running, done, failed. */
export const Statuses = meta.story({
  render: () => (
    <div className="flex flex-col gap-2">
      <Demo status="running" />
      <Demo status="done" />
      <ToolLogLine status="done">Read q3-launch-plan.pdf</ToolLogLine>
      <Demo status="failed" />
    </div>
  ),
})

/** A failed call offers Retry. */
export const Failed = meta.story({ args: { status: 'failed' } })

Failed.test('Retry is offered', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Retry' }))
  await expect(args.onRetry).toHaveBeenCalledOnce()
})
