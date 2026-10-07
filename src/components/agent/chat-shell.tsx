import * as React from 'react'

import { cn } from '@/lib/utils'
import { ShellDescription, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'

// Figma Agent Builder › Surfaces › Containers · chat shell (10740:2065): the chat column every
// surface shares. Built from existing parts, nothing re-drawn; the surface's container is composed
// around it (Figma: "Sheet (side panel) / Drawer (mobile)"; the popover is the Launcher's; full
// screen sits in a SidebarInset next to the Sidebar).
// - `surface` full-screen · side-panel · popover · mobile sets `data-shell`, so the --shell-* tokens
//   (header height, padding, gap, thread and widget widths) switch with it.
// - ChatShellHeader (Figma .shell header 10739:118) is the Shell Header bar at
//   --shell-header-height and --shell-padding-x: `media` (agent Icon Tile, or a collapse Button on
//   mobile), `title` text/sm/semibold, `subtitle` text/xs muted with an optional online dot,
//   `actions` (ghost icon Buttons). Mobile centres the title.
// - ChatShellThread is a Message Scroller (follows new messages, jump button) whose content is
//   --shell-thread-max wide, --shell-gap apart, padded by --shell-padding-x.
// - ChatShellComposer (Figma .composer dock 10739:139): the Prompt Input (`children`) at the thread
//   width, 12px above and --shell-padding-y below, then the `disclaimer` (text/xs
//   --foreground-subtle).

type ChatSurface = 'full-screen' | 'side-panel' | 'popover' | 'mobile'

const ChatShellContext = React.createContext<ChatSurface>('full-screen')

function ChatShell({
  surface = 'full-screen',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** Where the chat lives; switches the --shell-* tokens. */
  surface?: ChatSurface
}) {
  return (
    <ChatShellContext.Provider value={surface}>
      <div
        data-slot="chat-shell"
        data-shell={surface}
        className={cn('flex h-full min-h-0 w-full min-w-0 flex-col bg-background text-foreground', className)}
        {...props}
      />
    </ChatShellContext.Provider>
  )
}

function ChatShellHeader({
  media,
  title,
  subtitle,
  online = false,
  actions,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  /** Leads the header: the agent's Icon Tile, or a collapse Button on mobile. */
  media?: React.ReactNode
  /** The agent's or the chat's name; on full screen it can be a menu trigger. */
  title: React.ReactNode
  /** e.g. "Ticketing assistant · online". */
  subtitle?: React.ReactNode
  /** A --success dot before the subtitle. */
  online?: boolean
  /** Ghost icon Buttons (and the model picker on full screen). */
  actions?: React.ReactNode
}) {
  const surface = React.useContext(ChatShellContext)
  return (
    <ShellHeader
      data-slot="chat-shell-header"
      media={media}
      trailing={actions}
      className={cn(
        'h-(--shell-header-height) min-h-0 gap-2 border-border px-(--shell-padding-x) py-0 *:data-[slot=shell-header-text]:gap-0',
        surface === 'mobile' &&
          '*:data-[slot=shell-header-text]:items-center *:data-[slot=shell-header-text]:text-center',
        className,
      )}
      {...props}
    >
      <ShellTitle className="truncate type-text-sm-semibold">{title}</ShellTitle>
      {subtitle && (
        <ShellDescription className="flex items-center gap-1 type-text-xs-normal">
          {online && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-success" />}
          <span className="truncate">{subtitle}</span>
        </ShellDescription>
      )}
    </ShellHeader>
  )
}

function ChatShellThread({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MessageScrollerContent>) {
  return (
    <MessageScrollerProvider defaultScrollPosition="end">
      <MessageScroller data-slot="chat-shell-thread" className="min-h-0 flex-1">
        <MessageScrollerViewport className="px-(--shell-padding-x)">
          <MessageScrollerContent
            className={cn(
              'mx-auto w-full max-w-(--shell-thread-max) gap-(--shell-gap) py-(--shell-padding-y)',
              className,
            )}
            {...props}
          >
            {children}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

function ChatShellComposer({
  disclaimer,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  /** Under the composer, e.g. "Assistant can make mistakes. Check important details." */
  disclaimer?: React.ReactNode
}) {
  return (
    <div
      data-slot="chat-shell-composer"
      className={cn(
        'flex shrink-0 flex-col items-center gap-2 bg-background px-(--shell-padding-x) pt-3 pb-(--shell-padding-y) *:w-full *:max-w-(--shell-thread-max)',
        className,
      )}
      {...props}
    >
      {children}
      {disclaimer && <p className="text-center type-text-xs-normal text-foreground-subtle">{disclaimer}</p>}
    </div>
  )
}

export { ChatShell, ChatShellHeader, ChatShellThread, ChatShellComposer, type ChatSurface }
