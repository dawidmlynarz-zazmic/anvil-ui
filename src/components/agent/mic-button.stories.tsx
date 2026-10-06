import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { MicButton, type MicStatus } from './mic-button'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-3052'

const STATUSES = ['idle', 'listening', 'processing', 'error'] as const

const meta = preview.meta({
  title: 'Agent Primitives/Input/Mic Button',
  tags: ['element'],
  component: MicButton,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'idle · listening · processing · invalid',
        code: '`status` prop (invalid is `error`)',
      },
    ],
    docs: {
      description: {
        component:
          'Voice input (`@/components/agent/mic-button`): `status` idle · listening (pulsing rings, pressed) · processing (spinner, busy) · error (mic-off). Its name follows the status ("Start voice input", "Stop voice input", …); `label` overrides it. Pair with the Voice Waveform while listening.',
      },
    },
  },
  args: { status: 'idle' },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    onClick: { control: false, table: { category: 'Events' } },
  },
})

/** Status is in Controls. */
export const Default = meta.story()

/** Figma state: idle, listening, processing, error. */
export const Statuses = meta.story({
  render: () => (
    <div className="flex items-center gap-8 p-4">
      {STATUSES.map((status) => (
        <MicButton key={status} status={status} />
      ))}
    </div>
  ),
})

/** Click to start, click to stop; processing follows. */
export const Interactive = meta.story({
  render: function Render() {
    const [status, setStatus] = useState<MicStatus>('idle')
    return (
      <MicButton
        status={status}
        onClick={() => {
          if (status === 'listening') {
            setStatus('processing')
            setTimeout(() => setStatus('idle'), 1200)
          } else if (status !== 'processing') setStatus('listening')
        }}
      />
    )
  },
})

Interactive.test('starts and stops listening', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Start voice input' }))
  const stop = canvas.getByRole('button', { name: 'Stop voice input' })
  await expect(stop).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(stop)
  await expect(canvas.getByRole('button', { name: 'Processing voice input' })).toHaveAttribute(
    'aria-busy',
    'true',
  )
})
