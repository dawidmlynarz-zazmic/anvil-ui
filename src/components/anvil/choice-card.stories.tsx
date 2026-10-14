import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { RadioGroup } from '@/components/ui/radio-group'
import { CalendarIcon, TruckIcon, ZapIcon } from '@/components/ui/icon'

import { ChoiceCard } from './choice-card'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10873-24'

const meta = preview.meta({
  title: 'Design System/Molecules/Choice Card',
  tags: ['molecule'],
  component: ChoiceCard,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    shadcn: 'radio-group',
    figmaProps: [
      { property: 'control', values: 'radio · checkbox · none', code: '`control` prop' },
      {
        property: 'state',
        values: 'default · selected · hover · focus · disabled',
        code: 'selectors: `has-data-[state=checked]` (selected) · `hover:` · `has-focus-visible:` · `has-disabled:`; `disabled` prop',
      },
      { property: 'title · detail · value', values: 'text', code: '`title` · `detail` · `trailing`' },
      { property: 'show tile', values: 'boolean', code: 'pass `icon` or not' },
      { property: 'show detail · show value', values: 'boolean', code: 'pass `detail` / `trailing` or not' },
    ],
    guide: {
      use: [
        'A choice that needs more than a label: a delivery option with a date and a price, a plan, a meeting mode.',
        'Radio cards inside a `RadioGroup` for one choice; checkbox cards for several (extras, add-ons).',
        '`control="none"` when the whole card reads as the choice (the radio stays for keyboard and screen readers).',
      ],
      avoid: [
        'A short list of plain labels: use Radio Group or Checkbox with a Label.',
        'Cards that open something when clicked: use a clickable Card or Item.',
        'More than about six options: use Select or Combobox.',
      ],
      content: [
        '`title` names the option (“Standard delivery”); `detail` adds one line (“Arrives Thu 16 Oct”); `trailing` is the price or value (“$4.00”).',
        'Keep titles parallel across the set and put the recommended one first.',
      ],
      a11y: [
        'The card is a label for a real radio or checkbox, so arrow keys, Space and form submission work as usual; the radio group needs a name from a Field legend or `aria-label`.',
        'Selected is shown by the fill and a thicker stroke and is also announced as checked.',
      ],
    },
    docs: {
      description: {
        component:
          'A selectable card (`@/components/anvil/choice-card`, Figma Forms › choice card): shadcn’s Field choice-card pattern with a radio, a checkbox or no visible control, an optional Icon Tile, `title`, `detail` and a `trailing` value. Radio and none go in a `RadioGroup` and use `value`; a checkbox card is controlled with `checked` / `onCheckedChange`. Built on Field, Radio Group, Checkbox and Icon Tile.',
      },
    },
  },
  args: {
    control: 'radio' as const,
    value: 'standard',
    title: 'Standard delivery',
    detail: 'Arrives Thu 16 Oct',
    trailing: '$4.00',
    icon: TruckIcon,
    disabled: false,
  },
  argTypes: {
    control: { control: 'inline-radio', options: ['radio', 'checkbox', 'none'] },
    value: { control: 'text' },
    title: { control: 'text' },
    detail: { control: 'text' },
    trailing: { control: 'text' },
    disabled: { control: 'boolean' },
    icon: { control: false },
    checked: { control: false },
    onCheckedChange: { control: false, table: { category: 'Events' } },
  },
  decorators: [
    (Story, { args }) =>
      args.control === 'checkbox' ? (
        <div className="w-96">
          <Story />
        </div>
      ) : (
        <RadioGroup aria-label="Delivery" className="w-96">
          <Story />
        </RadioGroup>
      ),
  ],
})

/** Radio · checkbox · none is in Controls. */
export const Default = meta.story()

Default.test('selecting the card checks its radio', async ({ canvas }) => {
  await userEvent.click(canvas.getByText('Standard delivery'))
  await expect(canvas.getByRole('radio', { name: /Standard delivery/ })).toBeChecked()
})

