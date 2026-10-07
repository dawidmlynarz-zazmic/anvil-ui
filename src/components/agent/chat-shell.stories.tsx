import preview from '#.storybook/preview'
import { expect, within } from 'storybook/test'

import { MessageRow } from '@/components/agent/message-row'
import { ModelAndToolsPicker } from '@/components/agent/model-and-tools-picker'
import { PromptInput } from '@/components/agent/prompt-input'
import { QuickReply, QuickReplyGroup } from '@/components/agent/quick-reply'
import { IconTile } from '@/components/anvil/icon-tile'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import {
  BotIcon,
  ChevronDownIcon,
  EllipsisIcon,
  Icon,
  Maximize2Icon,
  MessageSquarePlusIcon,
  SearchIcon,
  ShareIcon,
  SquarePenIcon,
  XIcon,
} from '@/components/ui/icon'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

import {
  ChatShell,
  ChatShellComposer,
  ChatShellHeader,
  ChatShellThread,
  type ChatSurface,
} from './chat-shell'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10740-2065'
const DISCLAIMER = 'Assistant can make mistakes. Check important details.'

const iconButton = (label: string, glyph: typeof XIcon) => (
  <Button variant="ghost" intent="neutral" size="icon-sm" aria-label={label}>
    <Icon icon={glyph} />
  </Button>
)

/** The example thread (Figma swaps a thread into the shell; these are its contents). */
function Thread() {
  return (
    <>
      <MessageRow role="user" timestamp="14:02">
        Summarise the Q3 launch plan for Maya in five bullets.
      </MessageRow>
      <MessageRow author="Assistant" timestamp="14:02">
        Here’s the Q3 launch plan for Northwind Sync: beta closes 12 Sep, pricing goes live 1 Oct, the launch
        webinar is 8 Oct, partner enablement runs through October, and Maya Chen owns the readiness review.
      </MessageRow>
      <QuickReplyGroup aria-label="Suggested follow-ups">
        <QuickReply>Draft the launch email</QuickReply>
        <QuickReply>List the open risks</QuickReply>
      </QuickReplyGroup>
    </>
  )
}

const AGENT_TILE = <IconTile icon={BotIcon} tone="agent" size="sm" shape="circle" />

function Header({ surface }: { surface: ChatSurface }) {
  if (surface === 'full-screen')
    return (
      <ChatShellHeader
        title={
          <Button variant="ghost" intent="neutral" size="sm" className="-ml-3 type-text-sm-semibold">
            Q3 launch plan
            <Icon icon={ChevronDownIcon} />
          </Button>
        }
        actions={
          <>
            <ModelAndToolsPicker
              models={[
                { value: 'pro', label: 'Assistant Pro' },
                { value: 'fast', label: 'Assistant Fast' },
              ]}
            />
            {iconButton('Share', ShareIcon)}
            {iconButton('More', EllipsisIcon)}
          </>
        }
      />
    )
  if (surface === 'mobile')
    return (
      <ChatShellHeader
        media={iconButton('Collapse', ChevronDownIcon)}
        title="Assistant"
        actions={iconButton('More', EllipsisIcon)}
      />
    )
  return (
    <ChatShellHeader
      media={AGENT_TILE}
      title="Assistant"
      subtitle="Launch assistant · online"
      online
      actions={
        surface === 'side-panel' ? (
          <>
            {iconButton('New chat', SquarePenIcon)}
            {iconButton('Expand', Maximize2Icon)}
            {iconButton('Close', XIcon)}
          </>
        ) : (
          <>
            {iconButton('Expand', Maximize2Icon)}
            {iconButton('Close', XIcon)}
          </>
        )
      }
    />
  )
}

