import type * as React from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { CheckIcon, ExternalLinkIcon, Icon, PencilIcon, RotateCcwIcon } from '@/components/ui/icon'

import {
  ApprovalCard,
  ApprovalCardField,
  ApprovalCardFooter,
  ApprovalCardStatus,
  type ApprovalStatus,
} from './approval-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10728-2418'

const STATUSES = ['pending', 'approved', 'denied', 'executing', 'failed', 'expired'] as const

function Footer({
  status,
  onApprove,
  onDeny,
}: {
  status: ApprovalStatus
  onApprove?: () => void
  onDeny?: () => void
}) {
  switch (status) {
    case 'pending':
      return (
        <ApprovalCardFooter>
          <Button variant="ghost" intent="neutral" size="sm">
            <Icon icon={PencilIcon} />
            Edit
          </Button>
          <span className="flex-1" />
          <Button variant="outline" intent="destructive" size="sm" onClick={onDeny}>
            Deny
          </Button>
          <Button intent="brand" size="sm" onClick={onApprove}>
            <Icon icon={CheckIcon} />
            Approve
          </Button>
        </ApprovalCardFooter>
      )
    case 'approved':
      return (
        <ApprovalCardFooter message="Subtitle">
          <Button variant="ghost" intent="neutral" size="sm">
            <Icon icon={ExternalLinkIcon} />
            Open
          </Button>
        </ApprovalCardFooter>
      )
    case 'denied':
      return (
        <ApprovalCardFooter message="Subtitle">
          <Button variant="ghost" intent="neutral" size="sm">
            <Icon icon={PencilIcon} />
            Edit and retry
          </Button>
        </ApprovalCardFooter>
      )
    case 'executing':
      return (
        <ApprovalCardStatus
          progress={40}
          action={
            <Button variant="ghost" intent="neutral" size="xs">
              Cancel
            </Button>
          }
        >
          Subtitle
        </ApprovalCardStatus>
      )
    case 'failed':
      return (
        <ApprovalCardStatus
          action={
            <Button variant="outline" intent="neutral" size="xs">
              <Icon icon={RotateCcwIcon} />
              Retry
            </Button>
          }
        >
          Subtitle
        </ApprovalCardStatus>
      )
    case 'expired':
      return (
        <ApprovalCardStatus
          action={
            <Button variant="ghost" intent="neutral" size="xs">
              Request again
            </Button>
          }
        >
          Subtitle
        </ApprovalCardStatus>
      )
  }
}

type ExampleProps = React.ComponentProps<typeof ApprovalCard> & {
  status: ApprovalStatus
  onApprove?: () => void
  onDeny?: () => void
}

/** A card with three fields and the footer that fits its status. */
function Example({ onApprove, onDeny, ...props }: ExampleProps) {
  return (
    <ApprovalCard {...props} footer={<Footer status={props.status} onApprove={onApprove} onDeny={onDeny} />}>
      <ApprovalCardField label="Label 1">Value</ApprovalCardField>
      <ApprovalCardField label="Label 2">Value</ApprovalCardField>
      <ApprovalCardField label="Label 3">Value</ApprovalCardField>
    </ApprovalCard>
  )
}

const meta = preview.meta({
  title: 'Agent Blocks/System & Context/Approval Card',
  tags: ['feature'],
  component: Example,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'pending · approved · denied · executing · failed · expired',
        code: '`status` prop',
      },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'action', values: 'text', code: '`subtitle` prop' },
    ],
    docs: {
      description: {
        component:
          'Confirmation before an action with side effects (`@/components/agent/approval-card`). `status` pending · approved · denied · executing · failed · expired sets the tile, badge and detail tone; `title`, `subtitle` (the action), `badge` (overrides the status label), `note` (pending warning). Details are `ApprovalCardField` rows; `footer` is `ApprovalCardFooter` (actions) or `ApprovalCardStatus` (the lifecycle strip with `progress` and `action`).',
      },
    },
  },
  args: {
    status: 'pending' as const,
    title: 'Title',
    subtitle: 'Subtitle',
    note: 'Subtitle',
    onApprove: fn(),
    onDeny: fn(),
  },
  argTypes: {
    status: { control: 'select', options: STATUSES },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: { control: 'text' },
    note: { control: 'text' },
    footer: { control: false },
    onApprove: { control: false, table: { category: 'Events' } },
    onDeny: { control: false, table: { category: 'Events' } },
  },
  render: ({ onApprove, onDeny, ...args }) => (
    <ApprovalCard
      {...args}
      footer={<Footer status={args.status ?? 'pending'} onApprove={onApprove} onDeny={onDeny} />}
    >
      <ApprovalCardField label="Label 1">Value</ApprovalCardField>
      <ApprovalCardField label="Label 2">Value</ApprovalCardField>
      <ApprovalCardField label="Label 3">Value</ApprovalCardField>
    </ApprovalCard>
  ),
})

/** Status, title and note are in Controls. */
export const Default = meta.story()

Default.test('approve and deny call back', async ({ args, canvas }) => {
  await expect(canvas.getByRole('article')).toBeVisible()
  await userEvent.click(canvas.getByRole('button', { name: 'Approve' }))
  await expect(args.onApprove).toHaveBeenCalledOnce()
  await userEvent.click(canvas.getByRole('button', { name: 'Deny' }))
  await expect(args.onDeny).toHaveBeenCalledOnce()
})

/** Figma states: pending, approved, denied, executing, failed, expired. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="grid gap-6 lg:grid-cols-2">
      {STATUSES.map((status) => (
        <Example key={status} {...args} status={status} />
      ))}
    </div>
  ),
})

Statuses.test('the lifecycle strip is a live status', async ({ canvasElement }) => {
  await expect(canvasElement.querySelectorAll('[data-slot=approval-card-status][role=status]')).toHaveLength(
    3,
  )
})

const LONG =
  'A long title that wraps onto several lines to check spacing, alignment and wrapping in a narrow column'
const UNBROKEN = 'https://example.com/a/very/long/path/without/any/spaces/that/must/wrap/inside/the/column'

/** Stress test: long text and an unbroken URL in a narrow column wrap or truncate, never overflow. */
export const LongContent = meta.story({
  args: { title: LONG, subtitle: UNBROKEN, note: LONG, badge: 'Needs your approval before anything is sent' },
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
})

LongContent.test('stays in its column and keeps text readable', async ({ canvasElement }) => {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot=approval-card]')!
  const column = root.parentElement!.getBoundingClientRect()
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(column.right + 1)
    // A text block squeezed by its neighbours wraps one character per line.
    if (el.childElementCount === 0 && (el.textContent ?? '').length > 20) {
      await expect(el.getBoundingClientRect().width).toBeGreaterThanOrEqual(64)
    }
  }
})
