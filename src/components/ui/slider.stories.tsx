import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent } from 'storybook/test'

import { Field, FieldDescription, FieldLabel } from './field'
import { Slider } from './slider'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10946-184'

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Pick a value or a range on a scale (shadcn/ui Slider on Radix). Figma `mode` single · range is the shape of `value`: one number or two. Label it with a Field (`aria-labelledby`) or `aria-label`; the name reaches every thumb.',
      },
    },
  },
  args: { defaultValue: [60], max: 100, step: 1, disabled: false, 'aria-label': 'Label' },
  argTypes: { disabled: { control: 'boolean' } },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const thumb = canvas.getByRole('slider', { name: 'Label' })
    await expect(thumb).toHaveAttribute('aria-valuenow', '60')
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(thumb).toHaveAttribute('aria-valuenow', '61')
  },
}

/** Figma mode=range: two thumbs, `value` is an array of two numbers. */
export const Range: Story = { args: { defaultValue: [25, 60] } }

export const Disabled: Story = { args: { disabled: true } }

/** In a Field: FieldLabel names the slider; the description shows the current value. */
export const WithField: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState([40])
      return (
        <Field>
          <FieldLabel id="slider-label">Label</FieldLabel>
          <Slider aria-labelledby="slider-label" value={value} onValueChange={setValue} max={100} />
          <FieldDescription>Value {value[0]}</FieldDescription>
        </Field>
      )
    }
    return <Demo />
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('slider', { name: 'Label' })).toHaveAttribute('aria-valuenow', '40')
  },
}
