import * as React from 'react'

import { cn } from '@/lib/utils'
import { ChatShell } from '@/components/agent/chat-shell'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'

// Figma Agent Builder › Surfaces › Split canvas · split canvas shell (10745:5172): the chat beside an
// artifact. Built from existing parts, nothing re-drawn:
// - `header` across the top (a ChatShellHeader with the full-screen shell tokens: the chat title,
//   the model picker, share and more).
// - Resizable (horizontal): the chat pane — a Chat Shell with `surface="side-panel"` (Figma: "chat
//   pane uses the side-panel mode"), `chat` is its ChatShellThread and ChatShellComposer — then the
//   handle (Figma pane divider = Resizable's handle, focusable and keyboard-resizable), then the
//   canvas pane: `canvas` (an Artifact Panel, e.g. with a Document Canvas) with 20px padding.
// - Below 768px the panes become two Tabs, Chat and Canvas (Figma Templates › Split canvas mobile),
//   switched with `view` / `onViewChange`.

type SplitCanvasView = 'chat' | 'canvas'

function SplitCanvas({
  header,
  chat,
  canvas,
  chatSize = 36,
  view,
  defaultView = 'chat',
  onViewChange,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  /** Across the top: a ChatShellHeader (title, model picker, share, more). */
  header?: React.ReactNode
  /** The chat pane's contents: ChatShellThread + ChatShellComposer. */
  chat: React.ReactNode
  /** The canvas: an Artifact Panel. */
  canvas: React.ReactNode
  /** The chat pane's starting width, in % of the row (20–60). */
  chatSize?: number
  /** Mobile: which pane shows. */
  view?: SplitCanvasView
  defaultView?: SplitCanvasView
  onViewChange?: (view: SplitCanvasView) => void
}) {
  const mobile = useIsMobile()
  const chatPane = (
    <ChatShell surface="side-panel" className="min-h-0">
      {chat}
    </ChatShell>
  )
  const canvasPane = (
    <div className="flex h-full min-h-0 min-w-0 flex-col p-5 *:min-h-0 *:flex-1">{canvas}</div>
  )

  return (
    <div
      data-slot="split-canvas"
      data-shell="full-screen"
      className={cn('flex h-full min-h-0 w-full min-w-0 flex-col bg-background text-foreground', className)}
      {...props}
    >
      {header}
      {mobile ? (
        <Tabs
          value={view}
          defaultValue={defaultView}
          onValueChange={(next) => onViewChange?.(next as SplitCanvasView)}
          className="min-h-0 flex-1 gap-0"
        >
          <TabsList aria-label="Pane" className="w-full shrink-0 border-b px-(--shell-padding-x) *:flex-1">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="min-h-0">
            {chatPane}
          </TabsContent>
          <TabsContent value="canvas" className="min-h-0">
            {canvasPane}
          </TabsContent>
        </Tabs>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize={String(chatSize)} minSize="20" maxSize="60">
            {chatPane}
          </ResizablePanel>
          <ResizableHandle aria-label="Resize the chat and the canvas" />
          <ResizablePanel minSize="40">{canvasPane}</ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  )
}

export { SplitCanvas, type SplitCanvasView }
