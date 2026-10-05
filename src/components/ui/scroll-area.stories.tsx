import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { ScrollArea, ScrollBar } from './scroll-area'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10892-529'
const ROWS = Array.from({ length: 12 }, (_, i) => `Label ${i + 1}`)

type DemoProps = {
  orientation?: 'vertical' | 'horizontal'
  /** Radix `type`: when the scrollbar shows. */
  type?: 'hover' | 'scroll' | 'auto' | 'always'
}

function DemoScrollArea({ orientation = 'vertical', type = 'hover' }: DemoProps) {
  return orientation === 'vertical' ? (
    <ScrollArea type={type} className="h-55 w-70 rounded-md border border-border bg-background">
      <div className="flex flex-col gap-2 p-4 type-text-sm-normal">
        {ROWS.map((row) => (
          <p key={row}>{row}</p>
        ))}
      </div>
    </ScrollArea>
  ) : (
    <ScrollArea type={type} className="h-30 w-90 rounded-md border border-border bg-background">
      <div className="flex w-max gap-3 p-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-18 w-24 shrink-0 rounded-md bg-muted" />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

const meta = preview.meta({
  title: 'UI Components/Scroll Area',
  tags: ['ui-component'],
  component: DemoScrollArea,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'orientation',
        values: 'vertical · horizontal',
        code: 'which `ScrollBar` is shown (`<ScrollBar orientation="horizontal" />` for sideways content)',
      },
    ],
    docs: {
      description: {
        component:
          'A scroll container with a styled, overlaid scrollbar (shadcn/ui Scroll Area on Radix): a 10px track with a 6px `--border-strong` thumb. Native scrolling, keyboard and wheel keep working; the viewport takes keyboard focus. Add `<ScrollBar orientation="horizontal" />` for sideways content. Radix `type` sets when the bar shows (hover by default).',
      },
    },
  },
  args: { orientation: 'vertical', type: 'hover' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    type: { control: 'inline-radio', options: ['hover', 'scroll', 'auto', 'always'] },
  },
})

export const Default = meta.story()

Default.test('the viewport scrolls its content', async ({ canvasElement }) => {
  const viewport = canvasElement.querySelector('[data-slot=scroll-area-viewport]') as HTMLElement
  await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight)
  viewport.scrollTop = 80
  await expect(viewport.scrollTop).toBe(80)
})

/** Figma orientation=vertical · horizontal with the scrollbar always shown (reference). */
export const Orientations = meta.story({
  render: () => (
    <div className="flex items-start gap-10">
      <DemoScrollArea orientation="vertical" type="always" />
      <DemoScrollArea orientation="horizontal" type="always" />
    </div>
  ),
})

Orientations.test('each area shows its scrollbar', async ({ canvasElement }) => {
  const bars = canvasElement.querySelectorAll('[data-slot=scroll-area-scrollbar]')
  const orientations = new Set([...bars].map((b) => b.getAttribute('data-orientation')))
  await expect([...orientations].sort()).toEqual(['horizontal', 'vertical'])
})
