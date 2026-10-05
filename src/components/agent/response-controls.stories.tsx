import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ResponseControls } from './response-controls'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10735-3117'

const meta = preview.meta({
  title: 'Agent Blocks/Input/Response Controls',
  tags: ['agent-block'],
  component: ResponseControls,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'state', values: 'streaming · stopped · incomplete', code: '`status` prop' }],
    docs: {
      description: {
        component:
          'A floating pill above the composer while a response runs (`@/components/agent/response-controls`): `status` streaming (Stop generating) · stopped (Regenerate, Continue) · incomplete (Continue generating); `onStop`, `onRegenerate`, `onContinue`; `message` overrides the status text (announced politely).',
      },
    },
  },
  args: { status: 'streaming', onStop: fn(), onRegenerate: fn(), onContinue: fn() },
  argTypes: {
    status: { control: 'inline-radio', options: ['streaming', 'stopped', 'incomplete'] },
    message: { control: 'text' },
    onStop: { control: false, table: { category: 'Events' } },
    onRegenerate: { control: false, table: { category: 'Events' } },
    onContinue: { control: false, table: { category: 'Events' } },
  },
})

/** Status is in Controls. */
export const Default = meta.story()

Default.test('Stop generating stops', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Stop generating' }))
  await expect(args.onStop).toHaveBeenCalledOnce()
})

/** Figma state: streaming, stopped, incomplete. */
export const States = meta.story({
  render: (args) => (
    <div className="flex flex-col items-center gap-4">
      <ResponseControls {...args} status="streaming" />
      <ResponseControls {...args} status="stopped" />
      <ResponseControls {...args} status="incomplete" />
    </div>
  ),
})

/** Incomplete: continue from where it stopped. */
export const Incomplete = meta.story({ args: { status: 'incomplete' } })

Incomplete.test('Continue generating continues', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Continue generating' }))
  await expect(args.onContinue).toHaveBeenCalledOnce()
})
