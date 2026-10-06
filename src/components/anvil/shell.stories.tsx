import preview from '#.storybook/preview'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { SparklesIcon } from '@/components/ui/icon'

import { IconTile } from './icon-tile'
import {
  ShellCloseButton,
  ShellDescription,
  ShellFooter,
  ShellHeader,
  ShellTitle,
  shellDescriptionClassName,
  shellTitleClassName,
} from './shell'

const FIGMA_HEADER = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10960-223'
const FIGMA_FOOTER = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10960-260'

const meta = preview.meta({
  title: 'Molecules/Shell',
  tags: ['molecule'],
  component: ShellHeader,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA_HEADER },
    // Private Figma parts (.shell header, .shell footer): variant properties only.
    figmaProps: [
      { property: '.shell header · variant', values: 'bar · inline', code: '`ShellHeader` `variant` prop' },
      { property: '.shell footer · variant', values: 'bar · inline', code: '`ShellFooter` `variant` prop' },
      {
        property: 'part / card header',
        values: 'title · subtitle · show tile · show trailing · trailing',
        code: '`ShellHeader variant="card"`: `ShellTitle`, `ShellDescription`, `media` (tile), `trailing`',
      },
      {
        property: 'part / card footer',
        values: 'leading action(s) · note · secondary · primary',
        code: '`ShellFooter variant="card"`: `note`, then the actions as children',
      },
      {
        property: '.shell footer · align',
        values: 'end · between · stretch',
        code: '`ShellFooter` `align` prop',
      },
    ],
    guide: {
      use: [
        'Building a new overlay or card surface that needs the standard header (title, description, close) and footer (actions).',
        '`bar` for full-width shells (Dialog, Sheet, Drawer); `inline` inside padded containers (Alert Dialog, Popover, Card); `card` for agent cards.',
        'Footer `align="between"` when a tertiary action sits on the left; `stretch` on narrow mobile shells.',
      ],
      avoid: [
        'Using these parts directly in app code: use the shell components (Dialog, Sheet, Popover, Card) that wrap them with Radix titles.',
        'Re-drawing a header or footer row by hand in a new component: compose `ShellHeader` / `ShellFooter` instead.',
      ],
      content: [
        'Titles name the task or object (“Share “Q3 launch plan””, “Delete “Q3 launch plan”?”); the description adds the consequence or context in one sentence.',
        'Footers: secondary action first, then one primary that says what it does (“Save”, “Delete”, “Approve”).',
        'A card footer `note` states a consequence only when it matters (“It can’t be unsent.”).',
      ],
      a11y: [
        'Each shell renders its own Title / Description so Radix names and describes the dialog; keep a title even when it is visually hidden.',
        'The close button is labelled “Close” and stays last in the DOM, so initial focus lands on the first control.',
      ],
    },
    docs: {
      description: {
        component:
          'Shared header and footer for every shell (Dialog, Alert Dialog, Sheet, Drawer, Popover, Card). Shells wrap them with their own Title / Description / Close. `ShellHeader` variant bar · inline; `ShellFooter` variant bar · inline × align end · between · stretch.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[548px] max-w-full overflow-hidden rounded-xl bg-background inset-ring inset-ring-overlay-16">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['bar', 'inline'] },
    close: { control: false },
    children: { control: false },
  },
})

const Title = ({ children }: { children: string }) => <h2 className={shellTitleClassName}>{children}</h2>
const Description = ({ children }: { children: string }) => (
  <p className={shellDescriptionClassName}>{children}</p>
)

type HeaderDemoProps = {
  variant: 'bar' | 'inline'
  title: string
  description: string
  showClose: boolean
}

/** One ShellHeader from Controls: `variant`, title, description and the close button. */
export const Default = meta.story({
  args: {
    variant: 'bar',
    title: 'Share “Q3 launch plan”',
    description: 'People with the link can view this conversation.',
    showClose: true,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['bar', 'inline'] },
    title: { control: 'text' },
    description: { control: 'text' },
    showClose: { control: 'boolean' },
  },
  render: (args) => {
    const { variant, title, description, showClose } = args as unknown as HeaderDemoProps
    return (
      <div className={cn(variant === 'inline' && 'p-4')}>
        <ShellHeader variant={variant} close={showClose ? <ShellCloseButton /> : undefined}>
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
        </ShellHeader>
      </div>
    )
  },
})

export const HeaderBar = meta.story({
  render: () => (
    <div className="flex flex-col">
      <ShellHeader close={<ShellCloseButton />}>
        <Title>Connected apps</Title>
      </ShellHeader>
      <ShellHeader close={<ShellCloseButton />}>
        <Title>Share “Q3 launch plan”</Title>
        <Description>People with the link can view this conversation.</Description>
      </ShellHeader>
    </div>
  ),
})

/** Inline: no padding — the container pads it (Alert Dialog, Popover, Card). */
export const HeaderInline = meta.story({
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <ShellHeader variant="inline" close={<ShellCloseButton />}>
        <Title>Rename conversation</Title>
      </ShellHeader>
      <ShellHeader variant="inline">
        <Title>Delete “Q3 launch plan”?</Title>
        <Description>Its 14 messages and 3 files will be permanently removed.</Description>
      </ShellHeader>
    </div>
  ),
})

/** Every `variant` × `align`; actions are size sm Buttons (secondary outline · neutral, primary brand). */
export const Footer = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_FOOTER } },
  render: () => (
    <div className="flex flex-col gap-4 py-4">
      {(['bar', 'inline'] as const).map((variant) =>
        (['end', 'between', 'stretch'] as const).map((align) => (
          <div key={variant + align} className={cn(variant === 'inline' && 'px-4')}>
            <div className="mb-1 px-4 type-text-xs-medium text-muted-foreground">
              {variant} · {align}
            </div>
            <ShellFooter variant={variant} align={align}>
              <Button size="sm" variant="outline" intent="neutral">
                Cancel
              </Button>
              <Button size="sm">Save</Button>
            </ShellFooter>
          </div>
        )),
      )}
    </div>
  ),
})

/**
 * Figma part / card header and part / card footer (audit M3): the same header and footer as the
 * overlays, in their card variant, as used by Approval Card, Connector Card, Clarifying Question and
 * Memory Manager.
 */
export const Card = meta.story({
  render: () => (
    <div className="max-w-140 overflow-hidden rounded-xl border bg-card shadow-sm">
      <ShellHeader
        variant="card"
        media={<IconTile icon={SparklesIcon} tone="agent" size="sm" />}
        trailing={
          <Badge variant="semantic" tone="info" size="xs" indicator>
            Pending
          </Badge>
        }
      >
        <ShellTitle>Send the beta invite email</ShellTitle>
        <ShellDescription>Mail · send_email</ShellDescription>
      </ShellHeader>
      <div className="p-4 type-text-sm-normal text-muted-foreground">
        To 248 beta testers, from Maya Chen, today at 9:00 AM Pacific.
      </div>
      <ShellFooter variant="card" note="It can’t be unsent.">
        <Button size="sm" variant="outline" intent="neutral">
          Deny
        </Button>
        <Button size="sm">Approve</Button>
      </ShellFooter>
    </div>
  ),
})
