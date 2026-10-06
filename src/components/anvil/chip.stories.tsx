import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Icon, SparklesIcon } from '@/components/ui/icon'

import { Chip, type ToggleChipProps } from './chip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8278-624'

const SIZES = ['sm', 'default', 'lg'] as const
const STATES = ['default', 'hover', 'focus', 'pressed', 'disabled'] as const

/** Stand-in for a 16px partner logo (Figma content logo). */
function Logo() {
  return <span aria-hidden className="size-4 shrink-0 rounded-sm bg-primary" />
}

function ToggleChip({ pressed: initial = false, ...props }: ToggleChipProps) {
  const [pressed, setPressed] = useState(initial)
  return <Chip {...props} pressed={pressed} onPressedChange={setPressed} />
}

const meta = preview.meta({
  title: 'Design System/Atoms/Chip',
  tags: ['atom'],
  component: ToggleChip,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'variant', values: 'default · outline', code: '`variant` prop' },
      { property: 'size', values: 'lg · sm · default', code: '`size` prop' },
      { property: 'pressed', values: 'false · true', code: '`pressed` prop' },
      {
        property: 'state',
        values: 'default · hover · focus · disabled',
        code: 'selectors: `hover:` · `focus-visible:` · `disabled:` (not a prop)',
      },
      { property: 'label', values: 'text', code: 'children' },
      {
        property: 'show prefix · content',
        values: 'boolean · default · logo',
        code: 'an `<Icon>` or 16px logo child before the label (not a prop)',
      },
      {
        property: 'show icon right · icon right',
        values: 'boolean · instance',
        code: 'pass `onRemove` (+ `removeLabel`) for the remove button',
      },
    ],
    guide: {
      use: [
        'Filters people switch on and off (`pressed`), in a row above results.',
        'Selected values or tags people can remove (`onRemove` + `removeLabel`).',
        'An icon or 16px logo before the label to identify a source or app.',
      ],
      avoid: [
        'A static label or status: use Badge. A suggested reply: use Quick Reply.',
        'An action: use Button. Exactly one option on at a time: use Toggle Group.',
      ],
      content: ['One to three words in sentence case; the remove label names the item: “Remove Label”.'],
      a11y: [
        'A selectable chip is a toggle button (`aria-pressed`); group a filter row with `role="group"` and `aria-label`.',
        'A removable chip has its own remove button named by `removeLabel`; move focus sensibly after removal.',
      ],
    },
    docs: {
      description: {
        component:
          'A selectable or removable token for filters and tags (`@/components/anvil/chip`, on Toggle). `variant` default · outline, `size` sm · default · lg; selectable chips take `pressed` / `defaultPressed` / `onPressedChange` (aria-pressed); with `onRemove` (+ `removeLabel`) it is a removable token with its own remove button. Put an icon or a 16px logo before the label (Figma content logo). For a static label use Badge.',
      },
    },
  },
  args: { variant: 'default', size: 'default', pressed: false, disabled: false, children: 'Label' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'outline'] },
    size: { control: 'inline-radio', options: SIZES },
    children: { control: 'text' },
    pressed: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { control: false },
  },
})

/** Variant, size, pressed, disabled and the label are in Controls. Click to toggle. */
export const Default = meta.story()

Default.test('toggles its pressed state', async ({ canvas }) => {
  const chip = canvas.getByRole('button', { name: 'Label' })
  await expect(chip).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(chip)
  await expect(chip).toHaveAttribute('aria-pressed', 'true')
})

/** Figma variant × size × state, plus pressed (Figma pressed=true). */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {(['default', 'outline'] as const).map((variant) =>
        SIZES.map((size) => (
          <div key={`${variant}-${size}`} className="flex items-center gap-4">
            {STATES.map((state) => (
              <span
                key={state}
                className={
                  state === 'hover' ? 'pseudo-hover-all' : state === 'focus' ? 'pseudo-focus-visible-all' : ''
                }
              >
                <Chip
                  variant={variant}
                  size={size}
                  pressed={state === 'pressed'}
                  disabled={state === 'disabled'}
                >
                  <Icon icon={SparklesIcon} />
                  Label
                </Chip>
              </span>
            ))}
          </div>
        )),
      )}
    </div>
  ),
})

/** Figma content default · logo: an icon or a logo before the label. */
export const WithIconOrLogo = meta.story({
  render: () => (
    <div className="flex items-center gap-2">
      <Chip>
        <Icon icon={SparklesIcon} />
        Label
      </Chip>
      <Chip variant="outline">
        <Logo />
        Label
      </Chip>
    </div>
  ),
})

/** A filter row: each chip toggles on its own. */
export const FilterGroup = meta.story({
  render: () => (
    <div role="group" aria-label="Label" className="flex flex-wrap gap-2">
      {['Label 1', 'Label 2', 'Label 3', 'Label 4'].map((label, i) => (
        <Chip key={label} variant="outline" defaultPressed={i === 0}>
          {label}
        </Chip>
      ))}
    </div>
  ),
})

/** With `onRemove`: removable tokens (Figma show icon right). */
export const Removable = meta.story({
  render: function Render() {
    const [items, setItems] = useState(['Label 1', 'Label 2', 'Label 3'])
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((label) => (
          <Chip
            key={label}
            removeLabel={`Remove ${label}`}
            onRemove={() => setItems((all) => all.filter((item) => item !== label))}
          >
            {label}
          </Chip>
        ))}
      </div>
    )
  },
})

Removable.test('the remove button removes the chip', async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Remove Label 2' }))
  await expect(canvas.queryByText('Label 2')).not.toBeInTheDocument()
  await expect(canvas.getByText('Label 1')).toBeVisible()
})
