import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'
import { Button } from './button'
import { Icon, TriangleAlertIcon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10892-134'

type DemoProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Figma `variant`: default → action intent brand, destructive → intent destructive. */
  intent?: 'brand' | 'destructive'
  loading?: boolean
  size?: 'default' | 'sm'
  title?: string
  description?: string
  media?: boolean
  onAction?: () => void
  /** Story-only: false for stories that open on load, so focus stays put until you interact. */
  focusOnOpen?: boolean
}

function DemoAlertDialog({
  open,
  onOpenChange,
  intent = 'brand',
  loading = false,
  size = 'default',
  title = 'Title',
  description = 'Subtitle',
  media = false,
  onAction,
  focusOnOpen = true,
}: DemoProps) {
  const actionLabel = intent === 'destructive' ? 'Delete' : 'Continue'
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" intent="neutral">
          {intent === 'destructive' ? 'Delete' : 'Open dialog'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        size={size}
        onOpenAutoFocus={focusOnOpen ? undefined : (e) => e.preventDefault()}
        // While the action runs, Escape must not dismiss it either.
        onEscapeKeyDown={loading ? (e) => e.preventDefault() : undefined}
      >
        <AlertDialogHeader>
          {media && (
            <AlertDialogMedia>
              <Icon icon={TriangleAlertIcon} />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction intent={intent} loading={loading} onClick={onAction}>
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const meta = preview.meta({
  title: 'UI Components/Alert Dialog',
  tags: ['feature'],
  component: DemoAlertDialog,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'variant',
        values: 'default · destructive',
        code: '`AlertDialogAction` `intent` prop (brand · destructive)',
      },
      { property: 'loading', values: 'false · true', code: '`AlertDialogAction` `loading` prop' },
    ],
    docs: {
      story: { inline: false, height: '320px' },
      description: {
        component:
          'Blocking confirmation for destructive or irreversible actions (shadcn/ui Alert Dialog on Radix). Inline header (title + description) and footer (Cancel + Continue, or Delete when destructive; size sm). Figma `variant` destructive → `AlertDialogAction intent="destructive"`; `loading` → `AlertDialogAction loading` with a disabled Cancel. Unlike Dialog it has no close button and an outside click does not dismiss it; focus starts on Cancel.',
      },
    },
  },
  args: {
    open: false,
    intent: 'brand',
    loading: false,
    size: 'default',
    title: 'Title',
    description: 'Subtitle',
    media: false,
    onAction: fn(),
  },
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: ['brand', 'destructive'],
      description: 'Figma `variant` (default · destructive): the action button intent',
    },
    loading: { control: 'boolean', description: 'Figma `loading`: action spinner, Cancel disabled' },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    title: { control: 'text' },
    description: { control: 'text' },
    open: { control: 'boolean' },
    media: { control: 'boolean', description: 'AlertDialogMedia (icon above the title)' },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onAction: { control: false, table: { category: 'Events' } },
    focusOnOpen: { table: { disable: true } },
  },
})

const body = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body)

/** Closed, like on a page: the trigger (or the `open` control) opens it. */
export const Default = meta.story()

Default.test('opens on Cancel; Escape closes and focus returns', async ({ canvas, canvasElement }) => {
  const trigger = canvas.getByRole('button', { name: 'Open dialog' })
  await userEvent.click(trigger)
  const dialog = await body(canvasElement).findByRole('alertdialog', { name: 'Title' })
  await expect(dialog).toHaveAccessibleDescription('Subtitle')
  const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
  await waitFor(() => expect(cancel).toHaveFocus())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(body(canvasElement).queryByRole('alertdialog')).toBeNull())
  await expect(trigger).toHaveFocus()
})

Default.test('the action runs and closes it', async ({ canvas, canvasElement, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }))
  const dialog = await body(canvasElement).findByRole('alertdialog')
  const action = within(dialog).getByRole('button', { name: 'Continue' })
  await userEvent.click(action)
  await expect(args.onAction).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(body(canvasElement).queryByRole('alertdialog')).toBeNull())
})

Default.test('an outside click does not dismiss it', async ({ canvas, canvasElement }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }))
  await body(canvasElement).findByRole('alertdialog')
  await userEvent.click(canvasElement.ownerDocument.body, { pointerEventsCheck: 0 })
  await expect(body(canvasElement).getByRole('alertdialog')).toBeInTheDocument()
})

/** Figma variant=default, loading=false. */
export const Open = meta.story({ args: { open: true, focusOnOpen: false } })

/** Figma variant=destructive: the action is a destructive Button. */
export const Destructive = meta.story({ args: { open: true, focusOnOpen: false, intent: 'destructive' } })

/** Figma loading=true: the action shows its spinner, Cancel is disabled, nothing dismisses it. */
export const Loading = meta.story({ args: { open: true, focusOnOpen: false, loading: true } })

Loading.test('the action is busy and keeps it open', async ({ canvasElement, args }) => {
  const dialog = await body(canvasElement).findByRole('alertdialog')
  const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
  const action = within(dialog).getByRole('button', { name: 'Continue' })
  await expect(cancel).toBeDisabled()
  await expect(action).toHaveAttribute('aria-busy', 'true')
  action.focus()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{Escape}')
  await expect(args.onAction).not.toHaveBeenCalled()
  await expect(body(canvasElement).getByRole('alertdialog')).toBeInTheDocument()
})

/** Figma variant=destructive, loading=true. */
export const DestructiveLoading = meta.story({
  args: { open: true, focusOnOpen: false, intent: 'destructive', loading: true },
})

/** shadcn `size="sm"`: 320px, centered text, the two buttons share the footer. */
export const Small = meta.story({ args: { open: true, focusOnOpen: false, size: 'sm' } })

/** shadcn `AlertDialogMedia`: an icon above (sm) or beside (default) the title. */
export const WithMedia = meta.story({
  args: { open: true, focusOnOpen: false, intent: 'destructive', media: true },
})
