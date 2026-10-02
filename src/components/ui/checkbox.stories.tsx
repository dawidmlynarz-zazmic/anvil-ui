import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'

import { Checkbox } from './checkbox'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from './field'
import { Label } from './label'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8230-1312'
const checkedValues = [false, true, 'indeterminate'] as const

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Checkbox with an inline Label (shadcn/ui Checkbox + Label). `checked` false · true · "indeterminate". Need a description or an error? Put it in a horizontal Field.',
      },
    },
  },
  args: { onCheckedChange: fn(), disabled: false },
  argTypes: {
    checked: { control: 'inline-radio', options: checkedValues },
    disabled: { control: 'boolean' },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="cb" {...args} />
      <Label htmlFor="cb">Accept terms</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, args }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept terms' })
    await userEvent.click(canvas.getByText('Accept terms'))
    await expect(checkbox).toBeChecked()
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    await userEvent.keyboard(' ')
    await expect(checkbox).not.toBeChecked()
  },
}

/** Figma `checked` × `state`; hover and focus forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: {
    pseudo: { hover: ['[data-demo="hover"]'], focusVisible: ['[data-demo="focus"]'] },
  },
  render: () => (
    <div className="grid grid-cols-3 gap-x-10 gap-y-4">
      {checkedValues.map((checked) => (
        <div key={String(checked)} className="flex flex-col gap-4">
          {(['default', 'hover', 'focus', 'invalid', 'disabled'] as const).map((state) => {
            const id = `cb-${String(checked)}-${state}`
            return (
              <div key={state} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  data-demo={state}
                  aria-invalid={state === 'invalid' || undefined}
                  disabled={state === 'disabled'}
                />
                <Label htmlFor={id}>
                  {String(checked)} · {state}
                </Label>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  ),
}

/** Parent with indeterminate state for a partial selection. */
export const Indeterminate: Story = {
  render: () => {
    function Group() {
      const [tools, setTools] = useState({ search: true, code: false, files: false })
      const values = Object.values(tools)
      const all = values.every(Boolean) ? true : values.some(Boolean) ? 'indeterminate' : false
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="all"
              checked={all}
              onCheckedChange={(v) => setTools({ search: !!v, code: !!v, files: !!v })}
            />
            <Label htmlFor="all">All tools</Label>
          </div>
          <div className="ml-7 flex flex-col gap-3">
            {(Object.keys(tools) as (keyof typeof tools)[]).map((key) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={tools[key]}
                  onCheckedChange={(v) => setTools((t) => ({ ...t, [key]: !!v }))}
                />
                <Label htmlFor={key}>{key}</Label>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return <Group />
  },
  play: async ({ canvas }) => {
    const all = canvas.getByRole('checkbox', { name: 'All tools' })
    await expect(all).toHaveAttribute('data-state', 'indeterminate')
    await userEvent.click(all)
    await expect(canvas.getByRole('checkbox', { name: 'files' })).toBeChecked()
  },
}

/** With a description or error: a horizontal Field (Figma field, orientation=horizontal). */
export const WithField: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Field orientation="horizontal">
        <Checkbox id="share" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="share">Share transcripts with the team</FieldLabel>
          <FieldDescription>Teammates can read conversations in this workspace.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-invalid="true">
        <Checkbox id="policy" aria-invalid />
        <FieldContent>
          <FieldLabel htmlFor="policy">Accept the data policy</FieldLabel>
          <FieldError>You need to accept the policy to continue.</FieldError>
        </FieldContent>
      </Field>
    </div>
  ),
}
