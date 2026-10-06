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
  FolderInputIcon,
  Icon,
  ItalicIcon,
  Trash2Icon,
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
  title: 'Organisms/Toolbar',
  tags: ['organism'],
  component: Toolbar,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [{ property: 'variant', values: 'default', code: 'nothing (single value)' }],
    guide: {
      use: [
        'A floating bar of actions on the current selection: “3 selected” with Archive, Move, Delete over a list of conversations or files.',
        'A formatting bar for an editor or canvas (toggle groups for style and alignment).',
        'Summarise the selection with `ToolbarCount` + `ToolbarLabel` and offer Clear selection first.',
      ],
      avoid: [
        'Actions on one message (Copy, Retry, Good / Bad response): use Message Actions.',
        'Many commands in nested menus: use Menubar or Dropdown Menu. A form’s Save / Cancel: use ShellFooter.',
      ],
      content: [
        'Buttons are short verbs (“Archive”, “Move”, “Delete”); put the destructive one last with `intent="destructive"`.',
        'Keep three or four visible actions and put the rest in a More actions menu.',
      ],
      a11y: [
        'Radix Toolbar: one Tab stop, arrow keys (Home / End) move between controls; always pass `aria-label` (“Selected conversations”).',
        'Icon-only buttons and toggle items need `aria-label`; toggle groups need their own name (“Text style”).',
        'Toggles expose `aria-pressed`; announce selection changes in text, not only by showing the bar.',
      ],
    },
    docs: {
      description: {
        component:
          'A floating bar of contextual actions (`@/components/anvil/toolbar`, on Radix Toolbar): one Tab stop, arrow keys move between controls. `Toolbar` (`aria-label`, `orientation`) › `ToolbarGroup`s of `ToolbarButton` (outline · neutral · sm by default), `ToolbarToggleGroup` › `ToolbarToggleItem`, `ToolbarSeparator`; a ButtonGroup joins ToolbarButtons. `ToolbarCount` + `ToolbarLabel` summarise a selection.',
      },
    },
  },
  args: { orientation: 'horizontal', 'aria-label': 'Selected conversations' },
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
        <ToolbarCount>3</ToolbarCount>
        <ToolbarLabel>selected</ToolbarLabel>
      </ToolbarGroup>
      <ToolbarGroup>
        <ToolbarButton>
          <Icon icon={ArchiveIcon} />
          Archive
        </ToolbarButton>
        <ToolbarButton>
          <Icon icon={FolderInputIcon} />
          Move
        </ToolbarButton>
        <ToolbarButton intent="destructive">
          <Icon icon={Trash2Icon} />
          Delete
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
  await expect(canvas.getByRole('toolbar', { name: 'Selected conversations' })).toBeVisible()
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: 'Clear selection' })).toHaveFocus()
  await userEvent.keyboard('{ArrowRight}')
  await expect(canvas.getByRole('button', { name: 'Archive' })).toHaveFocus()
  await userEvent.keyboard('{End}')
  await expect(canvas.getByRole('button', { name: 'More actions' })).toHaveFocus()
})

/** A formatting bar: toggle groups (multiple and single), a separator and a button. */
export const Formatting = meta.story({
  render: (args) => (
    <Toolbar {...args} aria-label="Formatting" className="gap-2">
      <ToolbarToggleGroup type="multiple" aria-label="Text style" defaultValue={['bold']}>
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
      <ToolbarToggleGroup type="single" aria-label="Alignment" defaultValue="left">
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
        Copy as Markdown
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
    <Toolbar {...args} aria-label="Search results">
      <ToolbarGroup>
        <ToolbarCount>5</ToolbarCount>
        <ToolbarLabel>matches</ToolbarLabel>
      </ToolbarGroup>
      <ButtonGroup aria-label="Go to match">
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
