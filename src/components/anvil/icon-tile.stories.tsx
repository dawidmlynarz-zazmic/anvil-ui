import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { SparklesIcon } from '@/components/ui/icon'

import { IconTile } from './icon-tile'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10843-4460'

const TONES = [
  'neutral',
  'brand',
  'agent',
  'info',
  'success',
  'warning',
  'destructive',
  'surface',
  'inverse',
] as const
const SIZES = ['xs', 'sm', 'default', 'lg'] as const

const meta = preview.meta({
  title: 'UI Components/Icon Tile',
  tags: ['element', 'anvil-custom'],
  component: IconTile,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'icon', values: 'instance', code: '`icon` prop (or an image as children)' },
      {
        property: 'tone',
        values: 'neutral · agent · info · success · warning · destructive · surface · inverse',
        code: '`tone` prop (adds brand)',
      },
      { property: 'size', values: '24 · 32 · 40 · 48', code: '`size` xs · sm · default · lg' },
      { property: 'shape', values: 'rounded · circle', code: '`shape` default · circle' },
    ],
    docs: {
      description: {
        component:
          'An icon on a tinted square or circle (`@/components/anvil/icon-tile`). It leads card headers, rows and banners: Approval Card, Connector Card, Clarifying Question, File Output Card, Instructions Banner, Memory Manager. `tone`, `size` xs · sm · default · lg (24 / 32 / 40 / 48), `shape` default · circle. Decorative: the text beside it names the thing.',
      },
    },
  },
  args: { icon: SparklesIcon, tone: 'agent' as const, size: 'default' as const, shape: 'default' as const },
  argTypes: {
    icon: { control: false },
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    shape: { control: 'inline-radio', options: ['default', 'circle'] },
  },
})

/** Tone, size and shape are in Controls. */
export const Default = meta.story()

Default.test('is decorative', async ({ canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=icon-tile]')).toHaveAttribute('aria-hidden', 'true')
})

/** Every tone. Inverse sits on a dark surface. */
export const Tones = meta.story({
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {TONES.map((tone) =>
        tone === 'inverse' ? (
          <span key={tone} className="rounded-lg bg-background-inverse p-2">
            <IconTile {...args} tone={tone} />
          </span>
        ) : (
          <IconTile key={tone} {...args} tone={tone} />
        ),
      )}
    </div>
  ),
})

/** Sizes 24 / 32 / 40 / 48, both shapes. */
export const SizesAndShapes = meta.story({
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['default', 'circle'] as const).map((shape) => (
        <div key={shape} className="flex items-center gap-3">
          {SIZES.map((size) => (
            <IconTile key={size} {...args} size={size} shape={shape} />
          ))}
        </div>
      ))}
    </div>
  ),
})
