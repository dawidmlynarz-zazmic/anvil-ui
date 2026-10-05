import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from './button'
import { Spinner } from './spinner'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-13158'

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'destructive', 'agent'] as const

const meta = preview.meta({
  title: 'Components/Spinner',
  tags: ['ui-component'],
  component: Spinner,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'An indeterminate loading indicator (shadcn/ui Spinner) on the Anvil Icon: `role="status"` named "Loading" (override with `aria-label`), `size` xs · default and `tone` from Icon. Figma has no spinner component; Agent Builder › Core Kit pulse dot and typing indicator are built on it. Buttons have their own `loading` prop.',
      },
    },
  },
  args: { size: 'default', tone: 'neutral' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'default'] },
    tone: { control: 'select', options: TONES },
  },
})

/** Size and tone are in Controls. */
export const Default = meta.story()

Default.test('is a status named Loading', async ({ canvas }) => {
  await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible()
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="xs" />
      <Spinner />
    </div>
  ),
})

export const Tones = meta.story({
  render: () => (
    <div className="flex items-center gap-4">
      {TONES.map((tone) => (
        <Spinner key={tone} tone={tone} aria-label={tone} />
      ))}
    </div>
  ),
})

/** Next to text, and a button's own `loading` state for comparison. */
export const Composition = meta.story({
  render: () => (
    <div className="flex items-center gap-6">
      <span className="flex items-center gap-2 type-text-sm-normal text-muted-foreground">
        <Spinner />
        Subtitle
      </span>
      <Button loading>Save</Button>
    </div>
  ),
})
