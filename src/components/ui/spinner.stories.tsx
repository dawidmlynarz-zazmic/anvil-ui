import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from './button'
import { Spinner } from './spinner'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10667-13158'

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'destructive', 'agent'] as const

const meta = preview.meta({
  title: 'Atoms/Spinner',
  tags: ['atom'],
  component: Spinner,
  parameters: {
    shadcn: 'spinner',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // No Figma component: Spinner has none (Core Kit pulse dot and typing indicator are built on it).
    figmaProps: [],
    guide: {
      use: [
        'A short wait of unknown length inside a region or next to text: loading a list, refreshing a panel.',
      ],
      avoid: [
        'A button that is working: use its `loading` prop. Content with a known layout: use Skeleton.',
        'The agent at work: use Pulse Dot, Text Shimmer or Typing Indicator. Known progress: use Progress.',
      ],
      content: ['Pair it with a present-participle line when the wait is not obvious: “Loading files…”.'],
      a11y: [
        'It is `role="status"` named “Loading”; pass a more specific `aria-label` when the context allows.',
        'Avoid several spinners at once: each one is a status that may be announced.',
      ],
    },
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
    label: { control: 'text' },
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
