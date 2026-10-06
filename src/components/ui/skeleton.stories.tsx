import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Skeleton } from './skeleton'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10671-2510'

const meta = preview.meta({
  title: 'Atoms/Skeleton',
  tags: ['atom'],
  component: Skeleton,
  parameters: {
    shadcn: 'skeleton',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'shape', values: 'line · block · circle', code: '`shape` prop' }],
    docs: {
      description: {
        component:
          'A loading placeholder (shadcn/ui Skeleton): `shape` line · block · circle on `--muted`, sized with `className`. It pulses unless motion is reduced. Mark the loading region with `aria-busy` and give it a label; the skeletons themselves are decorative.',
      },
    },
  },
  args: { shape: 'line', className: 'w-40' },
  argTypes: {
    shape: { control: 'inline-radio', options: ['line', 'block', 'circle'] },
    className: { control: 'text' },
  },
})

export const Default = meta.story()

/** Figma shape=line · block · circle. */
export const Shapes = meta.story({
  render: () => (
    <div className="flex items-start gap-8">
      <Skeleton shape="line" className="w-40" />
      <Skeleton shape="block" className="h-24 w-60" />
      <Skeleton shape="circle" className="size-8" />
    </div>
  ),
})

/** A loading card: the region is busy and labelled; the skeletons are decoration. */
export const Composition = meta.story({
  render: () => (
    <div aria-busy="true" aria-label="Label" role="status" className="flex w-80 items-center gap-4">
      <Skeleton shape="circle" className="size-10" aria-hidden />
      <div className="flex flex-1 flex-col gap-2" aria-hidden>
        <Skeleton shape="line" className="w-3/4" />
        <Skeleton shape="line" className="w-1/2" />
      </div>
    </div>
  ),
})

Composition.test('the loading region is announced', async ({ canvas }) => {
  await expect(canvas.getByRole('status', { name: 'Label' })).toHaveAttribute('aria-busy', 'true')
})
