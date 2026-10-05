import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Alert, AlertDescription, AlertTitle } from './alert'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  Icon,
  InfoIcon,
  SparklesIcon,
  Trash2Icon,
  TriangleAlertIcon,
  type LucideIcon,
} from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10671-2494'

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
  title?: string
  description?: string
  /** Figma `show icon` / `show title` / `show description`: render or omit the part. */
  showIcon?: boolean
  showTitle?: boolean
  showDescription?: boolean
}

function DemoAlert({
  tone = 'neutral',
  title = 'Title',
  description = 'Subtitle',
  showIcon = true,
  showTitle = true,
  showDescription = true,
}: DemoProps) {
  return (
    <Alert tone={tone}>
      {showIcon && <Icon icon={toneIcon[tone]} />}
      {showTitle && <AlertTitle>{title}</AlertTitle>}
      {showDescription && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
}

const meta = preview.meta({
  title: 'Components/Alert',
  component: DemoAlert,
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    docs: {
      description: {
        component:
          'A callout for user attention (shadcn/ui Alert). `tone`: neutral (the default card) for general information; info, success, warning and agent for status; destructive for errors. Tinted tones use their `--{tone}-subtle` surface, `-muted` stroke, `-strong` title and `-medium` icon and description. `<Alert tone>` + optional `<Icon />` + `<AlertTitle>` (one line) + `<AlertDescription>`. shadcn\'s `variant="destructive"` still works. It is `role="alert"`, so it is announced when it appears; use Toast for transient feedback.',
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
