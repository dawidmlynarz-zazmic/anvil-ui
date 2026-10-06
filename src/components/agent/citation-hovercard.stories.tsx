import preview from '#.storybook/preview'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { MessageBubble, MessageBubbleContent } from '@/components/ui/message-bubble'

import { CitationChip } from './citation-chip'
import { CitationHoverCard, CitationHoverCardContent, CitationHoverCardTrigger } from './citation-hovercard'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-2649'

function Demo({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <CitationHoverCard open={open} onOpenChange={onOpenChange}>
      <CitationHoverCardTrigger>
        <CitationChip index={1} confidence="high" />
      </CitationHoverCardTrigger>
      <CitationHoverCardContent
        domain="marketpulse.example"
        title="Team plans for sync tools, compared"
        url="marketpulse.example/reports/sync-tools-pricing-2026"
        snippet="Most sync tools now price team plans per seat, between $8 and $14 a month, with annual discounts of about 20%."
        confidence="high"
        score="92%"
      />
    </CitationHoverCard>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Sources/Citation Hovercard',
  tags: ['agent-builder', 'sources'],
  component: Demo,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'domain', values: 'text', code: '`domain` prop on `CitationHoverCardContent`' },
      { property: 'title', values: 'text', code: '`title` prop on `CitationHoverCardContent`' },
      { property: 'url preview', values: 'text', code: '`url` prop on `CitationHoverCardContent`' },
      { property: 'snippet', values: 'text', code: '`snippet` prop on `CitationHoverCardContent`' },
    ],
    guide: {
      use: [
        'On every Citation Chip in an answer, so the user can check a source without leaving the thread.',
        'Show the domain, title, URL and the snippet that supports the claim; add `confidence` and `score` when the agent ranks sources.',
      ],
      avoid: [
        'Browsing or filtering all sources of an answer: use Citation Drawer.',
        'A source the user acts on (open, exclude, restore) in research or review flows: use Source Card.',
        'Buttons or links inside the preview: it is read-only and disappears on pointer-out; put actions in the drawer.',
      ],
      content: [
        'Title: the page’s own title, in its own casing. URL: domain and path without the protocol.',
        '`snippet`: the passage that supports the cited sentence, one or two sentences, quoted as-is.',
      ],
      a11y: [
        'It opens on focus as well as hover, so keyboard users get the same preview.',
        'The chip is named “Source 1…”, and the card is supplementary: the full source list must also be reachable in Citation Drawer.',
        'The URL uses `--muted-foreground` instead of Figma’s disabled color to keep 4.5:1 contrast.',
      ],
    },
    docs: {
      description: {
        component:
          'A source preview on hover or focus of a citation chip (`@/components/agent/citation-hovercard`, on Hover Card). `CitationHoverCard` › `CitationHoverCardTrigger` (wraps a `CitationChip`) + `CitationHoverCardContent` (`domain`, `favicon`, `title`, `url`, `snippet`, `confidence`, `score`). The chip shows its selected look while the card is open. Read-only: put actions in the citation drawer.',
      },
      story: { inline: false, height: '280px' },
    },
  },
  args: { open: false },
  argTypes: {
    open: { control: 'boolean' },
    onOpenChange: { control: false, table: { category: 'Events' } },
  },
})

/** Hover or focus the chip; `open` is a live control. */
export const Default = meta.story()

Default.test('focusing the chip opens the preview', async ({ canvas, canvasElement }) => {
  await userEvent.tab()
  await expect(canvas.getByRole('button', { name: /Source 1/ })).toHaveFocus()
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() => expect(body.getByText('Team plans for sync tools, compared')).toBeVisible())
  await expect(canvas.getByRole('button', { name: /Source 1/ })).toHaveAttribute('data-state', 'open')
})

/** Open on load: the Figma drawing. */
export const Open = meta.story({ args: { open: true } })

/** In an answer: each chip previews its own source. */
export const InText = meta.story({
  args: { open: undefined },
  render: () => (
    <div className="w-120">
      <MessageBubble variant="ghost">
        <MessageBubbleContent>
          Most competitors price team plans per seat, between $8 and $14 a month <Demo />, so a $10 seat keeps
          Northwind Sync in the middle of the market.
        </MessageBubbleContent>
      </MessageBubble>
    </div>
  ),
})
