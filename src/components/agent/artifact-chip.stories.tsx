import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { FileTextIcon } from '@/components/ui/icon'

import { ArtifactChip } from './artifact-chip'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10744-3954'

const meta = preview.meta({
  title: 'Agent Builder/Widgets & artifacts/Artifact Chip',
  tags: ['agent-builder', 'widgets'],
  component: ArtifactChip,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'default · updating · active · hover · focus',
        code: 'default · `loading` (updating) · `open` (active) · `hover:` · `focus-visible:`',
      },
      { property: 'title', values: 'text', code: '`title` prop' },
      { property: 'subtitle', values: 'text', code: '`description` prop (`loadingLabel` while loading)' },
      { property: 'icon tile', values: 'instance', code: '`icon` prop (an info Icon Tile)' },
    ],
    guide: {
      use: [
        'In the thread, where the assistant made or changed an artifact: clicking it opens the artifact in the canvas.',
        'Set `open` on the chip whose artifact the canvas shows now; `loading` while the assistant is changing it.',
      ],
      avoid: [
        'A file to download: use File Output Card.',
        'A source behind an answer: use Citation Chip or Source Card.',
      ],
      content: [
        '`title`: the artifact’s name (“Q3 board memo: churn”).',
        '`description`: its kind and version (“Document · v3”); while loading, what is happening (“Updating to v4…”).',
      ],
      a11y: [
        'It is a button; the open one has `aria-current`, the changing one `aria-busy`.',
        'The chevron and panel glyphs are decorative; the description says the state in words.',
      ],
    },
    docs: {
      description: {
        component:
          'The in-chat link to an artifact in the canvas (`@/components/agent/artifact-chip`), on Item (outline, sm) as a button with an info Icon Tile: `title`, `description`, `icon`, `loading` + `loadingLabel` (Figma updating) and `open` (Figma active).',
      },
    },
  },
  args: {
    title: 'Retention dashboard',
    description: 'Interactive dashboard · v4',
    loading: false,
    loadingLabel: 'Updating to v4…',
    open: false,
    onClick: fn(),
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    loading: { control: 'boolean' },
    loadingLabel: { control: 'text' },
    open: { control: 'boolean' },
    icon: { control: false },
    onClick: { control: false, table: { category: 'Events' } },
  },
})

/** Title, description, loading and open are in Controls. */
export const Default = meta.story()

Default.test('opens the artifact', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: /Retention dashboard/ }))
  await expect(args.onClick).toHaveBeenCalledOnce()
})

/** Figma states: default, updating, active (open in the canvas), hover, focus. */
export const States = meta.story({
  render: (args) => (
    <div className="grid max-w-190 gap-3 sm:grid-cols-2">
      <ArtifactChip {...args} />
      <ArtifactChip {...args} loading />
      <ArtifactChip {...args} open description="v4 · open in canvas" />
      <span className="pseudo-hover-all contents">
        <ArtifactChip {...args} />
      </span>
      <span className="pseudo-focus-visible-all contents">
        <ArtifactChip {...args} />
      </span>
    </div>
  ),
})

States.test('marks the open and the busy chip', async ({ canvas }) => {
  const chips = canvas.getAllByRole('button')
  await expect(chips[1]).toHaveAttribute('aria-busy', 'true')
  await expect(chips[2]).toHaveAttribute('aria-current', 'true')
})

/** A document artifact. */
export const Document = meta.story({
  args: { title: 'Q3 board memo: churn', description: 'Document · v3', icon: FileTextIcon },
})
