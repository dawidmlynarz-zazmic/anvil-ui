import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent } from 'storybook/test'

import { Field, FieldContent, FieldDescription, FieldLabel } from './field'
import { Label } from './label'
import { Switch } from './switch'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8230-1847'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Switch with an inline Label (shadcn/ui Switch + Label) for settings that apply immediately. `size` default · sm. Need a description? Use a horizontal Field.',
      },
    },
  },
  args: { size: 'default', disabled: false, onCheckedChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="sw" {...args} />
      <Label htmlFor="sw">Stream responses</Label>
    </div>
  ),
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const toggle = canvas.getByRole('switch', { name: 'Stream responses' })
    await userEvent.click(canvas.getByText('Stream responses'))
    await expect(toggle).toBeChecked()
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    toggle.focus()
    await userEvent.keyboard(' ')
    await expect(toggle).not.toBeChecked()
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['default', 'sm'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Switch id={`sw-${size}`} size={size} defaultChecked />
          <Label htmlFor={`sw-${size}`}>Size {size}</Label>
        </div>
      ))}
    </div>
  ),
}

/** Figma `size` × `checked` × `state`; hover and focus forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['[data-demo="hover"]'], focusVisible: ['[data-demo="focus"]'] },
  },
  render: () => (
    <div className="grid grid-cols-4 gap-x-8 gap-y-4">
      {(['default', 'sm'] as const).flatMap((size) =>
        [false, true].map((checked) => (
          <div key={`${size}-${checked}`} className="flex flex-col gap-4">
            {(['default', 'hover', 'focus', 'disabled'] as const).map((state) => {
              const id = `sw-${size}-${checked}-${state}`
              return (
                <div key={state} className="flex items-center gap-2">
                  <Switch
                    id={id}
                    size={size}
                    checked={checked}
                    data-demo={state}
                    disabled={state === 'disabled'}
                  />
                  <Label htmlFor={id}>
                    {size} · {checked ? 'on' : 'off'} · {state}
                  </Label>
                </div>
              )
            })}
          </div>
        )),
      )}
    </div>
  ),
}

/** With a description: a horizontal Field (Figma field, orientation=horizontal, control=switch). */
export const WithField: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-96">
      <Switch id="memory" defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor="memory">Conversation memory</FieldLabel>
        <FieldDescription>The agent remembers earlier conversations with the same user.</FieldDescription>
      </FieldContent>
    </Field>
  ),
}
