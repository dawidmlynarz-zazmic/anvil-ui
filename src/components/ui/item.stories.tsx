import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { IconTile } from '@/components/anvil/icon-tile'

import { Button } from './button'
import { Icon, PencilIcon, SparklesIcon } from './icon'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './item'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10843-4460'

const meta = preview.meta({
  title: 'Design System/Molecules/Item',
  tags: ['molecule'],
  component: Item,
  parameters: {
    shadcn: 'item',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    // No Figma item component: Figma's icon tile is "built on shadcn/ui: Item" (its media).
    figmaProps: [],
    guide: {
      use: [
        'A row about one thing with optional media and actions: a saved memory, a connected app, a file, a setting.',
        'Lists of such rows in `ItemGroup` with `ItemSeparator`, or as the base of agent rows (Instructions Banner, Memory Manager).',
      ],
      avoid: [
        'A standalone block with header, body and footer: use Card. Tabular data people compare across columns: use Table.',
        'Navigation lists in the app shell: use Sidebar items. Menu entries: use Dropdown Menu items.',
      ],
      content: [
        'Title is the thing itself (“Works in Pacific Time”); the description adds one line of context (source, date, size).',
        'Keep actions few and icon-only actions labelled; put more behind a “More actions” Dropdown Menu.',
      ],
      a11y: [
        'Item is a plain container; render it `asChild` as a link or `li` when the row has those semantics.',
        'Give lists `role="list"` / `listitem` (ItemGroup does the list) so counts are announced.',
        'Icon-only action buttons need an `aria-label` that names the object (“Edit memory”).',
      ],
    },
    docs: {
      description: {
        component:
          'A row: media, title, description and actions (shadcn/ui Item, audit M11). Agent rows are built on it: Instructions Banner and Memory Manager rows. `variant` default · outline · muted; `size` default · sm (Anvil rows: 12 / 10px, description text/xs). Put an Icon Tile in `ItemMedia`. `ItemGroup` lists items; `asChild` renders the item as a link or list item.',
      },
    },
  },
  args: { variant: 'outline' as const, size: 'default' as const },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'outline', 'muted'] },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    asChild: { control: false },
  },
  render: (args) => (
    <Item {...args} className="max-w-140">
      <ItemMedia>
        <IconTile icon={SparklesIcon} tone="agent" size={args.size === 'sm' ? 'sm' : 'default'} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Prefers concise answers with bullet points</ItemTitle>
        <ItemDescription>Saved from “Q3 launch plan” · Sep 28</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Edit memory">
          <Icon icon={PencilIcon} />
        </Button>
      </ItemActions>
    </Item>
  ),
})

/** Variant and size are in Controls. */
export const Default = meta.story()

Default.test('renders title and description', async ({ canvas }) => {
  await expect(canvas.getByText('Prefers concise answers with bullet points')).toHaveAttribute(
    'data-slot',
    'item-title',
  )
  await expect(canvas.getByRole('button', { name: 'Edit memory' })).toBeVisible()
})

/** default · outline · muted at both sizes. */
export const Variants = meta.story({
  render: () => (
    <div className="flex max-w-140 flex-col gap-3">
      {(['default', 'sm'] as const).map((size) =>
        (['default', 'outline', 'muted'] as const).map((variant) => (
          <Item key={size + variant} variant={variant} size={size}>
            <ItemContent>
              <ItemTitle className="capitalize">{variant}</ItemTitle>
              <ItemDescription>Size {size}</ItemDescription>
            </ItemContent>
          </Item>
        )),
      )}
    </div>
  ),
})

/** A list of items with separators. */
export const Group = meta.story({
  render: () => (
    <ItemGroup className="max-w-140 rounded-lg border">
      {[
        ['Prefers concise answers with bullet points', 'Saved Sep 28'],
        ['Works in Pacific Time', 'Saved Sep 14'],
        ['Team uses Issue Tracker for launch tasks', 'Saved Aug 30'],
      ].map(([label, saved], i) => (
        <div key={label}>
          {i > 0 && <ItemSeparator />}
          <Item size="sm" role="listitem">
            <ItemContent>
              <ItemTitle>{label}</ItemTitle>
              <ItemDescription>{saved}</ItemDescription>
            </ItemContent>
          </Item>
        </div>
      ))}
    </ItemGroup>
  ),
})
