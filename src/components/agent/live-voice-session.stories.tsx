import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { LiveVoiceSession } from './live-voice-session'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10732-2715'

function Transcript() {
  return (
    <>
      <p>Title: Subtitle</p>
      <p>Label: Subtitle</p>
    </>
  )
}

type DemoProps = {
  status?: 'listening' | 'speaking' | 'camera'
  onEnd?: () => void
  onClose?: () => void
  onShareScreen?: () => void
  label?: string
}

function Demo({ status = 'listening', onEnd, onClose, onShareScreen, label }: DemoProps) {
  const [muted, setMuted] = useState(false)
  return (
    <LiveVoiceSession
      aria-label={label}
      status={status}
      elapsed="02:14"
      transcript={<Transcript />}
      muted={muted}
      onMutedChange={setMuted}
      onShareScreen={onShareScreen}
      onEnd={onEnd}
      onClose={onClose}
    />
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Input/Live Voice Session',
  tags: ['agent-block'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Full-screen live voice mode for mobile (`@/components/agent/live-voice-session`), on the inverse surface: `status` listening · speaking (pulse + waveform; `onInterrupt` on tap) · camera (`cameraPreview`); `elapsed`, `transcript`, `statusText`; controls `muted` / `onMutedChange`, `cameraOn` / `onCameraChange`, `onShareScreen`, `onEnd`, plus `onClose`.',
      },
    },
  },
  args: { status: 'listening', onEnd: fn(), onClose: fn(), onShareScreen: fn() },
  argTypes: { status: { control: 'inline-radio', options: ['listening', 'speaking', 'camera'] } },
})

/** Status is in Controls. */
export const Default = meta.story()

Default.test('mute toggles; End session ends', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Mute' }))
  await expect(canvas.getByRole('button', { name: 'Unmute' })).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(canvas.getByRole('button', { name: 'End session' }))
  await expect(args.onEnd).toHaveBeenCalledOnce()
})

/** Figma state: listening, speaking, camera. */
export const States = meta.story({
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      <Demo {...args} status="listening" label="Label 1" />
      <Demo {...args} status="speaking" label="Label 2" />
      <Demo {...args} status="camera" label="Label 3" />
    </div>
  ),
})
