import preview from '#.storybook/preview'
import { expect, userEvent, waitFor } from 'storybook/test'

import { ArtifactChip } from '@/components/agent/artifact-chip'
import { ArtifactPanel } from '@/components/agent/artifact-panel'
import { ChatShellComposer, ChatShellHeader, ChatShellThread } from '@/components/agent/chat-shell'
import {
  DocumentCanvas,
  DocumentCanvasLine,
  DocumentCanvasMeta,
  DocumentCanvasTitle,
} from '@/components/agent/document-canvas'
import { MessageAction } from '@/components/agent/message-actions'
import { MessageRow } from '@/components/agent/message-row'
import { PromptInput } from '@/components/agent/prompt-input'
import { SyncIndicator } from '@/components/agent/sync-indicator'
import { WidgetMetricCard, WidgetMetricGroup } from '@/components/agent/widget-metric-card'
import { Button } from '@/components/ui/button'
import {
  ChevronDownIcon,
  DownloadIcon,
  EllipsisIcon,
  FileTextIcon,
  HistoryIcon,
  Icon,
  ShareIcon,
} from '@/components/ui/icon'

import { SplitCanvas } from './split-canvas'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10745-5172'

const iconButton = (label: string, glyph: typeof ShareIcon) => (
  <Button variant="ghost" intent="neutral" size="icon-sm" aria-label={label}>
    <Icon icon={glyph} />
  </Button>
)

const header = (title: string) => (
  <ChatShellHeader
    title={
      <Button variant="ghost" intent="neutral" size="sm" className="-ml-3 type-text-sm-semibold">
        {title}
        <Icon icon={ChevronDownIcon} />
      </Button>
    }
    actions={
      <>
        {iconButton('Share', ShareIcon)}
        {iconButton('More', EllipsisIcon)}
      </>
    }
  />
)

const ARTIFACT_ACTIONS = (
  <>
    <MessageAction label="Version history">
      <Icon icon={HistoryIcon} />
    </MessageAction>
    <MessageAction label="Export">
      <Icon icon={DownloadIcon} />
    </MessageAction>
  </>
)

function DocumentChat() {
  return (
    <>
      <ChatShellThread>
        <MessageRow role="user" timestamp="14:02">
          Make the second paragraph specific about the pricing change.
        </MessageRow>
        <MessageRow author="Assistant" timestamp="14:02">
          I rewrote paragraph 2 around the 12 Aug price change and the renewal numbers. Review the 3 changes
          in the canvas.
        </MessageRow>
        <ArtifactChip
          open
          icon={FileTextIcon}
          title="Q3 board memo: churn"
          description="v4 draft · open in canvas"
        />
      </ChatShellThread>
      <ChatShellComposer disclaimer="Assistant can make mistakes. Check important details.">
        <PromptInput aria-label="Message the assistant" />
      </ChatShellComposer>
    </>
  )
}

const DOCUMENT = (
  <ArtifactPanel
    title="Q3 board memo: churn"
    version="v4 (draft)"
    sync={<SyncIndicator status="updating">2 suggested changes</SyncIndicator>}
    actions={ARTIFACT_ACTIONS}
    onClose={() => {}}
  >
    <DocumentCanvas>
      <DocumentCanvasTitle>Q3 board memo: churn</DocumentCanvasTitle>
      <DocumentCanvasMeta>Draft for the 6 Oct launch review · 4 min read</DocumentCanvasMeta>
      <DocumentCanvasLine>
        Q3 churn rose to 4.8%, up 0.6 points from Q2. Monthly plans were flat; the increase came almost
        entirely from annual renewals.
      </DocumentCanvasLine>
      <DocumentCanvasLine type="removed" onAccept={() => {}} onReject={() => {}}>
        Churn increased slightly this quarter for reasons we are still investigating.
      </DocumentCanvasLine>
      <DocumentCanvasLine type="added" onAccept={() => {}} onReject={() => {}}>
        Most of the increase came from annual renewals in the two weeks after the 12 Aug price change.
      </DocumentCanvasLine>
    </DocumentCanvas>
  </ArtifactPanel>
)

