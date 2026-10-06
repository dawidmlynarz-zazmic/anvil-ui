import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { MessageBubble, MessageBubbleContent } from './message-bubble'
import { CircleAlertIcon, Icon, PaperclipIcon } from './icon'
import { Marker, MarkerContent, MarkerIcon } from './marker'
import { Message, MessageContent, MessageGroup } from './message'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10663-3597'

const meta = preview.meta({
  title: 'Atoms/Marker',
  tags: ['atom', 'messages'],
  component: Marker,
  parameters: {
    shadcn: 'marker',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    // Figma: no Marker component; the message row draws it with role system (see Message Row).
    figmaProps: [],
    guide: {
      use: [
        'An event line inside a thread: someone joined, files were shared, the connection dropped.',
        '`variant="separator"` for a day break; a single inline link for a follow-up such as “Undo”.',
      ],
      avoid: [
        'An error that needs action: use Alert or System Banner. A message: use Message Bubble.',
        'A divider outside a thread: use Separator.',
      ],
      content: [
        'One short line in the past tense, with a time when it helps: “Files shared · 14:02”.',
        'At most one link, and it says what it does.',
      ],
      a11y: [
        'The icon is decorative; the text is read in thread order.',
        'It is not a live region: announce important events another way (a Toast or status).',
      ],
    },
    docs: {
      description: {
        component:
          'An event line inside a thread (shadcn/ui Marker): someone joined, files were shared, the connection dropped, a new day starts. `Marker` (`variant` default · separator · border; `asChild`) › `MarkerIcon` + `MarkerContent`. Figma draws it as the message row with role system: text/xs/normal `--muted-foreground`, a 12px icon, centered in the thread.',
      },
    },
  },
  args: { variant: 'default' },
  argTypes: { variant: { control: 'inline-radio', options: ['default', 'separator', 'border'] } },
  render: (args) => (
    <div className="max-w-(--shell-thread-max)">
      <Marker {...args}>
        <MarkerIcon>
          <Icon icon={PaperclipIcon} />
        </MarkerIcon>
        <MarkerContent>Subtitle</MarkerContent>
      </Marker>
    </div>
  ),
})

/** The variant is in Controls. */
export const Default = meta.story()

Default.test('the icon is decorative; the text is read', async ({ canvas, canvasElement }) => {
  await expect(canvasElement.querySelector('[data-slot=marker-icon]')).toHaveAttribute('aria-hidden', 'true')
  await expect(canvas.getByText('Subtitle')).toBeVisible()
})

/** default (an inline line), separator (rules on both sides), border (a rule below). */
export const Variants = meta.story({
  render: () => (
    <div className="flex max-w-(--shell-thread-max) flex-col gap-6">
      <Marker>
        <MarkerContent>Subtitle</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Title</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Subtitle</MarkerContent>
      </Marker>
    </div>
  ),
})

/** Figma system rows: a centered event, and a status with an icon. Links in the text stay actionable. */
export const SystemEvents = meta.story({
  render: () => (
    <div className="flex max-w-(--shell-thread-max) flex-col gap-4">
      <Marker className="justify-center">
        <MarkerContent>Subtitle · 14:02</MarkerContent>
      </Marker>
      <Marker className="justify-center">
        <MarkerIcon>
          <Icon icon={CircleAlertIcon} />
        </MarkerIcon>
        <MarkerContent>Subtitle</MarkerContent>
      </Marker>
      <Marker className="justify-center">
        <MarkerContent>
          Subtitle · <a href="#undo">Undo</a>
        </MarkerContent>
      </Marker>
    </div>
  ),
})

SystemEvents.test('a link inside the marker is reachable', async ({ canvas }) => {
  await expect(canvas.getByRole('link', { name: 'Undo' })).toHaveAttribute('href', '#undo')
})

/** In a thread: a day separator and an event between turns. */
export const InThread = meta.story({
  render: () => (
    <MessageGroup className="max-w-(--shell-thread-max) gap-4">
      <Marker variant="separator">
        <MarkerContent>Title</MarkerContent>
      </Marker>
      <Message align="end">
        <MessageContent>
          <MessageBubble variant="muted">
            <MessageBubbleContent>Subtitle</MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
      <Marker className="justify-center">
        <MarkerIcon>
          <Icon icon={PaperclipIcon} />
        </MarkerIcon>
        <MarkerContent>Subtitle · 14:02</MarkerContent>
      </Marker>
      <Message>
        <MessageContent>
          <MessageBubble variant="ghost">
            <MessageBubbleContent>Subtitle</MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
})