/** Figma control × state: unselected and selected for each control, plus disabled. */
export const Controls = meta.story({
  decorators: [],
  render: () => (
    <div className="grid w-200 grid-cols-2 gap-x-6 gap-y-3">
      {(['radio', 'checkbox', 'none'] as const).map((control) =>
        [false, true].map((on) => {
          const props = {
            control,
            title: 'Standard delivery',
            detail: 'Arrives Thu 16 Oct',
            trailing: '$4.00',
            icon: TruckIcon,
          }
          return control === 'checkbox' ? (
            <ChoiceCard key={control + on} value={control + on} {...props} defaultChecked={on} />
          ) : (
            <RadioGroup
              key={control + on}
              defaultValue={on ? control : undefined}
              aria-label={`${control} ${on ? 'selected' : 'unselected'}`}
            >
              <ChoiceCard value={control} {...props} />
            </RadioGroup>
          )
        }),
      )}
      <RadioGroup aria-label="Disabled">
        <ChoiceCard
          value="d"
          title="Express delivery"
          detail="Sold out today"
          trailing="$9.00"
          icon={ZapIcon}
          disabled
        />
      </RadioGroup>
      <ChoiceCard
        control="checkbox"
        value="dc"
        title="Gift wrap"
        detail="Not available"
        trailing="$3.00"
        disabled
      />
    </div>
  ),
})

/** Without a tile, detail or value: Figma show tile / detail / value off. */
export const Minimal = meta.story({
  decorators: [],
  render: () => (
    <RadioGroup aria-label="Plan" defaultValue="monthly" className="w-96">
      <ChoiceCard value="monthly" title="Monthly" />
      <ChoiceCard value="yearly" title="Yearly" />
    </RadioGroup>
  ),
})

function Delivery() {
  const [value, setValue] = useState('standard')
  return (
    <RadioGroup aria-label="Delivery" value={value} onValueChange={setValue} className="w-96">
      <ChoiceCard
        value="standard"
        title="Standard delivery"
        detail="Arrives Thu 16 Oct"
        trailing="$4.00"
        icon={TruckIcon}
      />
      <ChoiceCard
        value="express"
        title="Express delivery"
        detail="Arrives tomorrow by 12:00"
        trailing="$9.00"
        icon={ZapIcon}
      />
      <ChoiceCard
        value="pickup"
        title="Pick up in store"
        detail="Ready in 2 hours"
        trailing="Free"
        icon={CalendarIcon}
      />
    </RadioGroup>
  )
}

/** One choice from a group: radio cards in a `RadioGroup`. */
export const Group = meta.story({ decorators: [], render: () => <Delivery /> })

Group.test('choosing another card moves the selection', async ({ canvas }) => {
  await expect(canvas.getByRole('radio', { name: /Standard delivery/ })).toBeChecked()
  await userEvent.click(canvas.getByText('Express delivery'))
  await expect(canvas.getByRole('radio', { name: /Express delivery/ })).toBeChecked()
  await expect(canvas.getByRole('radio', { name: /Standard delivery/ })).not.toBeChecked()
})

/** Several choices: checkbox cards report through `onCheckedChange`. */
export const Multiple = meta.story({
  args: { onCheckedChange: fn() },
  decorators: [],
  render: (args) => (
    <div className="flex w-96 flex-col gap-3">
      <ChoiceCard
        control="checkbox"
        value="wrap"
        title="Gift wrap"
        detail="Paper and a handwritten note"
        trailing="$3.00"
        onCheckedChange={args.onCheckedChange}
      />
      <ChoiceCard
        control="checkbox"
        value="insure"
        title="Delivery insurance"
        detail="Covers loss and damage"
        trailing="$2.50"
        onCheckedChange={args.onCheckedChange}
      />
    </div>
  ),
})

Multiple.test('checkbox cards toggle independently', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByText('Gift wrap'))
  await expect(canvas.getByRole('checkbox', { name: /Gift wrap/ })).toBeChecked()
  await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true)
  await expect(canvas.getByRole('checkbox', { name: /Delivery insurance/ })).not.toBeChecked()
})
