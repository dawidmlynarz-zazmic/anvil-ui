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
  title: 'UI Components/Item',
  tags: ['composite'],
  component: Item,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    // No Figma item component: Figma's icon tile is "built on shadcn/ui: Item" (its media).
    figmaProps: [],
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
        <ItemTitle>Title</ItemTitle>
        <ItemDescription>Subtitle</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" intent="neutral" size="icon-xs" aria-label="Edit">
          <Icon icon={PencilIcon} />
        </Button>
      </ItemActions>
    </Item>
  ),
})

/** Variant and size are in Controls. */
export const Default = meta.story()

Default.test('renders title and description', async ({ canvas }) => {
  await expect(canvas.getByText('Title')).toHaveAttribute('data-slot', 'item-title')
  await expect(canvas.getByRole('button', { name: 'Edit' })).toBeVisible()
})

/** default · outline · muted at both sizes. */
export const Variants = meta.story({
  render: () => (
    <div className="flex max-w-140 flex-col gap-3">
      {(['default', 'sm'] as const).map((size) =>
        (['default', 'outline', 'muted'] as const).map((variant) => (
          <Item key={size + variant} variant={variant} size={size}>
            <ItemContent>
              <ItemTitle>Title</ItemTitle>
              <ItemDescription>Subtitle</ItemDescription>
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
      {['Label 1', 'Label 2', 'Label 3'].map((label, i) => (
        <div key={label}>
          {i > 0 && <ItemSeparator />}
          <Item size="sm" role="listitem">
            <ItemContent>
              <ItemTitle>{label}</ItemTitle>
              <ItemDescription>Subtitle</ItemDescription>
            </ItemContent>
          </Item>
        </div>
      ))}
    </ItemGroup>
  ),
})
