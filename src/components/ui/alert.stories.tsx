import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  ClockIcon,
  GaugeIcon,
  Icon,
  InfoIcon,
  SparklesIcon,
  Trash2Icon,
  TriangleAlertIcon,
  WifiOffIcon,
  type LucideIcon,
} from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10671-2494'
const FIGMA_SYSTEM_BANNER = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10728-2505'
const FIGMA_INLINE_NOTE = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10847-5031'

const TONES = ['neutral', 'info', 'success', 'warning', 'destructive', 'agent'] as const
type Tone = (typeof TONES)[number]

/** A fitting icon per tone (Figma: the icon is an instance-swap property, set per use). */
const toneIcon: Record<Tone, LucideIcon> = {
  neutral: CircleCheckIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  destructive: CircleAlertIcon,
  agent: SparklesIcon,
}

type DemoProps = {
  tone?: Tone
  size?: 'default' | 'sm' | 'xs'
  /** Story only: adds an outline xs action and a dismiss button. */
  withActions?: boolean
  onDismiss?: () => void
  title?: string
  description?: string
  /** Figma `show icon` / `show title` / `show description`: render or omit the part. */
  showIcon?: boolean
  showTitle?: boolean
  showDescription?: boolean
}

function DemoAlert({
  tone = 'neutral',
  size = 'default',
  withActions = false,
  onDismiss,
  title = 'Title',
  description = 'Subtitle',
  showIcon = true,
  showTitle = true,
  showDescription = true,
}: DemoProps) {
  return (
    <Alert
      tone={tone}
      size={size}
      action={
        withActions ? (
          <Button variant="outline" intent="neutral" size="xs">
            Retry
          </Button>
        ) : undefined
      }
      onDismiss={withActions ? (onDismiss ?? (() => {})) : undefined}
    >
      {showIcon && <Icon icon={toneIcon[tone]} />}
      {showTitle && <AlertTitle>{title}</AlertTitle>}
      {showDescription && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
}

const meta = preview.meta({
  title: 'Molecules/Alert',
  tags: ['molecule'],
  component: DemoAlert,
  parameters: {
    shadcn: 'alert',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      {
        property: 'tone',
        values: 'neutral · destructive · info · success · warning · agent',
        code: '`tone` prop',
      },
      { property: 'title', values: 'text', code: '`AlertTitle` children' },
      { property: 'description', values: 'text', code: '`AlertDescription` children' },
      {
        property: 'show icon / title / description',
        values: 'boolean',
        code: 'render the `<Icon>`, `AlertTitle` or `AlertDescription` or not',
      },
      { property: 'icon', values: 'instance', code: 'an `<Icon>` child' },
      {
        property: 'system banner · type',
        values: 'usage limit · rate limit · offline · long chat · incomplete',
        code: '`size="sm"` + `tone` + icon (warning gauge · warning clock · neutral wifi-off · info · destructive triangle), `action`, `onDismiss`, `role="status"`',
      },
      {
        property: 'part / inline note · tone · shape',
        values: 'agent · info · success · warning · danger · neutral × inset · full-bleed · rule',
        code: '`size="xs"` + `tone` (inset; full-bleed and rule by className)',
      },
    ],
    docs: {
      description: {
        component:
          'A callout for user attention (shadcn/ui Alert). It is also Figma\'s system banner (`size="sm"`, a one-line notice in the thread) and inline note (`size="xs"`, a note inside a card), with an optional `action` and `onDismiss` (audit M2). `tone`: neutral (the default card) for general information; info, success, warning and agent for status; destructive for errors. Tinted tones use their `--{tone}-subtle` surface, `-muted` stroke, `-strong` title and `-medium` icon and description. `<Alert tone>` + optional `<Icon />` + `<AlertTitle>` (one line) + `<AlertDescription>`. shadcn\'s `variant="destructive"` still works. It is `role="alert"`, so it is announced when it appears; use Toast for transient feedback.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-140">
        <Story />
      </div>
    ),
  ],
  args: {
    tone: 'neutral',
    title: 'Title',
    description: 'Subtitle',
    showIcon: true,
    showTitle: true,
    showDescription: true,
  },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    size: { control: 'inline-radio', options: ['default', 'sm', 'xs'] },
    withActions: { control: 'boolean' },
    onDismiss: { control: false, table: { category: 'Events' } },
    title: { control: 'text' },
    description: { control: 'text' },
    showIcon: { control: 'boolean' },
    showTitle: { control: 'boolean' },
    showDescription: { control: 'boolean' },
  },
})

export const Default = meta.story()

Default.test('is announced with its title and description', async ({ canvas }) => {
  const alert = canvas.getByRole('alert')
  await expect(alert).toHaveTextContent('Title')
  await expect(alert).toHaveTextContent('Subtitle')
})

/** Figma tone=neutral · info · success · warning · destructive · agent. */
export const Tones = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {TONES.map((tone) => (
        <DemoAlert key={tone} tone={tone} />
      ))}
    </div>
  ),
})

