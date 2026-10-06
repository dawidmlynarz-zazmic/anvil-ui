import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Button } from './button'
import { CommandIcon, Icon } from './icon'
import { Kbd, KbdGroup } from './kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=2534-31422'

const meta = preview.meta({
  title: 'Design System/Atoms/Kbd',
  tags: ['atom'],
  component: Kbd,
  parameters: {
    shadcn: 'kbd',
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    // Figma: badge/shortcut has no component properties (the key text is the children).
    figmaProps: [],
    guide: {
      use: [
        'Show the shortcut for a command in a menu item, Command list, search field or tooltip.',
        '`KbdGroup` for a key combination; one `Kbd` per key.',
      ],
      avoid: [
        'Something people press on screen: use Button. A count or status: use Badge.',
        'Inline code or a value: use Code Block or a `<code>` element.',
      ],
      content: [
        'Key names as printed on the keyboard: “Ctrl”, “Shift”, “Enter”, “K”; the ⌘ icon for Mac.',
        'Only show shortcuts that actually work on the current platform.',
      ],
      a11y: [
        'Renders `<kbd>`; an icon key (⌘) is decorative, so add `sr-only` text (“Command”) when it matters.',
        'A shortcut is never the only way to reach a command: keep a visible control for it.',
      ],
    },
    docs: {
      description: {
        component:
          'Keyboard shortcut hint (shadcn/ui Kbd; Figma `badge/shortcut`) for menus, search and tooltips. `KbdGroup` joins several keys.',
      },
    },
  },
  args: { children: 'K' },
  argTypes: { children: { control: 'text' } },
})

/** The key text is in Controls. */
export const Default = meta.story({
  render: (args) => (
    <Kbd {...args}>
      <Icon icon={CommandIcon} />
      {args.children}
    </Kbd>
  ),
})

Default.test('renders the key', async ({ canvasElement }) => {
  await expect(canvasElement.querySelector('kbd')).toHaveTextContent('K')
})

export const Group = meta.story({
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
})

/** Inside a tooltip the key adapts to the inverse surface (shadcn behavior). */
export const InTooltip = meta.story({
  parameters: { docs: { story: { inline: false, height: '160px' } } },
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button variant="outline" intent="neutral">
          Search
        </Button>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        Search
        <Kbd>
          <Icon icon={CommandIcon} />K
        </Kbd>
      </TooltipContent>
    </Tooltip>
  ),
})
