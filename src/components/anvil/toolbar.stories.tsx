import preview from '#.storybook/preview'
import { expect, userEvent } from 'storybook/test'

import { ButtonGroup } from '@/components/ui/button-group'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArchiveIcon,
  BoldIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  EllipsisIcon,
  Icon,
  ItalicIcon,
  PencilIcon,
  UnderlineIcon,
  XIcon,
} from '@/components/ui/icon'

import {
  Toolbar,
  ToolbarButton,
  ToolbarCount,
  ToolbarGroup,
  ToolbarLabel,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from './toolbar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8218-17459'

const meta = preview.meta({
  title: 'UI Components/Toolbar',
  tags: ['ui-component', 'anvil-custom'],
  component: Toolbar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'variant', values: 'default', code: 'nothing (single value)' }],
    docs: {
      description: {
        component:
          'A floating bar of contextual actions (`@/components/anvil/toolbar`, on Radix Toolbar): one Tab stop, arrow keys move between controls. `Toolbar` (`aria-label`, `orientation`) › `ToolbarGroup`s of `ToolbarButton` (outline · neutral · sm by default), `ToolbarToggleGroup` › `ToolbarToggleItem`, `ToolbarSeparator`; a ButtonGroup joins ToolbarButtons. `ToolbarCount` + `ToolbarLabel` summarise a selection.',
      },
    },
  },
  args: { orientation: 'horizontal', 'aria-label': 'Label' },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    'aria-label': { control: 'text' },
    loop: { control: 'boolean' },
    asChild: { control: false },
  },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup>
        <ToolbarButton variant="ghost" size="icon-xs" aria-label="Clear selection">
          <Icon icon={XIcon} />
        </ToolbarButton>
        <ToolbarCount>1</ToolbarCount>
        <ToolbarLabel>Selected</ToolbarLabel>
      </ToolbarGroup>
      <ToolbarGroup>
        <ToolbarButton>
          <Icon icon={PencilIcon} />
          Edit
        </ToolbarButton>
        <ToolbarButton>
          <Icon icon={CopyIcon} />
          Duplicate
        </ToolbarButton>
        <ToolbarButton>
          <Icon icon={ArchiveIcon} />
          Archive
        </ToolbarButton>
        <ToolbarButton size="icon-sm" aria-label="More actions">
          <Icon icon={EllipsisIcon} />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  ),
})

/** The Figma bulk-action bar. Orientation is in Controls. */
export const Default = meta.story()

Default.test('one Tab stop; arrow keys move between actions', async ({ canvas }) => {
  await expect(canvas.getByRole('toolbar', { name: 'Label' })).toBeVisible()
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: 'Clear selection' })).toHaveFocus()
  await userEvent.keyboard('{ArrowRight}')
  await expect(canvas.getByRole('button', { name: 'Edit' })).toHaveFocus()
  await userEvent.keyboard('{End}')
  await expect(canvas.getByRole('button', { name: 'More actions' })).toHaveFocus()
})

/** A formatting bar: toggle groups (multiple and single), a separator and a button. */
export const Formatting = meta.story({
  render: (args) => (
    <Toolbar {...args} className="gap-2">
      <ToolbarToggleGroup type="multiple" aria-label="Label 1" defaultValue={['bold']}>
        <ToolbarToggleItem value="bold" aria-label="Bold">
          <Icon icon={BoldIcon} />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" aria-label="Italic">
          <Icon icon={ItalicIcon} />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" aria-label="Underline">
          <Icon icon={UnderlineIcon} />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="single" aria-label="Label 2" defaultValue="left">
        <ToolbarToggleItem value="left" aria-label="Align left">
          <Icon icon={AlignLeftIcon} />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="center" aria-label="Align center">
          <Icon icon={AlignCenterIcon} />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="right" aria-label="Align right">
          <Icon icon={AlignRightIcon} />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton variant="ghost">
        <Icon icon={CopyIcon} />
        Copy
      </ToolbarButton>
    </Toolbar>
  ),
})

Formatting.test('toggle items press independently', async ({ canvas }) => {
  const italic = canvas.getByRole('button', { name: 'Italic' })
  await userEvent.click(italic)
  await expect(italic).toHaveAttribute('aria-pressed', 'true')
  await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true')
})

/** A ButtonGroup of ToolbarButtons (Figma Button Group). */
export const WithButtonGroup = meta.story({
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup>
        <ToolbarCount>3</ToolbarCount>
        <ToolbarLabel>Selected</ToolbarLabel>
      </ToolbarGroup>
      <ButtonGroup aria-label="Label">
        <ToolbarButton>
          <Icon icon={ChevronLeftIcon} />
          Previous
        </ToolbarButton>
        <ToolbarButton>
          Next
          <Icon icon={ChevronRightIcon} />
        </ToolbarButton>
      </ButtonGroup>
    </Toolbar>
  ),
})

/** `orientation="vertical"`: arrow up / down move between controls. */
export const Vertical = meta.story({ args: { orientation: 'vertical' } })
