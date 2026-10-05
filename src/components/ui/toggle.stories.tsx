import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { BoldIcon, Icon, ItalicIcon } from './icon'
import { Toggle } from './toggle'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10943-193'
const variants = ['default', 'outline'] as const
const sizes = ['sm', 'default', 'lg'] as const

const meta = preview.meta({
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A two-state button (shadcn/ui Toggle on Radix): `variant` default · outline, `size` sm · default · lg (32 / 40 / 48). `pressed` / `defaultPressed` / `onPressedChange` are Radix props; it is announced as a toggle button (`aria-pressed`). Icon-only toggles need an accessible label.',
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    defaultPressed: false,
    disabled: false,
    'aria-label': 'Label',
    onPressedChange: fn(),
    children: <Icon icon={BoldIcon} />,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    size: { control: 'inline-radio', options: sizes },
    children: { table: { disable: true } },
    asChild: { table: { disable: true } },
  },
})

export const Default = meta.story()

Default.test('click and Space toggle it', async ({ canvas, args }) => {
  const toggle = canvas.getByRole('button', { name: 'Label' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(toggle)
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(args.onPressedChange).toHaveBeenLastCalledWith(true)
  await userEvent.keyboard(' ')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Label' })).toBeDisabled()
})

/** Figma variant × size × pressed × state (reference sheet; use the State control on Default for one). */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {variants.map((variant) =>
        sizes.map((size) => (
          <div key={variant + size} className="flex items-center gap-6">
            <span className="w-28 type-text-xs-medium text-muted-foreground">
              {variant} · {size}
            </span>
            {[false, true].map((pressed) =>
              (['default', 'hover', 'focus-visible', 'disabled'] as const).map((state) => (
                <Toggle
                  key={`${pressed}-${state}`}
                  variant={variant}
                  size={size}
                  defaultPressed={pressed}
                  disabled={state === 'disabled'}
                  aria-label="Label"
                  className={state === 'hover' || state === 'focus-visible' ? `pseudo-${state}` : undefined}
                >
                  <Icon icon={BoldIcon} />
                </Toggle>
              )),
            )}
          </div>
        )),
      )}
    </div>
  ),
})

/** A toggle with a text label grows with its padding. */
export const WithText = meta.story({
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Label">
        <Icon icon={ItalicIcon} />
        Label
      </Toggle>
      <Toggle variant="outline" defaultPressed>
        <Icon icon={ItalicIcon} />
        Label
      </Toggle>
    </div>
  ),
})
