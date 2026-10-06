import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { CopyIcon, Icon, LinkIcon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

// Figma Agent Builder › Core Kit › Shell · share dialog (10727:2445): share a chat as a read-only
// link and export it. Built on Dialog (Figma: "Built on shadcn/ui: Dialog"), 480px:
// - Header: `title` ("Share chat") and the state line (private: "Only you can see this chat." ·
//   shared: "Anyone with the link can view. Your name is hidden.").
// - Body (16px apart): when shared, the link (a read-only Input) and Copy link (brand); then the
//   two options as Fields (horizontal: FieldLabel + FieldDescription, Switch); then "Export"
//   (text/xs/medium muted) and the `exports` slot (outline sm Buttons).
// - Footer: private → Cancel (ghost) + Create public link (brand, link icon); shared → Stop sharing
//   (ghost destructive) at the start + Done (outline).
// Figma state private · public → `shared`. Figma draws the footer as the card footer (--muted
// bar); Dialog keeps its own footer (bar) so every dialog matches.

type ShareSettings = { includeFiles: boolean; allowContinue: boolean }

const OPTIONS: { key: keyof ShareSettings; label: string; description: string }[] = [
  {
    key: 'includeFiles',
    label: 'Include files and artifacts',
    description: 'Viewers can open uploaded files and generated artifacts',
  },
  {
    key: 'allowContinue',
    label: 'Allow continuing the chat',
    description: 'Viewers can fork a copy and keep chatting',
  },
]

function ShareDialog({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title = 'Share chat',
  shared = false,
  link,
  onShare,
  onStopSharing,
  onCopyLink,
  settings,
  defaultSettings = { includeFiles: false, allowContinue: false },
  onSettingsChange,
  exports,
  onOpenAutoFocus,
}: {
  /** The element that opens it, e.g. a Share Button. */
  trigger?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: React.ReactNode
  /** Figma state public: the chat has a link. */
  shared?: boolean
  /** The public link, shown while `shared`. */
  link?: string
  /** Create public link. */
  onShare?: () => void
  onStopSharing?: () => void
  onCopyLink?: (link: string) => void
  settings?: ShareSettings
  defaultSettings?: ShareSettings
  onSettingsChange?: (settings: ShareSettings) => void
  /** Export buttons (outline, sm), e.g. Google Docs, PDF, Markdown. */
  exports?: React.ReactNode
  /** Radix: prevent it to keep focus where it is (e.g. a story that opens on load). */
  onOpenAutoFocus?: React.ComponentProps<typeof DialogContent>['onOpenAutoFocus']
}) {
  const [inner, setInner] = React.useState(defaultSettings)
  const values = settings ?? inner
  const id = React.useId()
  const set = (key: keyof ShareSettings, on: boolean) => {
    const next = { ...values, [key]: on }
    setInner(next)
    onSettingsChange?.(next)
  }

  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        data-slot="share-dialog"
        data-shared={shared || undefined}
        onOpenAutoFocus={onOpenAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {shared ? 'Anyone with the link can view. Your name is hidden.' : 'Only you can see this chat.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {shared && link && (
            <div className="flex items-center gap-2">
              <Input readOnly value={link} aria-label="Share link" className="min-w-0 flex-1" />
              <Button intent="brand" onClick={() => onCopyLink?.(link)}>
                <Icon icon={CopyIcon} />
                Copy link
              </Button>
            </div>
          )}
          {OPTIONS.map((option) => (
            <Field
              key={option.key}
              orientation="horizontal"
              className="has-[>[data-slot=field-content]]:items-center"
            >
              <FieldContent className="gap-0">
                <FieldLabel htmlFor={`${id}-${option.key}`} className="type-text-sm-medium">
                  {option.label}
                </FieldLabel>
                <FieldDescription className="type-text-xs-normal">{option.description}</FieldDescription>
              </FieldContent>
              <Switch
                id={`${id}-${option.key}`}
                checked={values[option.key]}
                onCheckedChange={(on) => set(option.key, on)}
              />
            </Field>
          ))}
          {exports && (
            <div role="group" aria-labelledby={`${id}-export`} className="flex flex-col gap-2">
              <span id={`${id}-export`} className="type-text-xs-medium text-muted-foreground">
                Export
              </span>
              <div className="flex flex-wrap gap-2">{exports}</div>
            </div>
          )}
        </DialogBody>
        <DialogFooter align={shared ? 'between' : 'end'}>
          {shared ? (
            <>
              <Button variant="ghost" intent="destructive" size="sm" onClick={onStopSharing}>
                Stop sharing
              </Button>
              <DialogClose asChild>
                <Button variant="outline" intent="neutral" size="sm">
                  Done
                </Button>
              </DialogClose>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant="ghost" intent="neutral" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button intent="brand" size="sm" onClick={onShare}>
                <Icon icon={LinkIcon} />
                Create public link
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ShareDialog, type ShareSettings }
