import * as React from 'react'

import { cn } from '@/lib/utils'
import { MessageActions } from '@/components/agent/message-actions'
import { ShellCloseButton, ShellFooter, ShellHeader, ShellTitle } from '@/components/anvil/shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon, Icon, UploadIcon } from '@/components/ui/icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Figma Agent Builder › Core Kit › artifact panel (10730:2603): the canvas beside the chat where an
// artifact (a dashboard, a document, code) lives. Composed, nothing re-drawn: Card (--card,
// --border, radius xl, shadow/md as drawn) → Shell Header (bar, 10 / 12px): title text/sm/semibold,
// the version picker (ghost xs Button → Dropdown Menu radio items), `sync` (the Surfaces sync
// indicator: a subtle pill Badge), then the Preview / Code view switch (Tabs; Figma draws it as a
// --muted segmented control, active item --card + shadow/xs, styled here), `actions` in Message
// Actions (MessageAction icon-xs: history, copy, download), Publish (brand xs) and Close → the body:
// preview (--background, 20px padding, 16px gap) or `code` (--muted, edge to edge) → Shell Footer
// (8 / 12px) with the `status` note ("Last edited 2 min ago · 3 versions").
// Figma state → preview · code = `view`; editing = your content in the preview (a selection ring and
// the inline assist prompt from Surfaces) with `status` "Editing selection · chart".

type ArtifactView = 'preview' | 'code'

function ArtifactPanel({
  title,
  version,
  versions,
  onVersionChange,
  sync,
  view,
  defaultView = 'preview',
  onViewChange,
  actions,
  onPublish,
  publishLabel = 'Publish',
  onClose,
  status,
  code,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Card>, 'title'> & {
  title: React.ReactNode
  /** The version shown, e.g. "v3". */
  version?: string
  /** Versions to pick from (Dropdown Menu radio items); omit for a static label. */
  versions?: { value: string; label: React.ReactNode }[]
  onVersionChange?: (value: string) => void
  /** Sync with the chat: a subtle pill Badge (Figma sync indicator). */
  sync?: React.ReactNode
  view?: ArtifactView
  defaultView?: ArtifactView
  onViewChange?: (view: ArtifactView) => void
  /** MessageAction items (history, copy, download). */
  actions?: React.ReactNode
  /** Shows Publish (brand xs). */
  onPublish?: () => void
  publishLabel?: React.ReactNode
  /** Shows Close. */
  onClose?: () => void
  /** The status bar text. */
  status?: React.ReactNode
  /** The code view (a Code Block); omit to hide the view switch. */
  code?: React.ReactNode
  /** The preview. */
  children?: React.ReactNode
}) {
  const versionLabel = version && (
    <>
      {version}
      <Icon icon={ChevronDownIcon} />
    </>
  )
  return (
    <Card
      data-slot="artifact-panel"
      className={cn(
        'min-w-0 gap-0 overflow-hidden rounded-xl border-border bg-card py-0 shadow-md',
        className,
      )}
      {...props}
    >
      <Tabs
        value={view}
        defaultValue={defaultView}
        onValueChange={(value) => onViewChange?.(value as ArtifactView)}
        className="min-h-0 flex-1 gap-0"
      >
        <ShellHeader
          className="gap-2 bg-card px-3 py-2.5"
          trailing={
            <>
              {code && (
                <TabsList variant="line" aria-label="View" className="gap-0 rounded-md bg-muted p-0.5">
                  {(
                    [
                      ['preview', 'Preview'],
                      ['code', 'Code'],
                    ] as const
                  ).map(([value, label]) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="rounded-sm px-2 py-1 type-text-xs-medium after:hidden data-[state=active]:bg-card data-[state=active]:shadow-xs data-[state=active]:hover:text-foreground"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}
              {actions && <MessageActions aria-label="Artifact actions">{actions}</MessageActions>}
              {onPublish && (
                <Button intent="brand" size="xs" onClick={onPublish}>
                  <Icon icon={UploadIcon} />
                  {publishLabel}
                </Button>
              )}
            </>
          }
          close={onClose && <ShellCloseButton size="icon-xs" onClick={onClose} />}
        >
          <div className="flex min-w-0 items-center gap-2">
            <ShellTitle className="truncate type-text-sm-semibold">{title}</ShellTitle>
            {versionLabel &&
              (versions ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" intent="neutral" size="xs" aria-label={`Version ${version}`}>
                      {versionLabel}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuRadioGroup value={version} onValueChange={onVersionChange}>
                      {versions.map((v) => (
                        <DropdownMenuRadioItem key={v.value} value={v.value}>
                          {v.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="type-text-xs-semibold text-foreground">{version}</span>
              ))}
            {sync}
          </div>
        </ShellHeader>
        <TabsContent
          value="preview"
          className="flex min-h-0 flex-col gap-4 overflow-auto rounded-none bg-background p-5"
        >
          {children}
        </TabsContent>
        {code && (
          <TabsContent value="code" className="min-h-0 overflow-auto rounded-none bg-muted">
            {code}
          </TabsContent>
        )}
      </Tabs>
      {status && <ShellFooter className="bg-card px-3 py-2" note={status} />}
    </Card>
  )
}

export { ArtifactPanel, type ArtifactView }
