import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { CommandIcon, CopyIcon, Icon, SearchIcon } from './icon'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from './input-group'
import { Kbd } from './kbd'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=1623-6796'

function Search({ size }: { size?: 'sm' | 'default' | 'lg' }) {
  return (
    <InputGroup size={size}>
      <InputGroupAddon>
        <Icon icon={SearchIcon} />
      </InputGroupAddon>
      <InputGroupInput aria-label="Label" placeholder="Placeholder" />
      <InputGroupAddon align="inline-end">
        <Kbd>
          <Icon icon={CommandIcon} />K
        </Kbd>
      </InputGroupAddon>
    </InputGroup>
  )
}

const meta = preview.meta({
  title: 'Molecules/Input Group',
  tags: ['molecule'],
  component: InputGroup,
  parameters: {
    shadcn: 'input-group',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'size', values: 'lg · default · sm', code: '`size` prop on `InputGroup`' },
      {
        property: 'state',
        values: 'default · hover · focus',
        code: 'selectors: `hover:` · `has-[…:focus-visible]:` on the group (not a prop)',
      },
      {
        property: 'show shortcut',
        values: 'boolean',
        code: 'an `InputGroupAddon align="inline-end"` with a `Kbd`, or not',
      },
    ],
    docs: {
      description: {
        component:
          'An input with addons — icons, text, buttons or a Kbd shortcut (shadcn/ui Input Group). Figma `search` is an Input Group with a search icon and a ⌘K hint. `size` sm · default · lg (32 / 40 / 48). The group draws the field and its states; clicking an addon focuses the input.',
      },
    },
  },
  args: { size: 'default' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  render: (args) => <Search size={args.size ?? undefined} />,
})

/** Figma `search`. */
export const Default = meta.story()

Default.test('clicking an addon focuses the input', async ({ canvas, canvasElement }) => {
  const input = canvas.getByRole('textbox', { name: 'Label' })
  await userEvent.click(canvasElement.querySelector('[data-slot=input-group-addon]')!)
  await expect(input).toHaveFocus()
  await userEvent.keyboard('Value')
  await expect(input).toHaveValue('Value')
})

/** 32 / 40 / 48 px. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Search size="sm" />
      <Search size="default" />
      <Search size="lg" />
    </div>
  ),
})

/** Figma states side by side (rows: default · hover · invalid · disabled). For one group, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Label 1" placeholder="Placeholder" />
      </InputGroup>
      <span className="pseudo-hover-all contents">
        <InputGroup>
          <InputGroupAddon>
            <Icon icon={SearchIcon} />
          </InputGroupAddon>
          <InputGroupInput aria-label="Label 2" placeholder="Placeholder" />
        </InputGroup>
      </span>
      <InputGroup>
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Label 3" defaultValue="Value" aria-invalid />
      </InputGroup>
      <InputGroup data-disabled="true">
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Label 4" placeholder="Placeholder" disabled />
      </InputGroup>
    </div>
  ),
})

/** Text addons and an inline button (shadcn Input Group parts). */
export const TextAndButton = meta.story({
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>Label</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Label" defaultValue="Value" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Copy">
          <Icon icon={CopyIcon} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
})

/** With a textarea and a block-end addon. */
export const WithTextarea = meta.story({
  render: () => (
    <InputGroup>
      <InputGroupTextarea aria-label="Label" placeholder="Placeholder" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Subtitle</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
})