const meta = preview.meta({
  title: 'Agent Builder/Surfaces/Split Canvas',
  tags: ['agent-builder'],
  component: SplitCanvas,
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        component:
          'The chat beside an artifact (`@/components/agent/split-canvas`): `header` across the top, then a Resizable row of the chat pane (a Chat Shell, `surface="side-panel"`; `chat` = ChatShellThread + ChatShellComposer) and the `canvas` (an Artifact Panel). `chatSize` sets the chat’s starting width (%). Below 768px the panes become Chat / Canvas Tabs (`view`, `onViewChange`).',
      },
    },
    figmaProps: [
      {
        property: 'canvas',
        values: 'document · dashboard',
        code: '`canvas` slot: an Artifact Panel with a Document Canvas, or with dashboard widgets',
      },
      { property: '.shell header', values: 'instance', code: '`header` slot (a ChatShellHeader)' },
      {
        property: 'pane divider',
        values: 'default · hover · dragging',
        code: 'Resizable’s handle (`hover:` / dragging)',
      },
      {
        property: 'thread',
        values: 'instance swap',
        code: '`chat` slot (ChatShellThread + ChatShellComposer)',
      },
    ],
    guide: {
      use: [
        'When the assistant works on an artifact with the user: the conversation on the left, the document or dashboard on the right.',
        'Link each version in the thread with an Artifact Chip; the open one has `open`.',
      ],
      avoid: [
        'A chat with no artifact: use Chat Shell (full screen).',
        'A quick look at a file: use File Output Card, or open it in a Sheet.',
      ],
      content: [
        'Header: the chat’s title. Canvas header: the artifact’s name, version and sync state.',
        'Keep the chat in charge: say in the thread what changed in the canvas.',
      ],
      a11y: [
        'The divider is a focusable separator: arrow keys resize the panes.',
        'On mobile, Chat and Canvas are tabs, so both stay one tap away.',
      ],
    },
  },
  args: { chatSize: 36, header: header('Q3 board memo'), chat: <DocumentChat />, canvas: DOCUMENT },
  argTypes: {
    chatSize: { control: { type: 'range', min: 20, max: 60, step: 2 } },
    header: { control: false },
    chat: { control: false },
    canvas: { control: false },
    view: { control: 'inline-radio', options: ['chat', 'canvas'] },
    onViewChange: { control: false, table: { category: 'Events' } },
  },
  render: (args) => <SplitCanvas {...args} className="h-[760px]" />,
})

/** Figma canvas document: the memo with suggested edits. Drag the divider, or focus it and use the arrow keys. */
export const Default = meta.story()

Default.test('the divider resizes the panes from the keyboard', async ({ canvas }) => {
  const divider = canvas.getByRole('separator', { name: 'Resize the chat and the canvas' })
  const before = Number(divider.getAttribute('aria-valuenow'))
  divider.focus()
  await userEvent.keyboard('{ArrowRight}{ArrowRight}')
  await waitFor(() => expect(Number(divider.getAttribute('aria-valuenow'))).toBeGreaterThan(before))
})

/** Figma canvas dashboard: metrics in the Artifact Panel. */
export const Dashboard = meta.story({
  render: (args) => (
    <SplitCanvas
      {...args}
      className="h-[760px]"
      header={header('Retention dashboard')}
      chat={
        <>
          <ChatShellThread>
            <MessageRow role="user" timestamp="14:02">
              Show weekly data and label the last bar.
            </MessageRow>
            <MessageRow author="Assistant" timestamp="14:02">
              Switching the chart to weekly data and labelling the latest week.
            </MessageRow>
            <ArtifactChip loading title="Retention dashboard" loadingLabel="Updating to v4…" />
          </ChatShellThread>
          <ChatShellComposer disclaimer="Assistant can make mistakes. Check important details.">
            <PromptInput aria-label="Message the assistant" />
          </ChatShellComposer>
        </>
      }
      canvas={
        <ArtifactPanel
          title="Retention dashboard"
          version="v3"
          sync={<SyncIndicator status="updating">Updating dashboard…</SyncIndicator>}
          actions={ARTIFACT_ACTIONS}
          onPublish={() => {}}
          onClose={() => {}}
          status="Last edited 2 min ago · 3 versions"
        >
          <WidgetMetricGroup aria-label="Northwind Sync this quarter">
            <WidgetMetricCard size="compact" label="Monthly active" value="48.2k" />
            <WidgetMetricCard size="compact" label="Churn" value="4.8%" />
            <WidgetMetricCard size="compact" label="Net revenue" value="$1.28M" />
          </WidgetMetricGroup>
        </ArtifactPanel>
      }
    />
  ),
})

/** Below 768px: Chat and Canvas tabs. */
export const Mobile = meta.story({ globals: { viewport: { value: 'mobile1' } } })
