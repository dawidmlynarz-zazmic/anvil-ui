import type { Meta, StoryObj } from '@storybook/react-vite'
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

const meta = {
  title: 'Components/Input Group',
  component: InputGroup,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'An input with addons — icons, text, buttons or a Kbd shortcut (shadcn/ui Input Group). Figma `search` is an Input Group with a search icon and a ⌘K hint. `size` sm · default · lg (32 / 40 / 48). The group draws the field and its states; clicking an addon focuses the input.',
      },
    },
  },
  args: { size: 'default' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] } },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  render: (args) => <Search size={args.size ?? undefined} />,
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Figma `search`. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole('textbox', { name: 'Label' })
    await userEvent.click(canvasElement.querySelector('[data-slot=input-group-addon]')!)
    await expect(input).toHaveFocus()
    await userEvent.keyboard('Value')
    await expect(input).toHaveValue('Value')
  },
}

/** 32 / 40 / 48 px. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Search size="sm" />
      <Search size="default" />
      <Search size="lg" />
    </div>
  ),
}

/** Figma states as selectors; hover forced with storybook-addon-pseudo-states. */
export const States: Story = {
  parameters: { pseudo: { hover: ['[data-demo="hover"]'] } },
  render: () => (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Label 1" placeholder="Placeholder" />
      </InputGroup>
      <InputGroup data-demo="hover">
        <InputGroupAddon>
          <Icon icon={SearchIcon} />
        </InputGroupAddon>
        <InputGroupInput aria-label="Label 2" placeholder="Placeholder" />
      </InputGroup>
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
}

/** Text addons and an inline button (shadcn Input Group parts). */
export const TextAndButton: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>Label</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Label" defaultValue="Value" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Label">
          <Icon icon={CopyIcon} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

/** With a textarea and a block-end addon. */
export const WithTextarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea aria-label="Label" placeholder="Placeholder" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Subtitle</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}
