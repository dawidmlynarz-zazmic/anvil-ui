import preview from '#.storybook/preview'
import { expect } from 'storybook/test'

import { Alert, AlertDescription, AlertTitle } from './alert'
import { CircleAlertIcon, CircleCheckIcon, Icon, Trash2Icon } from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10671-2494'

type DemoProps = {
  variant?: 'default' | 'destructive'
  title?: string
  description?: string
  /** Figma `show icon` / `show title` / `show description`: render or omit the part. */
  showIcon?: boolean
  showTitle?: boolean
  showDescription?: boolean
}

function DemoAlert({
  variant = 'default',
  title = 'Title',
  description = 'Subtitle',
  showIcon = true,
  showTitle = true,
  showDescription = true,
}: DemoProps) {
  return (
    <Alert variant={variant}>
      {showIcon && <Icon icon={variant === 'destructive' ? CircleAlertIcon : CircleCheckIcon} />}
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
          'A callout for user attention (shadcn/ui Alert): `variant` default for information and confirmations, destructive for errors. `<Alert>` + optional `<Icon />` + `<AlertTitle>` (one line) + `<AlertDescription>`. It is `role="alert"`, so it is announced when it appears; use Toast for transient feedback.',
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
    variant: 'default',
    title: 'Title',
    description: 'Subtitle',
    showIcon: true,
    showTitle: true,
    showDescription: true,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
  },
})

export const Default = meta.story()

Default.test('is announced with its title and description', async ({ canvas }) => {
  const alert = canvas.getByRole('alert')
  await expect(alert).toHaveTextContent('Title')
  await expect(alert).toHaveTextContent('Subtitle')
})

/** Figma variant=default · destructive. */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <DemoAlert />
      <DemoAlert variant="destructive" />
    </div>
  ),
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
    <Alert variant="destructive">
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
