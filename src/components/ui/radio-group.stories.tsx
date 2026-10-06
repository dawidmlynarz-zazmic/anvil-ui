import preview from '#.storybook/preview'
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

const meta = preview.meta({
  title: 'Design System/Atoms/Radio Group',
  tags: ['atom'],
  component: RadioGroup,
  parameters: {
    shadcn: 'radio-group',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'show label',
        values: 'boolean',
        code: 'an inline `Label` next to each `RadioGroupItem`, or not',
      },
      {
        property: 'checked',
        values: 'true · false',
        code: '`value` / `defaultValue` on `RadioGroup` (`data-[state=checked]` on the item)',
      },
      {
        property: 'state',
        values: 'default · hover · disabled · focus',
        code: 'selectors: `hover:` · `disabled:` · `focus-visible:` (not a prop)',
      },
    ],
    guide: {
      use: [
        'One choice from two to five options that people should compare side by side.',
        'Options that need a description each (`aria-describedby` on the item).',
      ],
      avoid: [
        'Many options or a long list: use Select or Combobox. Independent choices: use Checkbox.',
        'Rich options with icons or details: use Choice Card. Switching a view at once: use Tabs or Toggle Group.',
      ],
      content: [
        'The legend names the decision; options are short, parallel and in a logical order.',
        'Preselect the safest or most common option when there is one.',
      ],
      a11y: [
        'Name the group with a FieldSet + FieldLegend (or `aria-label`); each item has a `Label htmlFor`.',
        'Tab enters the group at the checked item; arrow keys move and select.',
      ],
    },
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
    defaultValue: { control: 'inline-radio', options: OPTIONS.map((o) => o.value) },
    value: {
      control: 'inline-radio',
      options: OPTIONS.map((o) => o.value),
      description: 'Controlled value; leave unset for an uncontrolled group',
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    loop: { control: 'boolean' },
    name: { control: 'text' },
    onValueChange: { control: false, table: { category: 'Events' } },
    asChild: { table: { disable: true } },
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
})

/** Every prop is in Controls; hover / focus via the State control. */
export const Default = meta.story()

Default.test('selects by label click and arrow keys', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByText('Label 3'))
  await expect(canvas.getByRole('radio', { name: 'Label 3' })).toBeChecked()
  await expect(args.onValueChange).toHaveBeenCalledWith('3')
  // Keyboard: arrows move and select. Radix moves focus on a timeout and selects only while the
  // arrow key is still down, so hold it (a real key press lasts long enough; a synthetic one not).
  canvas.getByRole('radio', { name: 'Label 3' }).focus()
  await userEvent.keyboard('{ArrowUp>}')
  await waitFor(() => expect(canvas.getByRole('radio', { name: 'Label 2' })).toBeChecked())
  await userEvent.keyboard('{/ArrowUp}')
})

export const Horizontal = meta.story({ args: { orientation: 'horizontal' } })

/** Figma `checked` × `state` (columns: unchecked · checked; rows: default · hover · focus · disabled). For one group, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
      {(['unchecked', 'checked'] as const).map((checked) => (
        <div key={checked} className="flex flex-col gap-4">
          {(['default', 'hover', 'focus', 'disabled'] as const).map((state) => {
            const id = `radio-${checked}-${state}`
            const item = <RadioGroupItem id={id} value="on" disabled={state === 'disabled'} />
            return (
              <RadioGroup
                key={state}
                value={checked === 'checked' ? 'on' : ''}
                aria-label="Title"
                orientation="horizontal"
                className="items-center gap-2"
              >
                {state === 'hover' ? (
                  <span className="pseudo-hover-all contents">{item}</span>
                ) : state === 'focus' ? (
                  <span className="pseudo-focus-visible-all contents">{item}</span>
                ) : (
                  item
                )}
                <Label htmlFor={id}>Label</Label>
              </RadioGroup>
            )
          })}
        </div>
      ))}
    </div>
  ),
})

export const Disabled = meta.story({ args: { disabled: true } })

Disabled.test('every option is disabled', async ({ canvas }) => {
  for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeDisabled()
})

/** With per-option descriptions. */
export const WithDescriptions = meta.story({
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
})
