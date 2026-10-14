import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Stepper } from './stepper'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10683-4619'

const meta = preview.meta({
  title: 'Design System/Molecules/Stepper',
  tags: ['molecule'],
  component: Stepper,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'default · min · max',
        code: 'not a prop: the decrement button is disabled at `min`, the increment at `max`',
      },
      { property: 'value', values: 'text', code: '`value` / `defaultValue` (a number)' },
    ],
    guide: {
      use: [
        'A small whole number the user sets by tapping: tickets, guests, rooms, cart quantity.',
        'Give it `min` and `max` so the buttons disable at the limits; set `step` for pairs or packs.',
        'Pair it with a running total beside it (Quantity Selector does this for ticket types).',
      ],
      avoid: [
        'A number the user types or a large range: use Input type=number or Slider.',
        'A choice between a few named options: use Radio Group or Toggle Group.',
        'Stages of a process: use Progress Steps (it is not this control).',
      ],
      content: [
        '`label` says what is counted (“Adult tickets”); the visible name sits beside the control.',
        'Show the unit or price in the row, not inside the stepper.',
      ],
      a11y: [
        'The control is a group named by `label`; the buttons are “Decrease label” / “Increase label” and disable at the limits.',
        'The value is an `<output>` with `aria-live="polite"`, so a screen reader hears the new number after each tap.',
      ],
    },
    docs: {
      description: {
        component:
          'A numeric − / + control (`@/components/anvil/stepper`, Figma Forms › stepper): two outline Buttons around the value. Controlled (`value`, `onValueChange`) or uncontrolled (`defaultValue`); `min`, `max` and `step` bound it. Figma state default · min · max is not a prop: the buttons disable at the limits.',
      },
    },
  },
  args: { defaultValue: 2, min: 0, max: 8, step: 1, label: 'Tickets', disabled: false, onValueChange: fn() },
  argTypes: {
    value: { control: 'number' },
    defaultValue: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    onValueChange: { control: false, table: { category: 'Events' } },
  },
})

export const Default = meta.story()

Default.test('counts up and down and reports each change', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Increase Tickets' }))
  await expect(canvas.getByRole('status')).toHaveTextContent('3')
  await expect(args.onValueChange).toHaveBeenLastCalledWith(3)
  await userEvent.click(canvas.getByRole('button', { name: 'Decrease Tickets' }))
  await userEvent.click(canvas.getByRole('button', { name: 'Decrease Tickets' }))
  await expect(args.onValueChange).toHaveBeenLastCalledWith(1)
})

/** Figma state default · min · max: the button at the limit is disabled. */
export const Limits = meta.story({
  render: () => (
    <div className="flex items-center gap-6">
      <Stepper label="Default" defaultValue={2} max={8} />
      <Stepper label="At min" defaultValue={0} max={8} />
      <Stepper label="At max" defaultValue={8} max={8} />
    </div>
  ),
})

Limits.test('disables the button at each limit', async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Decrease At min' })).toBeDisabled()
  await expect(canvas.getByRole('button', { name: 'Increase At min' })).toBeEnabled()
  await expect(canvas.getByRole('button', { name: 'Increase At max' })).toBeDisabled()
})

/** `step` moves in packs; `disabled` locks the whole control. */
export const StepAndDisabled = meta.story({
  render: () => (
    <div className="flex items-center gap-6">
      <Stepper label="Pairs" defaultValue={4} step={2} max={10} />
      <Stepper label="Locked" defaultValue={2} disabled />
    </div>
  ),
})

/** Controlled: the value lives in your state, for example next to a running total. */
export const Controlled = meta.story({
  render: () => {
    const [value, setValue] = useState(2)
    return (
      <div className="flex items-center gap-4">
        <Stepper label="Adult tickets" value={value} onValueChange={setValue} max={8} />
        <span className="type-text-sm-normal text-muted-foreground">${value * 45}.00</span>
      </div>
    )
  },
})
