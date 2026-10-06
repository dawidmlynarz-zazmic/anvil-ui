import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { Field, FieldContent, FieldDescription, FieldLabel } from './field'
import { Label } from './label'
import { Switch } from './switch'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8230-1847'

const meta = preview.meta({
  title: 'UI Components/Switch',
  tags: ['element'],
  component: Switch,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'show label', values: 'boolean', code: 'an inline `Label`, or not' },
      { property: 'size', values: 'sm · default', code: '`size` prop' },
      {
        property: 'state',
        values: 'default · disabled · hover · focus',
        code: 'selectors: `hover:` · `disabled:` · `focus-visible:` (not a prop)',
      },
      { property: 'checked', values: 'true · false', code: '`checked` / `defaultChecked` prop' },
    ],
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
    checked: {
      control: 'boolean',
      description: 'Controlled checked state; leave unset for an uncontrolled switch',
    },
    defaultChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    name: { control: 'text' },
    onCheckedChange: { control: false, table: { category: 'Events' } },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="sw" {...args} />
      <Label htmlFor="sw">Label</Label>
    </div>
  ),
})

/** Every prop is in Controls; hover / focus via the State control. */
export const Default = meta.story()

Default.test('toggles by label click and Space', async ({ canvas, args }) => {
  const toggle = canvas.getByRole('switch', { name: 'Label' })
  await userEvent.click(canvas.getByText('Label'))
  await expect(toggle).toBeChecked()
  await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
  toggle.focus()
  await userEvent.keyboard(' ')
  await expect(toggle).not.toBeChecked()
})

Default.test('disabled ignores clicks', { args: { disabled: true } }, async ({ canvas, args }) => {
  const toggle = canvas.getByRole('switch', { name: 'Label' })
  await expect(toggle).toBeDisabled()
  await userEvent.click(toggle, { pointerEventsCheck: 0 })
  await expect(args.onCheckedChange).not.toHaveBeenCalled()
})

export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {(['default', 'sm'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Switch id={`sw-${size}`} size={size} defaultChecked />
          <Label htmlFor={`sw-${size}`}>Label</Label>
        </div>
      ))}
    </div>
  ),
})

/** Figma `size` × `checked` × `state` (columns: default off · default on · sm off · sm on; rows: default · hover · focus · disabled). For one switch, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="grid grid-cols-4 gap-x-8 gap-y-4">
      {(['default', 'sm'] as const).flatMap((size) =>
        [false, true].map((checked) => (
          <div key={`${size}-${checked}`} className="flex flex-col gap-4">
            {(['default', 'hover', 'focus', 'disabled'] as const).map((state) => {
              const id = `sw-${size}-${checked}-${state}`
              const control = <Switch id={id} size={size} checked={checked} disabled={state === 'disabled'} />
              return (
                <div key={state} className="flex items-center gap-2">
                  {state === 'hover' ? (
                    <span className="pseudo-hover-all contents">{control}</span>
                  ) : state === 'focus' ? (
                    <span className="pseudo-focus-visible-all contents">{control}</span>
                  ) : (
                    control
                  )}
                  <Label htmlFor={id}>Label</Label>
                </div>
              )
            })}
          </div>
        )),
      )}
    </div>
  ),
})

/** With a description: a horizontal Field (Figma field, orientation=horizontal, control=switch). */
export const WithField = meta.story({
  render: () => (
    <Field orientation="horizontal" className="w-96">
      <Switch id="sw-field" defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor="sw-field">Label</FieldLabel>
        <FieldDescription>Subtitle</FieldDescription>
      </FieldContent>
    </Field>
  ),
})
