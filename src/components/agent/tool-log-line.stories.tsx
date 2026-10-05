import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, RotateCcwIcon } from '@/components/ui/icon'

import { ToolLogLine } from './tool-log-line'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-2892'

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
      Subtitle
    </ToolLogLine>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Messages/Tool Log Line',
  tags: ['agent-primitive'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'One inline tool status in a message (`@/components/agent/tool-log-line`), lighter than a Tool Call Item: `status` running (pulse dot + shimmering label) · done (check) · failed (alert, danger label), and an optional `action` after the label (Details, Retry).',
      },
    },
  },
  args: { status: 'running', onDetails: fn(), onRetry: fn() },
  argTypes: { status: { control: 'inline-radio', options: ['running', 'done', 'failed'] } },
})

/** Status is in Controls. */
export const Default = meta.story()

/** Figma status: running, done, failed. */
export const Statuses = meta.story({
  render: () => (
    <div className="flex flex-col gap-2">
      <Demo status="running" />
      <Demo status="done" />
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
