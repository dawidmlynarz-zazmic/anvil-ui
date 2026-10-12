import { useState } from 'react'
import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ArtifactPanel } from '@/components/agent/artifact-panel'
import { MessageAction } from '@/components/agent/message-actions'
import { SyncIndicator } from '@/components/agent/sync-indicator'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  DownloadIcon,
  HistoryIcon,
  Icon,
  ShareIcon,
  SparklesIcon,
  XIcon,
} from '@/components/ui/icon'

import {
  DocumentCanvas,
  DocumentCanvasLine,
  DocumentCanvasMeta,
  DocumentCanvasTitle,
} from './document-canvas'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10745-4213'

const FIRST =
  'Q3 churn rose to 4.8%, up 0.6 points from Q2. Monthly plans were flat; the increase came almost entirely from annual renewals.'
const LAST =
  'The May cohort is the outlier, retaining 84.1% against an 88% baseline, and needs a closer look before the launch review.'

type Change = { id: string; type: 'added' | 'removed'; text: string }
const CHANGES: Change[] = [
  {
    id: 'a',
    type: 'removed',
    text: 'Churn increased slightly this quarter for reasons we are still investigating.',
  },
  {
    id: 'b',
    type: 'added',
    text: 'Most of the increase came from annual renewals in the two weeks after the 12 Aug price change,',
  },
  { id: 'c', type: 'added', text: 'when 1,140 customers declined to renew — 71% of all Q3 cancellations.' },
]

const onDecide = fn()

const ACTIONS = (
  <>
    <MessageAction label="Version history">
      <Icon icon={HistoryIcon} />
    </MessageAction>
    <MessageAction label="Share">
      <Icon icon={ShareIcon} />
    </MessageAction>
    <MessageAction label="Export">
      <Icon icon={DownloadIcon} />
    </MessageAction>
  </>
)

function Pending() {
  const [pending, setPending] = useState(CHANGES)
  const decide = (id: string, accept: boolean) => {
    onDecide(id, accept)
    setPending((list) => list.filter((c) => c.id !== id))
  }
  const decideAll = (accept: boolean) => pending.forEach((c) => decide(c.id, accept))
  return (
    <ArtifactPanel
      title="Q3 board memo: churn"
      version="v4 (draft)"
      sync={
        pending.length > 0 ? (
          <SyncIndicator status="updating">{pending.length} suggested changes</SyncIndicator>
        ) : (
          <SyncIndicator status="synced">Synced · v4</SyncIndicator>
        )
      }
      actions={ACTIONS}
      onClose={() => {}}
      className="h-180"
    >
      <DocumentCanvas
        review={
          pending.length > 0 && (
            <Alert
              tone="agent"
              size="sm"
              action={
                <>
                  <Button variant="ghost" intent="neutral" size="xs" onClick={() => decideAll(false)}>
                    <Icon icon={XIcon} />
                    Reject all
                  </Button>
                  <Button intent="brand" size="xs" onClick={() => decideAll(true)}>
                    <Icon icon={CheckIcon} />
                    Accept all
                  </Button>
                </>
              }
            >
              <Icon icon={SparklesIcon} />
              <AlertTitle>The assistant suggested {pending.length} changes to paragraph 2</AlertTitle>
            </Alert>
          )
        }
      >
        <DocumentCanvasTitle>Q3 board memo: churn</DocumentCanvasTitle>
        <DocumentCanvasMeta>Draft for the 6 Oct launch review · 4 min read</DocumentCanvasMeta>
        <DocumentCanvasLine>{FIRST}</DocumentCanvasLine>
        {pending.map((c) => (
          <DocumentCanvasLine
            key={c.id}
            type={c.type}
            onAccept={() => decide(c.id, true)}
            onReject={() => decide(c.id, false)}
          >
            {c.text}
          </DocumentCanvasLine>
        ))}
        <DocumentCanvasLine>{LAST}</DocumentCanvasLine>
      </DocumentCanvas>
    </ArtifactPanel>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Widgets & artifacts/Document Canvas',
  tags: ['agent-builder', 'widgets'],
  component: DocumentCanvas,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'state',
        values: 'clean · pending',
        code: 'clean: plain lines · pending: the `review` bar + changed DocumentCanvasLines',
      },
      {
        property: 'header',
        values: 'title, version, sync, history, share, export, close',
        code: 'the Artifact Panel around it',
      },
      {
        property: 'diff line · type',
        values: 'unchanged · added · removed',
        code: '`type` prop on DocumentCanvasLine (`onAccept` / `onReject` on changes)',
      },
    ],
    guide: {
      use: [
        'In an Artifact Panel, for a document the assistant writes with the user: the page, and its suggested edits inline.',
        'Show the `review` bar while changes are pending, with Reject all and Accept all; each change has its own Accept / Reject.',
      ],
      avoid: [
        'A dashboard or code: pass that content to the Artifact Panel directly.',
        'Rich text editing: this shows and reviews the document; editing is the product’s editor.',
      ],
      content: [
        'Review bar: who suggested what and where (“The assistant suggested 3 changes to paragraph 2”).',
        'Keep each changed line a whole sentence or clause, so accepting it reads well.',
      ],
      a11y: [
        'Changed lines name their change (“Added”, “Removed”) for screen readers; colour is not the only cue.',
        'Accept and Reject are icon buttons named “Accept change” / “Reject change”.',
      ],
    },
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        component:
          'A document artifact with the assistant’s suggested edits inline (`@/components/agent/document-canvas`), shown in an Artifact Panel (which has the header): `DocumentCanvas` (`review`, the page), `DocumentCanvasTitle`, `DocumentCanvasMeta`, `DocumentCanvasLine` (`type` unchanged · added · removed, `onAccept`, `onReject`).',
      },
    },
  },
  argTypes: { review: { control: false }, children: { control: false } },
  render: () => <Pending />,
})

/** Figma state pending: three suggested changes to review. */
export const Default = meta.story()

Default.test('accepts a change and then all the rest', async ({ canvas }) => {
  await userEvent.click(canvas.getAllByRole('button', { name: 'Accept change' })[0])
  await expect(onDecide).toHaveBeenCalledWith('a', true)
  await userEvent.click(canvas.getByRole('button', { name: 'Accept all' }))
  await expect(canvas.queryByRole('button', { name: 'Accept change' })).toBeNull()
  await expect(canvas.getByText('Synced · v4')).toBeVisible()
})

/** Figma state clean: the page, synced. */
export const Clean = meta.story({
  render: () => (
    <ArtifactPanel
      title="Q3 board memo: churn"
      version="v3"
      sync={<SyncIndicator status="synced">Synced · v4</SyncIndicator>}
      actions={ACTIONS}
      onClose={() => {}}
      className="h-160"
    >
      <DocumentCanvas>
        <DocumentCanvasTitle>Q3 board memo: churn</DocumentCanvasTitle>
        <DocumentCanvasMeta>Draft for the 6 Oct launch review · 4 min read</DocumentCanvasMeta>
        <DocumentCanvasLine>{FIRST}</DocumentCanvasLine>
        <DocumentCanvasLine>
          Most of the increase came from annual renewals in the two weeks after the 12 Aug price change, when
          1,140 customers declined to renew.
        </DocumentCanvasLine>
        <DocumentCanvasLine>{LAST}</DocumentCanvasLine>
      </DocumentCanvas>
    </ArtifactPanel>
  ),
})
