import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { MicButton } from './mic-button'
import { VoiceWaveform } from './voice-waveform'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10664-12496'

const meta = preview.meta({
  title: 'Agent Primitives/Input/Voice Waveform',
  tags: ['element'],
  component: VoiceWaveform,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'frame', values: '1 · 2 · 3', code: 'animation frames of `animate-waveform` (not a prop)' },
    ],
    docs: {
      description: {
        component:
          'Live audio while listening (`@/components/agent/voice-waveform`): 20 `--foreground-link` bars breathing between the Figma frame heights. `active` false freezes it; reduced motion and the Motion toolbar show it still. Decorative unless `label` names it.',
      },
    },
  },
  args: { active: true, label: 'Label' },
  argTypes: { active: { control: 'boolean' }, label: { control: 'text' } },
})

/** Active and label are in Controls. */
export const Default = meta.story()

Default.test('with a label it is a named image', async ({ canvas }) => {
  await expect(canvas.getByRole('img', { name: 'Label' })).toBeVisible()
})

/** Next to the listening Mic Button (Figma pairing). */
export const WithMicButton = meta.story({
  args: { label: undefined },
  render: (args) => (
    <div className="flex items-center gap-4 p-4">
      <MicButton status="listening" />
      <VoiceWaveform {...args} />
    </div>
  ),
})
