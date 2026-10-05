import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { PulseDot } from './pulse-dot'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-13158'

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Agent States/Pulse Dot',
  tags: ['agent-primitive'],
  component: PulseDot,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A pulsing `--agent` dot that says the agent is working (`@/components/agent/pulse-dot`, built on the Spinner pattern). With `label` it is a `role="status"`; without one it is decorative, for use next to text that already names the activity. The motion stops under reduced motion and with the Motion toolbar off.',
      },
    },
  },
  args: { label: 'Label' },
  argTypes: { label: { control: 'text' } },
})

/** The label is in Controls; clear it to make the dot decorative. */
export const Default = meta.story()

Default.test('with a label it is a named status', async ({ canvas }) => {
  await expect(canvas.getByRole('status', { name: 'Label' })).toBeVisible()
})

/** Next to the text it stands for (Figma thinking panel, queued): decorative. */
export const WithText = meta.story({
  args: { label: undefined },
  render: (args) => (
    <span className="flex items-center gap-2 type-text-sm-semibold text-agent dark:text-agent-medium">
      <PulseDot {...args} />
      Subtitle
    </span>
  ),
})

WithText.test('without a label it is hidden from assistive tech', async ({ canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=pulse-dot]')).toHaveAttribute('aria-hidden', 'true')
})
