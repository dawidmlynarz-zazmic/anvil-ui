import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { TextShimmer } from './text-shimmer'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10734-2762'

const meta = preview.meta({
  title: 'Agent Builder/Core Kit/Agent States/Text Shimmer',
  component: TextShimmer,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Status text with a moving highlight while the agent works (`@/components/agent/text-shimmer`): "Searching…", a running tool call. text/sm/medium, `--muted-foreground` with a `--foreground` sweep; static under reduced motion. `asChild` applies it to another element (e.g. a heading). The text stays readable to assistive tech.',
      },
    },
  },
  args: { children: 'Subtitle' },
  argTypes: { children: { control: 'text' } },
})

/** The text is in Controls. */
export const Default = meta.story()

Default.test('the text is present and animated', async ({ canvas }) => {
  const text = canvas.getByText('Subtitle')
  await expect(getComputedStyle(text).animationName).toBe('shimmer')
})

/** `asChild` keeps the element and its size; here, a smaller label. */
export const AsChild = meta.story({
  render: () => (
    <TextShimmer asChild className="type-text-xs-medium">
      <p>Subtitle</p>
    </TextShimmer>
  ),
})
