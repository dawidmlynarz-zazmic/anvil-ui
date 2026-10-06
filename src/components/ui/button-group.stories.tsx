import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from './button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { ChevronDownIcon, Icon, MinusIcon, PlusIcon } from './icon'
import { Input } from './input'

type DemoProps = {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'outline' | 'default'
  size?: 'sm' | 'default' | 'lg'
}

function DemoButtonGroup({ orientation = 'horizontal', variant = 'outline', size = 'default' }: DemoProps) {
  const intent = variant === 'outline' ? 'neutral' : 'brand'
  return (
    <ButtonGroup orientation={orientation} aria-label="Response actions">
      <Button variant={variant} intent={intent} size={size}>
        Copy
      </Button>
      {variant === 'default' && <ButtonGroupSeparator />}
      <Button variant={variant} intent={intent} size={size}>
        Regenerate
      </Button>
      {variant === 'default' && <ButtonGroupSeparator />}
      <Button variant={variant} intent={intent} size={size}>
        Export
      </Button>
    </ButtonGroup>
  )
}

const meta = preview.meta({
  title: 'Design System/Molecules/Button Group',
  tags: ['molecule'],
  component: DemoButtonGroup,
  parameters: {
    shadcn: 'button-group',
    layout: 'centered',
    design: { type: 'figma', url: 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=11160-516' },
    figmaProps: [{ property: 'orientation', values: 'horizontal · vertical', code: '`orientation` prop' }],
    guide: {
      use: [
        'A few closely related actions on the same object, shown together: Copy · Regenerate · Export on a response.',
        'Joining an Input to its action or prefix (`ButtonGroupText`), or a split button (main action + Dropdown Menu of variants).',
        'A compact stepper: decrease, value, increase.',
      ],
      avoid: [
        'On/off or single-choice options: use Toggle Group. Peer views: use Tabs.',
        'Unrelated actions that just sit near each other: space separate Buttons apart instead.',
        'More than 3–4 actions: move the rest into a Dropdown Menu or Toolbar.',
      ],
      content: [
        'Each button is a short verb (“Copy”, “Regenerate”); keep labels similar in length.',
        'One primary action per group at most; a split button’s menu holds variants of that action (“Schedule send”).',
      ],
      a11y: [
        'The group is `role="group"`; give it an `aria-label` that names what the actions act on.',
        'Each button stays its own tab stop; icon-only buttons need `aria-label`.',
      ],
    },
    docs: {
      description: {
        component:
          'Joins related Buttons, Inputs and Selects into one control (shadcn/ui Button Group; Figma Button page › button group, orientation horizontal · vertical): inner corners square and neighbouring strokes shared. Use `ButtonGroupSeparator` between solid buttons, `ButtonGroupText` for a label segment, and nest groups to space them 8px apart. Use Toggle Group when the buttons are on/off states.',
      },
    },
  },
  args: { orientation: 'horizontal', variant: 'outline', size: 'default' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['outline', 'default'] },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
  },
})

export const Default = meta.story()

Default.test('a named group of buttons that share their strokes', async ({ canvas }) => {
  const group = canvas.getByRole('group', { name: 'Response actions' })
  const [a, b] = within(group)
    .getAllByRole('button')
    .map((el) => el.getBoundingClientRect())
  await expect(Math.round(b.left - a.right)).toBe(-1)
})

/** Solid buttons with separators. */
export const Solid = meta.story({ args: { variant: 'default' } })

export const Vertical = meta.story({ args: { orientation: 'vertical' } })

/** An Input joined to an action, and a text segment. */
export const WithInput = meta.story({
  render: () => (
    <div className="flex w-90 flex-col gap-4">
      <ButtonGroup className="w-full">
        <Input aria-label="Search conversations" placeholder="Search conversations" />
        <Button variant="outline" intent="neutral">
          Search
        </Button>
      </ButtonGroup>
      <ButtonGroup className="w-full">
        <ButtonGroupText>https://</ButtonGroupText>
        <Input aria-label="Source URL" placeholder="northwind.example/blog" />
      </ButtonGroup>
    </div>
  ),
})

/** Nested groups sit 8px apart (e.g. a stepper next to an action). */
export const Nested = meta.story({
  render: () => (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" intent="neutral" size="icon" aria-label="Fewer sources">
          <Icon icon={MinusIcon} />
        </Button>
        <ButtonGroupText>5 sources</ButtonGroupText>
        <Button variant="outline" intent="neutral" size="icon" aria-label="More sources">
          <Icon icon={PlusIcon} />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" intent="neutral">
          Search again
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
})

/** A split button: an action and a menu of related actions. */
export const SplitButton = meta.story({
  render: () => (
    <ButtonGroup>
      <Button>Send</Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" aria-label="More send options">
            <Icon icon={ChevronDownIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Schedule send</DropdownMenuItem>
          <DropdownMenuItem>Save as draft</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
})

SplitButton.test('the menu half opens the menu', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'More send options' }))
  await expect(await within(canvasElement.ownerDocument.body).findByRole('menu')).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('menu')).toBeNull())
})
