import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Separator } from './separator'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8225-681'

type DemoProps = {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed'
  /** Story control: Figma `content` text (children). */
  label?: string
  align?: 'start' | 'center' | 'end'
  decorative?: boolean
}

function DemoSeparator({
  orientation = 'horizontal',
  variant = 'solid',
  label = '',
  align = 'center',
  decorative = true,
}: DemoProps) {
  return orientation === 'vertical' ? (
    <div className="flex h-10 items-center gap-4 type-text-sm-normal">
      Label 1
      <Separator orientation="vertical" variant={variant} decorative={decorative} />
      Label 2
    </div>
  ) : (
    <div className="w-80">
      <Separator variant={variant} align={align} decorative={decorative}>
        {label || undefined}
      </Separator>
    </div>
  )
}

const meta = preview.meta({
  title: 'Components/Separator',
  component: DemoSeparator,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A 1px divider (shadcn/ui Separator on Radix): `orientation` horizontal · vertical, `variant` solid · dashed. Pass children for a label (Figma `content` text), placed by `align` start · center · end. Decorative by default; set `decorative={false}` when it separates content semantically.',
      },
    },
  },
  args: { orientation: 'horizontal', variant: 'solid', label: '', align: 'center', decorative: true },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['solid', 'dashed'] },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      if: { arg: 'orientation', eq: 'horizontal' },
    },
    label: { if: { arg: 'orientation', eq: 'horizontal' } },
  },
})

export const Default = meta.story()

Default.test('decorative by default; semantic when asked', async ({ canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=separator]')).toHaveAttribute('role', 'none')
})

Default.test('a semantic separator', { args: { decorative: false } }, async ({ canvas }) => {
  await expect(canvas.getByRole('separator')).toBeInTheDocument()
})

/** Figma vertical × style, and every label position. */
export const Variants = meta.story({
  render: () => (
    <div className="flex items-start gap-16">
      <div className="flex w-60 flex-col gap-8">
        <Separator />
        <Separator variant="dashed" />
      </div>
      <div className="flex h-10 gap-6">
        <Separator orientation="vertical" />
        <Separator orientation="vertical" variant="dashed" />
      </div>
      <div className="flex w-60 flex-col gap-6">
        {(['center', 'start', 'end'] as const).map((align) => (
          <Separator key={align} align={align}>
            Label
          </Separator>
        ))}
        {(['center', 'start', 'end'] as const).map((align) => (
          <Separator key={`dashed-${align}`} variant="dashed" align={align}>
            Label
          </Separator>
        ))}
      </div>
    </div>
  ),
})

Variants.test('the label is read; its lines are hidden', async ({ canvasElement }) => {
  const labelled = canvasElement.querySelector('[data-slot=separator][data-align=center]') as HTMLElement
  await expect(labelled).toHaveTextContent('Label')
  await expect(labelled.querySelector('[data-slot=separator-line]')).toHaveAttribute('aria-hidden', 'true')
})
