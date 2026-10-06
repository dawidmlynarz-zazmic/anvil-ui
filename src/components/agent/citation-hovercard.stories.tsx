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
        domain="Label"
        title="Title"
        url="label.com/label/value"
        snippet="Subtitle"
        confidence="high"
        score="92%"
      />
    </CitationHoverCard>
  )
}

const meta = preview.meta({
  title: 'Agent Primitives/Sources/Citation Hovercard',
  tags: ['composite'],
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
  await waitFor(() => expect(body.getByText('Title')).toBeVisible())
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
          Subtitle <Demo /> Subtitle
        </MessageBubbleContent>
      </MessageBubble>
    </div>
  ),
})
