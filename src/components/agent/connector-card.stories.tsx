import type * as React from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { ArrowRightIcon, Icon, PlugIcon, RotateCcwIcon, SettingsIcon } from '@/components/ui/icon'

import {
  ConnectorCard,
  ConnectorCardFooter,
  ConnectorCardItem,
  ConnectorCardPermission,
  ConnectorCardStatus,
  type ConnectorStatus,
} from './connector-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10730-2985'

const STATUSES = ['suggest', 'connected', 'reconnect', 'connecting'] as const

type ExampleProps = React.ComponentProps<typeof ConnectorCard> & {
  status: ConnectorStatus
  onConnect?: () => void
}

/** The body and footer that fit each status. */
function Example({ onConnect, ...props }: ExampleProps) {
  const { status } = props
  return (
    <ConnectorCard
      {...props}
      footer={
        status === 'connecting' ? (
          <ConnectorCardStatus
            progress={40}
            action={
              <Button variant="ghost" intent="neutral" size="xs">
                Cancel
              </Button>
            }
          >
            Subtitle
          </ConnectorCardStatus>
        ) : (
          <ConnectorCardFooter>
            {status === 'suggest' && (
              <Button variant="ghost" intent="neutral" size="sm">
                Not now
              </Button>
            )}
            {status === 'reconnect' && (
              <Button variant="ghost" intent="destructive" size="sm">
                Disconnect
              </Button>
            )}
            {status === 'connected' && (
              <Button variant="ghost" intent="neutral" size="sm">
                <Icon icon={SettingsIcon} />
                Manage
              </Button>
            )}
            <span className="flex-1" />
            <Button intent="brand" size="sm" onClick={onConnect}>
              <Icon
                icon={
                  status === 'connected' ? ArrowRightIcon : status === 'reconnect' ? RotateCcwIcon : PlugIcon
                }
              />
              {status === 'connected' ? 'Continue' : status === 'reconnect' ? 'Reconnect' : 'Connect'}
            </Button>
          </ConnectorCardFooter>
        )
      }
    >
      {status === 'suggest' && (
        <>
          <ConnectorCardPermission>Label 1</ConnectorCardPermission>
          <ConnectorCardPermission>Label 2</ConnectorCardPermission>
          <ConnectorCardPermission>Label 3</ConnectorCardPermission>
        </>
      )}
      {status === 'connected' && (
        <>
          <ConnectorCardItem meta="Subtitle">Label 1</ConnectorCardItem>
          <ConnectorCardItem meta="Subtitle">Label 2</ConnectorCardItem>
          <ConnectorCardItem meta="Subtitle">Label 3</ConnectorCardItem>
        </>
      )}
    </ConnectorCard>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/System & Context/Connector Card',
  component: Example,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Asks to connect an app, then shows the result (`@/components/agent/connector-card`). `status` suggest · connected · reconnect · connecting sets the badge; `icon` (a neutral app icon; the partner logo in product), `title`, `description`, `badge`. Body: `ConnectorCardPermission` rows or `ConnectorCardItem` results. `footer`: `ConnectorCardFooter` or `ConnectorCardStatus` (connecting strip).',
      },
    },
  },
  args: { status: 'suggest' as const, title: 'Title', description: 'Subtitle', onConnect: fn() },
  argTypes: { status: { control: 'inline-radio', options: STATUSES } },
})

/** Status, title and description are in Controls. */
export const Default = meta.story()

Default.test('connect calls back', async ({ args, canvas }) => {
  await expect(canvas.getByRole('article', { name: 'Title' })).toHaveTextContent('Not connected')
  await userEvent.click(canvas.getByRole('button', { name: 'Connect' }))
  await expect(args.onConnect).toHaveBeenCalledOnce()
})

/** Figma states: suggest, connected, reconnect, connecting. */
export const Statuses = meta.story({
  render: (args) => (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {STATUSES.map((status) => (
        <Example key={status} {...args} status={status} />
      ))}
    </div>
  ),
})
