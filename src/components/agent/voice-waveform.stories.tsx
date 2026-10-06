import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon, MicIcon } from '@/components/ui/icon'
import { VoiceWaveform } from './voice-waveform'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10664-12496'

const meta = preview.meta({
  title: 'Design System/Atoms/Voice Waveform',
  tags: ['atom', 'input'],
  component: VoiceWaveform,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'frame', values: '1 · 2 · 3', code: 'animation frames of `animate-waveform` (not a prop)' },
    ],
    guide: {
      use: [
        'Live feedback while the microphone is listening, next to the pressed voice button in Prompt Input.',
        '`active={false}` to freeze it while paused.',
      ],
      avoid: ['Playing back a recording: use Widget Audio. Generic loading: use Spinner.'],
      content: ['Pair it with a visible state such as “Listening…” or the pressed voice button.'],
      a11y: [
        'Decorative unless `label` names it; the voice button carries the state with `aria-pressed`.',
        'It stays still under reduced motion and with the Motion toolbar off.',
      ],
    },
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

/** Next to the pressed voice button, as in Prompt Input while listening. */
export const WithVoiceButton = meta.story({
  args: { label: undefined },
  render: (args) => (
    <div className="flex items-center gap-4 p-4">
      <Button intent="destructive" size="icon-sm" shape="circle" aria-label="Voice input" aria-pressed>
        <Icon icon={MicIcon} />
      </Button>
      <VoiceWaveform {...args} />
    </div>
  ),
})
