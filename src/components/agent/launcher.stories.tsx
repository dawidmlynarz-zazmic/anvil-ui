import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { ChatShell, ChatShellComposer, ChatShellHeader, ChatShellThread } from '@/components/agent/chat-shell'
import { MessageRow } from '@/components/agent/message-row'
import { PromptInput } from '@/components/agent/prompt-input'
import { IconTile } from '@/components/anvil/icon-tile'
import { Button } from '@/components/ui/button'
import { BotIcon, Icon, MinusIcon } from '@/components/ui/icon'

import { Launcher } from './launcher'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10739-232'

function Panel() {
  return (
    <ChatShell surface="popover">
      <ChatShellHeader
        media={<IconTile icon={BotIcon} tone="agent" size="sm" shape="circle" />}
        title="Assistant"
        subtitle="Launch assistant · online"
        online
        actions={
          <Button variant="ghost" intent="neutral" size="icon-sm" aria-label="Minimise">
            <Icon icon={MinusIcon} />
          </Button>
        }
      />
      <ChatShellThread>
        <MessageRow author="Assistant" timestamp="14:02">
          Hi Maya. The Q3 launch plan changed this morning: the webinar moved to 8 Oct. Want a summary?
        </MessageRow>
      </ChatShellThread>
      <ChatShellComposer disclaimer="Assistant can make mistakes.">
        <PromptInput size="compact" aria-label="Message the assistant" />
      </ChatShellComposer>
    </ChatShell>
  )
}

const meta = preview.meta({
  title: 'Agent Builder/Surfaces/Launcher',
  tags: ['agent-builder'],
  component: Launcher,
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '840px' },
      description: {
        component:
          'The floating button that opens the popover chat (`@/components/agent/launcher`), on Popover + Button: fixed 24px from the bottom-right, `children` is the panel (a Chat Shell with `surface="popover"`). `unread` count, `preview` (Figma attention) with `onDismissPreview`, `offline`, `icon`, `label`, `open` (Radix).',
      },
    },
    figmaProps: [
      {
        property: 'state',
        values: 'idle · hover · unread · attention · open · offline',
        code: 'idle (default) · `hover:` · `unread` · `preview` · `open` · `offline`',
      },
    ],
    guide: {
      use: [
        'On a host product’s pages, to open the assistant in a popover without leaving the page.',
        'Show `unread` when the agent has replied while the panel was closed; use `preview` sparingly, for something time-sensitive.',
      ],
      avoid: [
        'The assistant is the whole page: use Chat Shell full screen.',
        'Help next to a specific field or element: use Element Spotlight or a Tooltip.',
      ],
      content: [
        '`label`: what opens (“Open the assistant”).',
        '`preview`: one or two sentences that say why now (“Seats for Sat 17 Oct are selling fast. Want me to hold two?”).',
      ],
      a11y: [
        'The button is named by `label` and says when it closes the panel; the count is announced (“2 unread”).',
        'The panel is a Popover: focus moves in, Escape closes it, and focus returns to the button.',
        'The pulse ring stops with reduced motion.',
      ],
    },
  },
  args: { unread: 0, offline: false, open: false, onOpenChange: fn(), onDismissPreview: fn() },
  argTypes: {
    open: { control: 'boolean' },
    unread: { control: { type: 'number', min: 0, max: 99 } },
    offline: { control: 'boolean' },
    label: { control: 'text' },
    preview: { control: 'text' },
    icon: { control: false },
    children: { control: false },
    onOpenChange: { control: false, table: { category: 'Events' } },
    onDismissPreview: { control: false, table: { category: 'Events' } },
  },
  render: (args) => (
    <div className="relative h-[800px] bg-muted">
      <Launcher {...args} className="absolute">
        <Panel />
      </Launcher>
    </div>
  ),
})

/** Idle at the bottom-right. Open it, or use the controls. */
export const Default = meta.story()

Default.test('opens and closes the chat', async ({ canvas, canvasElement }) => {
  const body = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Open the assistant' }))
  const panel = await body.findByRole('dialog', { name: 'Assistant' })
  await waitFor(() => expect(panel).toBeVisible())
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(canvas.getByRole('button', { name: 'Open the assistant' })).toHaveFocus())
})

/** Figma state unread: two replies while it was closed. */
export const Unread = meta.story({ args: { unread: 2 } })

Unread.test('announces the count', async ({ canvas }) => {
  await expect(canvas.getByLabelText('2 unread')).toBeVisible()
})

/** Figma state attention: a message beside the button, with a pulse. */
export const Attention = meta.story({
  args: { preview: 'The Q3 launch webinar moved to 8 Oct. Want me to update the plan?' },
})

/** Figma state open: the popover chat. */
export const Open = meta.story({ args: { open: true } })

/** Figma state offline. */
export const Offline = meta.story({ args: { offline: true } })
