import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { FieldDescription, FieldLegend, FieldSet } from './field'
import { Label } from './label'
import { RadioGroup, RadioGroupItem } from './radio-group'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8230-2112'
const OPTIONS = [
  { value: '1', label: 'Label 1' },
  { value: '2', label: 'Label 2' },
  { value: '3', label: 'Label 3' },
]

const meta = {
  title: 'Components/Radio Group',
  component: RadioGroup,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Radio buttons with inline Labels (shadcn/ui RadioGroup + RadioGroupItem + Label). Label the group with a FieldSet + FieldLegend (or a Field). `orientation` vertical · horizontal.',
      },
    },
  },
  args: { defaultValue: '2', orientation: 'vertical', onValueChange: fn(), disabled: false },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
  },
  render: (args) => (
    <FieldSet>
      <FieldLegend variant="label">Title</FieldLegend>
      <RadioGroup {...args} aria-label="Title">
        {OPTIONS.map((o) => (
          <div key={o.value} className="flex items-center gap-2">
            <RadioGroupItem id={`len-${o.value}`} value={o.value} />
            <Label htmlFor={`len-${o.value}`}>{o.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </FieldSet>
  ),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText('Label 3'))
    await expect(canvas.getByRole('radio', { name: 'Label 3' })).toBeChecked()
    await expect(args.onValueChange).toHaveBeenCalledWith('3')
    // Keyboard: arrows move and select. Radix moves focus on a timeout and selects only while the
    // arrow key is still down, so hold it (a real key press lasts long enough; a synthetic one not).
    canvas.getByRole('radio', { name: 'Label 3' }).focus()
    await userEvent.keyboard('{ArrowUp>}')
    await waitFor(() => expect(canvas.getByRole('radio', { name: 'Label 2' })).toBeChecked())
    await userEvent.keyboard('{/ArrowUp}')
  },
}

export const Horizontal: Story = { args: { orientation: 'horizontal' } }

/** Figma `checked` × `state` (columns: unchecked · checked; rows: default · hover · focus · disabled); hover and focus forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['[data-demo="hover"]'], focusVisible: ['[data-demo="focus"]'] },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
      {(['unchecked', 'checked'] as const).map((checked) => (
        <div key={checked} className="flex flex-col gap-4">
          {(['default', 'hover', 'focus', 'disabled'] as const).map((state) => {
            const id = `radio-${checked}-${state}`
            return (
              <RadioGroup
                key={state}
                value={checked === 'checked' ? 'on' : ''}
                aria-label="Title"
                orientation="horizontal"
                className="items-center gap-2"
              >
                <RadioGroupItem id={id} value="on" data-demo={state} disabled={state === 'disabled'} />
                <Label htmlFor={id}>Label</Label>
              </RadioGroup>
            )
          })}
        </div>
      ))}
    </div>
  ),
}

export const Disabled: Story = { args: { disabled: true } }

/** With per-option descriptions. */
export const WithDescriptions: Story = {
  render: () => (
    <FieldSet className="w-80">
      <FieldLegend variant="label">Title</FieldLegend>
      <RadioGroup defaultValue="1" aria-label="Title">
        {[
          { value: '1', label: 'Label 1', hint: 'Subtitle' },
          { value: '2', label: 'Label 2', hint: 'Subtitle' },
          { value: '3', label: 'Label 3', hint: 'Subtitle' },
        ].map((o) => (
          <div key={o.value} className="flex items-start gap-2">
            <RadioGroupItem id={`esc-${o.value}`} value={o.value} aria-describedby={`esc-${o.value}-hint`} />
            <div className="flex flex-col gap-1">
              <Label htmlFor={`esc-${o.value}`}>{o.label}</Label>
              <FieldDescription id={`esc-${o.value}-hint`}>{o.hint}</FieldDescription>
            </div>
          </div>
        ))}
      </RadioGroup>
    </FieldSet>
  ),
}
