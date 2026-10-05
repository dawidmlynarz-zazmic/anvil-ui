import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { BoldIcon, Icon, ItalicIcon, UnderlineIcon } from './icon'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10943-220'
const ITEMS = [
  { value: '1', icon: BoldIcon, label: 'Bold' },
  { value: '2', icon: ItalicIcon, label: 'Italic' },
  { value: '3', icon: UnderlineIcon, label: 'Underline' },
]

type DemoProps = {
  type?: 'single' | 'multiple'
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
}

function DemoToggleGroup({
  type = 'single',
  variant = 'default',
  size = 'default',
  disabled = false,
}: DemoProps) {
  const items = ITEMS.map(({ value, icon, label }) => (
    <ToggleGroupItem key={value} value={value} aria-label={label}>
      <Icon icon={icon} />
    </ToggleGroupItem>
  ))
  return type === 'multiple' ? (
    <ToggleGroup type="multiple" variant={variant} size={size} disabled={disabled} defaultValue={['1']}>
      {items}
    </ToggleGroup>
  ) : (
    <ToggleGroup type="single" variant={variant} size={size} disabled={disabled} defaultValue="1">
      {items}
    </ToggleGroup>
  )
}

const meta = preview.meta({
  title: 'Components/Toggle Group',
  component: DemoToggleGroup,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A row of Toggles (shadcn/ui Toggle Group on Radix): `type` single (one pressed) or multiple. `variant` default spaces the items 4px apart; outline joins them into one control. Arrow keys move between items.',
      },
    },
  },
  args: { type: 'single', variant: 'default', size: 'default', disabled: false },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
    variant: { control: 'inline-radio', options: ['default', 'outline'] },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
  },
})

export const Default = meta.story()

Default.test('single: one item pressed; arrow keys move focus', async ({ canvas }) => {
  const [first, second] = canvas.getAllByRole('radio')
  await expect(first).toBeChecked()
  await userEvent.click(second)
  await expect(second).toBeChecked()
  await expect(first).not.toBeChecked()
  await userEvent.keyboard('{ArrowRight}')
  await expect(canvas.getByRole('radio', { name: 'Underline' })).toHaveFocus()
})

Default.test('multiple: items press independently', { args: { type: 'multiple' } }, async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Italic' }))
  await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true')
})

/** Figma variant=default (4px apart) · outline (joined). */
export const Variants = meta.story({
  render: () => (
    <div className="flex items-center gap-10">
      <DemoToggleGroup variant="default" />
      <DemoToggleGroup variant="outline" />
    </div>
  ),
})

Variants.test('outline items share one 1px stroke', async ({ canvasElement }) => {
  const outline = canvasElement.querySelector('[data-slot=toggle-group][data-variant=outline]') as HTMLElement
  const [a, b] = [...outline.querySelectorAll('[data-slot=toggle-group-item]')].map((el) =>
    el.getBoundingClientRect(),
  )
  await expect(Math.round(b.left - a.right)).toBe(-1)
})
