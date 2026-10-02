import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { Label } from './label'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10892-172'
const markers = ['none', 'required', 'optional'] as const

const meta = preview.meta({
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'The one label atom for every form element (shadcn/ui Label; inside a Field it is FieldLabel). `marker` adds a required asterisk or an "(optional)" note. Disabled and invalid follow the control: a disabled Field or peer control dims it; an invalid Field (or `data-invalid`) turns it destructive.',
      },
    },
  },
  args: { children: 'Label', marker: 'none' },
  argTypes: {
    children: { control: 'text' },
    marker: { control: 'inline-radio', options: markers },
    htmlFor: { control: 'text' },
    asChild: { table: { disable: true } },
  },
})

/** Every prop is in Controls. */
export const Default = meta.story()

export const Markers = meta.story({
  render: () => (
    <div className="flex flex-col gap-3">
      {markers.map((marker) => (
        <Label key={marker} marker={marker}>
          Label
        </Label>
      ))}
    </div>
  ),
})

/** Figma states for each marker (columns: none · required · optional; rows: default · disabled · invalid). */
export const States = meta.story({
  render: () => (
    <div className="grid grid-cols-3 gap-6">
      {markers.map((marker) => (
        <div key={marker} className="flex flex-col gap-3">
          <Label marker={marker}>Label</Label>
          {/* A dimmed label belongs to a disabled control (and is then exempt from contrast rules). */}
          <div className="group flex items-center gap-2" data-disabled="true">
            <input id={`disabled-${marker}`} type="checkbox" disabled />
            <Label htmlFor={`disabled-${marker}`} marker={marker}>
              Label
            </Label>
          </div>
          <Label marker={marker} data-invalid="true">
            Label
          </Label>
        </div>
      ))}
    </div>
  ),
})

/** Clicking the label focuses its control; a disabled peer dims the label. */
export const WithControl = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="label-control" marker="required">
          Label
        </Label>
        <input
          id="label-control"
          required
          className="h-10 rounded-md bg-background px-3 type-text-sm-normal text-foreground inset-ring inset-ring-overlay-16"
        />
      </div>
      <div className="flex items-center gap-2">
        <input id="label-peer" type="checkbox" disabled className="peer" />
        <Label htmlFor="label-peer">Label</Label>
      </div>
    </div>
  ),
})

WithControl.test('clicking the label focuses its control', async ({ canvas }) => {
  await userEvent.click(canvas.getByText('Label', { selector: '[for=label-control]' }))
  await expect(canvas.getByRole('textbox')).toHaveFocus()
})