/** shadcn's API: `variant="destructive"` still works and is the destructive tone. */
export const ShadcnVariant = meta.story({
  render: () => (
    <Alert variant="destructive">
      <Icon icon={CircleAlertIcon} />
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>Subtitle</AlertDescription>
    </Alert>
  ),
})

ShadcnVariant.test('variant="destructive" maps to tone="destructive"', async ({ canvas }) => {
  await expect(canvas.getByRole('alert')).toHaveAttribute('data-tone', 'destructive')
})

/** Every part is optional: title and icon only, description only. */
export const Parts = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert>
        <Icon icon={Trash2Icon} />
        <AlertTitle>Title</AlertTitle>
      </Alert>
      <Alert>
        <AlertDescription>Subtitle</AlertDescription>
      </Alert>
    </div>
  ),
})

/** A destructive alert whose description holds a paragraph and a list. */
export const WithList = meta.story({
  render: () => (
    <Alert tone="destructive">
      <Icon icon={CircleAlertIcon} />
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>
        <p>Subtitle</p>
        <ul className="list-inside list-disc">
          <li>Label 1</li>
          <li>Label 2</li>
          <li>Label 3</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
})

/**
 * Figma system banner: a one-line notice in the thread (`size="sm"`, `role="status"`). Figma's
 * types are tone + icon: usage limit and rate limit (warning), offline (neutral), long chat
 * (info), incomplete (destructive).
 */
export const SystemNotices = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_SYSTEM_BANNER } },
  render: () => (
    <div className="flex flex-col gap-3">
      {(
        [
          ['warning', GaugeIcon, 'Upgrade'],
          ['warning', ClockIcon, 'Retry'],
          ['neutral', WifiOffIcon, null],
          ['info', InfoIcon, 'New chat'],
          ['destructive', TriangleAlertIcon, 'Continue'],
        ] as const
      ).map(([tone, icon, action], i) => (
        <Alert
          key={i}
          role="status"
          tone={tone}
          size="sm"
          action={
            action && (
              <Button variant="outline" intent="neutral" size="xs">
                {action}
              </Button>
            )
          }
          onDismiss={() => {}}
        >
          <Icon icon={icon} />
          <AlertDescription>Subtitle</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
})

SystemNotices.test('notices are polite and dismissible', async ({ canvas }) => {
  await expect(canvas.getAllByRole('status')).toHaveLength(5)
  await expect(canvas.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(5)
})

/** Figma part / inline note: a note inside a card (`size="xs"`), e.g. Approval Card's warning. */
export const InlineNote = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_INLINE_NOTE } },
  render: () => (
    <div className="flex flex-col gap-3">
      {TONES.map((tone) => (
        <Alert key={tone} tone={tone} size="xs">
          <Icon icon={toneIcon[tone]} />
          <AlertDescription>Subtitle</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
})
