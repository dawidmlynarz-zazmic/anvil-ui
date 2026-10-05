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
    <ButtonGroup orientation={orientation} aria-label="Label">
      <Button variant={variant} intent={intent} size={size}>
        Label 1
      </Button>
      {variant === 'default' && <ButtonGroupSeparator />}
      <Button variant={variant} intent={intent} size={size}>
        Label 2
      </Button>
      {variant === 'default' && <ButtonGroupSeparator />}
      <Button variant={variant} intent={intent} size={size}>
        Label 3
      </Button>
    </ButtonGroup>
  )
}

const meta = preview.meta({
  title: 'Components/Button Group',
  component: DemoButtonGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Joins related Buttons, Inputs and Selects into one control (shadcn/ui Button Group): inner corners square and neighbouring strokes shared. Not drawn in Figma as its own component — it composes the drawn Button and Input. Use `ButtonGroupSeparator` between solid buttons, `ButtonGroupText` for a label segment, and nest groups to space them 8px apart. Use Toggle Group when the buttons are on/off states.',
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
  const group = canvas.getByRole('group', { name: 'Label' })
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
        <Input aria-label="Label" placeholder="Placeholder" />
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </ButtonGroup>
      <ButtonGroup className="w-full">
        <ButtonGroupText>Label</ButtonGroupText>
        <Input aria-label="Label" placeholder="Placeholder" />
      </ButtonGroup>
    </div>
  ),
})

/** Nested groups sit 8px apart (e.g. a stepper next to an action). */
export const Nested = meta.story({
  render: () => (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" intent="neutral" size="icon" aria-label="Label 1">
          <Icon icon={MinusIcon} />
        </Button>
        <ButtonGroupText>Value</ButtonGroupText>
        <Button variant="outline" intent="neutral" size="icon" aria-label="Label 2">
          <Icon icon={PlusIcon} />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" intent="neutral">
          Label
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
})

/** A split button: an action and a menu of related actions. */
export const SplitButton = meta.story({
  render: () => (
    <ButtonGroup>
      <Button>Label 1</Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" aria-label="Label 2">
            <Icon icon={ChevronDownIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Label 3</DropdownMenuItem>
          <DropdownMenuItem>Label 4</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
})

SplitButton.test('the menu half opens the menu', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Label 2' }))
  await expect(await within(canvasElement.ownerDocument.body).findByRole('menu')).toBeInTheDocument()
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('menu')).toBeNull())
})