function Shell({ surface, className }: { surface: ChatSurface; className?: string }) {
  return (
    <ChatShell surface={surface} className={className}>
      <Header surface={surface} />
      <ChatShellThread>
        <Thread />
      </ChatShellThread>
      <ChatShellComposer disclaimer={DISCLAIMER}>
        <PromptInput
          aria-label="Message the assistant"
          size={surface === 'popover' || surface === 'mobile' ? 'compact' : 'default'}
        />
      </ChatShellComposer>
    </ChatShell>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Surfaces/Chat Shell',
  tags: ['agent-builder'],
  component: ChatShell,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        component:
          'The chat column every surface shares (`@/components/agent/chat-shell`): `ChatShell` (`surface` full-screen · side-panel · popover · mobile sets `data-shell`, so the shell tokens switch), `ChatShellHeader` (on Shell Header: `media`, `title`, `subtitle`, `online`, `actions`), `ChatShellThread` (on Message Scroller) and `ChatShellComposer` (the Prompt Input and the `disclaimer`). The container is composed around it: Sidebar + SidebarInset (full screen), Sheet (side panel), the Launcher’s popover, Drawer (mobile).',
      },
    },
    figmaProps: [
      {
        property: 'surface',
        values: 'full screen · side panel · popover · mobile',
        code: '`surface` prop (sets `data-shell`) + the container: SidebarInset · Sheet · Launcher · Drawer',
      },
      { property: '.shell header', values: 'instance (exposed)', code: '`ChatShellHeader`' },
      { property: 'thread', values: 'instance swap', code: '`ChatShellThread` children' },
      {
        property: '.composer dock · show disclaimer',
        values: 'boolean',
        code: '`ChatShellComposer` with a Prompt Input; `disclaimer` (render or omit)',
      },
      {
        property: '.composer dock · show response controls',
        values: 'boolean',
        code: 'Prompt Input `response` (Stop / Regenerate / Continue)',
      },
    ],
    guide: {
      use: [
        'Every chat surface: the same header, thread and composer, with `surface` matching where it lives.',
        'Full screen: put it in a SidebarInset next to the Sidebar. Side panel: in a Sheet. Popover: in the Launcher. Mobile: in a Drawer.',
      ],
      avoid: [
        'A one-off question in a page: use Clarifying Question or Inline Suggestion.',
        'A thread next to a document or dashboard: use Split Canvas.',
      ],
      content: [
        'Header: the agent’s name and what it does (“Launch assistant · online”); on full screen, the chat’s title.',
        'Disclaimer: one short sentence, the same on every surface.',
      ],
      a11y: [
        'The thread scrolls on its own; the jump button returns to the newest message.',
        'Header actions are icon Buttons with names (“Expand”, “Close”); the container (Sheet, Drawer, Popover) handles focus and Escape.',
      ],
    },
  },
  args: { surface: 'side-panel' as ChatSurface },
  argTypes: {
    surface: { control: 'inline-radio', options: ['full-screen', 'side-panel', 'popover', 'mobile'] },
  },
  render: ({ surface }) => (
    <div
      data-shell={surface}
      className="h-(--shell-container-height) max-h-[90vh] w-(--shell-container-width) max-w-[95vw] overflow-hidden rounded-xl border border-border shadow-elevation-raised"
    >
      <Shell surface={surface ?? 'side-panel'} />
    </div>
  ),
})

/** Each surface at its shell size, framed. Switch it in Controls. */
export const Default = meta.story()

Default.test('has a header, the thread and the composer', async ({ canvas }) => {
  await expect(canvas.getByText('Launch assistant · online')).toBeVisible()
  await expect(canvas.getByRole('textbox', { name: 'Prompt' })).toBeVisible()
  await expect(canvas.getByText(DISCLAIMER)).toBeVisible()
})

/** Full screen: next to the Sidebar, in a SidebarInset. */
export const FullScreen = meta.story({
  parameters: { layout: 'fullscreen' },
  render: () => (
    <SidebarProvider className="h-[760px] min-h-0">
      <Sidebar className="absolute h-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Icon icon={MessageSquarePlusIcon} />
                  New chat
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Icon icon={SearchIcon} />
                  Search chats
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Recents</SidebarGroupLabel>
            <SidebarMenu>
              {['Q3 launch plan', 'Pricing research', 'Partner enablement'].map((chat, i) => (
                <SidebarMenuItem key={chat}>
                  <SidebarMenuButton isActive={i === 0}>{chat}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-h-0">
        <Shell surface="full-screen" />
      </SidebarInset>
    </SidebarProvider>
  ),
})

/** Side panel: in a Sheet (440px). */
export const SidePanel = meta.story({
  render: () => (
    <Sheet open modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-(--shell-container-width) gap-0 p-0"
        data-shell="side-panel"
      >
        <SheetTitle className="sr-only">Assistant</SheetTitle>
        <Shell surface="side-panel" />
      </SheetContent>
    </Sheet>
  ),
})

SidePanel.test('lives in a Sheet dialog', async ({ canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await expect(body.getByRole('dialog', { name: 'Assistant' })).toBeVisible()
})

/** Mobile: in a bottom Drawer with its grab handle. */
export const Mobile = meta.story({
  globals: { viewport: { value: 'mobile1' } },
  render: () => (
    <Drawer open modal={false}>
      <DrawerContent
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="h-[85dvh] max-h-none"
        data-shell="mobile"
      >
        <DrawerTitle className="sr-only">Assistant</DrawerTitle>
        <Shell surface="mobile" className="min-h-0 flex-1" />
      </DrawerContent>
    </Drawer>
  ),
})
