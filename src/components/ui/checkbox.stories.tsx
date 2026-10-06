import preview from '#.storybook/preview'
import { useState } from 'react'
import { expect, fn, userEvent } from 'storybook/test'

import { Checkbox } from './checkbox'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from './field'
import { Label } from './label'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8230-1312'
const checkedValues = [false, true, 'indeterminate'] as const

const meta = preview.meta({
  title: 'Design System/Atoms/Checkbox',
  tags: ['atom'],
  component: Checkbox,
  parameters: {
    shadcn: 'checkbox',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'checked', values: 'indeterminate · true · false', code: '`checked` prop' },
      {
        property: 'state',
        values: 'default · hover · disabled · focus · invalid',
        code: 'selectors: `hover:` · `disabled:` · `focus-visible:` · `aria-invalid` (not a prop)',
      },
      { property: 'show label', values: 'boolean', code: 'an inline `Label` beside it or not' },
    ],
    guide: {
      use: [
        'Independent yes / no choices that are saved with a form: consent, options, items in a list.',
        'Selecting several items; a parent with `checked="indeterminate"` when only some children are on.',
        'A horizontal Field when the option needs a description or an error.',
      ],
      avoid: [
        'A setting that applies at once: use Switch. One choice out of several: use Radio Group.',
        'Filter tokens in a toolbar or above results: use Chip.',
      ],
      content: [
        'The label states the positive choice (“Send me a weekly summary”), never a negation.',
        'Sentence case, no trailing punctuation; put details in the FieldDescription, not the label.',
      ],
      a11y: [
        'Always pair it with a `Label htmlFor` (or FieldLabel): clicking the label toggles it.',
        'Space toggles it; group related checkboxes in a FieldSet with a FieldLegend.',
        'Mark errors with `aria-invalid` and a FieldError, not with color alone.',
      ],
    },
    docs: {
      description: {
        component:
          'Checkbox with an inline Label (shadcn/ui Checkbox + Label). `checked` false · true · "indeterminate". Need a description or an error? Put it in a horizontal Field.',
      },
    },
  },
  args: { onCheckedChange: fn(), disabled: false },
  argTypes: {
    checked: {
      control: 'inline-radio',
      options: checkedValues,
      description: 'Controlled checked state; leave unset for an uncontrolled checkbox',
    },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    'aria-invalid': { control: 'boolean', description: 'Invalid state (Figma state=invalid)' },
    onCheckedChange: { control: false, table: { category: 'Events' } },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="cb" {...args} />
      <Label htmlFor="cb">Label</Label>
    </div>
  ),
})

/** Every prop is in Controls; hover / focus via the State control. */
export const Default = meta.story()

Default.test('toggles by label click and Space', async ({ canvas, args }) => {
  const checkbox = canvas.getByRole('checkbox', { name: 'Label' })
  await userEvent.click(canvas.getByText('Label'))
  await expect(checkbox).toBeChecked()
  await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
  checkbox.focus()
  await userEvent.keyboard(' ')
  await expect(checkbox).not.toBeChecked()
})

Default.test('disabled ignores clicks', { args: { disabled: true } }, async ({ canvas, args }) => {
  const checkbox = canvas.getByRole('checkbox', { name: 'Label' })
  await expect(checkbox).toBeDisabled()
  await userEvent.click(checkbox, { pointerEventsCheck: 0 })
  await expect(args.onCheckedChange).not.toHaveBeenCalled()
})

/** Figma `checked` × `state` (columns: false · true · indeterminate; rows: default · hover · focus · invalid · disabled). For one checkbox, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="grid grid-cols-3 gap-x-10 gap-y-4">
      {checkedValues.map((checked) => (
        <div key={String(checked)} className="flex flex-col gap-4">
          {(['default', 'hover', 'focus', 'invalid', 'disabled'] as const).map((state) => {
            const id = `cb-${String(checked)}-${state}`
            const box = (
              <Checkbox
                id={id}
                checked={checked}
                aria-invalid={state === 'invalid' || undefined}
                disabled={state === 'disabled'}
              />
            )
            return (
              <div key={state} className="flex items-center gap-2">
                {state === 'hover' ? (
                  <span className="pseudo-hover-all contents">{box}</span>
                ) : state === 'focus' ? (
                  <span className="pseudo-focus-visible-all contents">{box}</span>
                ) : (
                  box
                )}
                <Label htmlFor={id}>Label</Label>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  ),
})

/** Parent with indeterminate state for a partial selection. */
export const Indeterminate = meta.story({
  render: () => {
    function Group() {
      const [tools, setTools] = useState({ 'Label 1': true, 'Label 2': false, 'Label 3': false })
      const values = Object.values(tools)
      const all = values.every(Boolean) ? true : values.some(Boolean) ? 'indeterminate' : false
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="all"
              checked={all}
              onCheckedChange={(v) => setTools({ 'Label 1': !!v, 'Label 2': !!v, 'Label 3': !!v })}
            />
            <Label htmlFor="all">Label</Label>
          </div>
          <div className="ml-7 flex flex-col gap-3">
            {(Object.keys(tools) as (keyof typeof tools)[]).map((key) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`item-${key.slice(-1)}`}
                  checked={tools[key]}
                  onCheckedChange={(v) => setTools((t) => ({ ...t, [key]: !!v }))}
                />
                <Label htmlFor={`item-${key.slice(-1)}`}>{key}</Label>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return <Group />
  },
})

Indeterminate.test('parent checks every child', async ({ canvas }) => {
  const all = canvas.getByRole('checkbox', { name: 'Label' })
  await expect(all).toHaveAttribute('data-state', 'indeterminate')
  await userEvent.click(all)
  await expect(canvas.getByRole('checkbox', { name: 'Label 3' })).toBeChecked()
})

/** With a description or error: a horizontal Field (Figma field, orientation=horizontal). */
export const WithField = meta.story({
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Field orientation="horizontal">
        <Checkbox id="cb-field" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="cb-field">Label</FieldLabel>
          <FieldDescription>Subtitle</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-invalid="true">
        <Checkbox id="cb-invalid" aria-invalid />
        <FieldContent>
          <FieldLabel htmlFor="cb-invalid">Label</FieldLabel>
          <FieldError>Subtitle</FieldError>
        </FieldContent>
      </Field>
    </div>
  ),
})
