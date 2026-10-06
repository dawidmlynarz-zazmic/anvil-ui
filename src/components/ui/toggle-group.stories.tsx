import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { BlocksIcon, FileTextIcon, GlobeIcon, Icon } from './icon'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10943-220'
const ITEMS = [
  { value: '1', icon: GlobeIcon, label: 'Web' },
  { value: '2', icon: FileTextIcon, label: 'Files' },
  { value: '3', icon: BlocksIcon, label: 'Connected apps' },
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
    <ToggleGroup
      aria-label="Search in"
      type="multiple"
      variant={variant}
      size={size}
      disabled={disabled}
      defaultValue={['1']}
    >
      {items}
    </ToggleGroup>
  ) : (
    <ToggleGroup
      aria-label="Search in"
      type="single"
      variant={variant}
      size={size}
      disabled={disabled}
      defaultValue="1"
    >
      {items}
    </ToggleGroup>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Toggle Group',
  tags: ['molecule'],
  component: DemoToggleGroup,
  parameters: {
    shadcn: 'toggle-group',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'variant', values: 'default · outline', code: '`variant` prop' }],
    guide: {
      use: [
        'Compact on/off choices that apply immediately: where the assistant searches (Web · Files · Connected apps), a view mode, text formatting.',
        '`type="single"` for one-of-many view switches; `multiple` for independent filters.',
      ],
      avoid: [
        'Switching content panels: use Tabs. A setting saved with a form: use Radio Group or Switch.',
        'Actions that run once (Copy, Regenerate): use Button Group.',
        'More than ~5 options or long labels: use Select.',
      ],
      content: [
        'Icon-only items need a clear, familiar icon and an `aria-label`; add a Tooltip with the same text.',
        'Text items are one word each, parallel in form.',
      ],
      a11y: [
        'Single groups are a `radiogroup` of `radio`s; multiple groups are `button`s with `aria-pressed`.',
        'The group is one tab stop; arrow keys move between items. Name the group with `aria-label`.',
      ],
    },
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
    disabled: { control: 'boolean' },
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
  await expect(canvas.getByRole('radio', { name: 'Connected apps' })).toHaveFocus()
})

Default.test('multiple: items press independently', { args: { type: 'multiple' } }, async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Files' }))
  await expect(canvas.getByRole('button', { name: 'Web' })).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas.getByRole('button', { name: 'Files' })).toHaveAttribute('aria-pressed', 'true')
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
