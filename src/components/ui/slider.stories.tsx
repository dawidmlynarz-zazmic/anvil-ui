import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'

import { Field, FieldDescription, FieldLabel } from './field'
import { Slider } from './slider'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10946-184'

const meta = preview.meta({
  title: 'Design System/Atoms/Slider',
  tags: ['atom'],
  component: Slider,
  parameters: {
    shadcn: 'slider',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'mode',
        values: 'single · range',
        code: 'the shape of `value` / `defaultValue`: one number or two',
      },
      {
        property: 'state',
        values: 'default · hover · focus · disabled',
        code: 'selectors: `hover:` (drawn as default) · `focus-visible:` · `disabled:` / `data-[disabled]:` (not a prop)',
      },
    ],
    guide: {
      use: [
        'An approximate value on a continuous scale where the position matters more than the number.',
        'A range (two thumbs) such as a price or date span.',
      ],
      avoid: [
        'An exact number: use Input (`type="number"`). A few named options: use Radio Group or Toggle Group.',
      ],
      content: [
        'Label it and show the current value with its unit beside it.',
        'Choose `min`, `max` and `step` so each keyboard step is meaningful.',
      ],
      a11y: [
        'Name it with `aria-label` or a FieldLabel (`aria-labelledby`); the name reaches every thumb.',
        'Arrow keys step, Page Up / Down jump, Home / End go to the ends.',
        'Show the value as text, not only as the thumb position.',
      ],
    },
    docs: {
      description: {
        component:
          'Pick a value or a range on a scale (shadcn/ui Slider on Radix). Figma `mode` single · range is the shape of `value`: one number or two. Label it with a Field (`aria-labelledby`) or `aria-label`; the name reaches every thumb.',
      },
    },
  },
  args: {
    defaultValue: [60],
    min: 0,
    max: 100,
    step: 1,
    orientation: 'horizontal',
    disabled: false,
    'aria-label': 'Label',
    onValueChange: fn(),
  },
  argTypes: {
    defaultValue: { control: 'object', description: 'One number (single) or two (range)' },
    value: { control: 'object', description: 'Controlled value; leave unset for an uncontrolled slider' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    inverted: { control: 'boolean' },
    minStepsBetweenThumbs: { control: 'number' },
    'aria-label': { control: 'text' },
    onValueChange: { control: false, table: { category: 'Events' } },
    onValueCommit: { control: false, table: { category: 'Events' } },
    asChild: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
})

/** Every prop is in Controls; hover / focus via the State control. */
export const Default = meta.story()

Default.test('arrow keys change the value', async ({ canvas, args }) => {
  const thumb = canvas.getByRole('slider', { name: 'Label' })
  await expect(thumb).toHaveAttribute('aria-valuenow', '60')
  thumb.focus()
  await userEvent.keyboard('{ArrowRight}')
  await expect(thumb).toHaveAttribute('aria-valuenow', '61')
  await expect(args.onValueChange).toHaveBeenCalledWith([61])
})

/** Figma mode=range: two thumbs, `value` is an array of two numbers. */
export const Range = meta.story({ args: { defaultValue: [25, 60] } })

Range.test('renders two thumbs', async ({ canvas }) => {
  await expect(canvas.getAllByRole('slider', { name: 'Label' })).toHaveLength(2)
})

export const Disabled = meta.story({ args: { disabled: true } })

/** In a Field: FieldLabel names the slider; the description shows the current value. */
export const WithField = meta.story({
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
})

WithField.test('FieldLabel names the slider', async ({ canvas }) => {
  await expect(canvas.getByRole('slider', { name: 'Label' })).toHaveAttribute('aria-valuenow', '40')
})
