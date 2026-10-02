import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { Button } from './button'
import { CommandIcon, Icon } from './icon'
import { Kbd, KbdGroup } from './kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=2534-31422'

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'Keyboard shortcut hint (shadcn/ui Kbd; Figma `badge/shortcut`) for menus, search and tooltips. `KbdGroup` joins several keys.',
      },
    },
  },
  args: { children: 'K' },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Kbd {...args}>
      <Icon icon={CommandIcon} />
      {args.children}
    </Kbd>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('kbd')).toHaveTextContent('K')
  },
}

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
}

/** Inside a tooltip the key adapts to the inverse surface (shadcn behavior). */
export const InTooltip: Story = {
  parameters: { docs: { story: { inline: false, height: '160px' } } },
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        Label
        <Kbd>
          <Icon icon={CommandIcon} />K
        </Kbd>
      </TooltipContent>
    </Tooltip>
  ),
}
