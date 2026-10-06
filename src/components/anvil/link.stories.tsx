import preview from '#.storybook/preview'
import { expect, fn, userEvent } from 'storybook/test'

import { ArrowRightIcon, ExternalLinkIcon, Icon } from '@/components/ui/icon'

import { Link } from './link'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8465-2320'

const INTENTS = ['brand', 'neutral', 'destructive', 'inverse'] as const
const STATES = ['default', 'hover', 'focus', 'disabled'] as const

const meta = preview.meta({
  title: 'Design System/Atoms/Link',
  tags: ['atom'],
  component: Link,
  parameters: {
    layout: 'centered',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'intent', values: 'brand · inverse · destructive · neutral', code: '`intent` prop' },
      { property: 'size', values: 'default · sm', code: '`size` prop' },
      {
        property: 'state',
        values: 'default · hover · disabled · focus',
        code: 'selectors: `hover:` · `aria-disabled:` (`disabled` prop) · `focus-visible:`',
      },
      { property: 'label', values: 'text', code: 'children' },
      {
        property: 'show icon left / right · icon left / right',
        values: 'boolean · instance',
        code: 'an `<Icon>` child before or after the label',
      },
    ],
    guide: {
      use: [
        'Navigation: to another page, a document, a source or an external site.',
        'Inline in running text; `asChild` for router links.',
      ],
      avoid: ['An action that does not navigate: use Button (`variant="link"` when it must look like text).'],
      content: [
        'Say where it goes: “View all sources”, never “click here”.',
        'Add the external-link icon when it leaves the product.',
      ],
      a11y: [
        'A real `<a href>`: Enter follows it; focus shows the focus ring.',
        '`disabled` sets `aria-disabled` and removes it from the tab order; explain why nearby.',
        'Say so when a link opens in a new tab.',
      ],
    },
    docs: {
      description: {
        component:
          'An inline text link with optional icons (`@/components/anvil/link`). `intent` brand · neutral · destructive · inverse (on inverse surfaces), `size` default · sm, `disabled` (aria-disabled, out of the tab order), `asChild` for router links. Hover underlines; focus shows the focus ring. Use Button for actions that do not navigate.',
      },
    },
  },
  args: {
    intent: 'brand',
    size: 'default',
    disabled: false,
    href: '#label',
    children: 'Label',
    onClick: fn(),
  },
  argTypes: {
    intent: { control: 'inline-radio', options: INTENTS },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    children: { control: 'text' },
    disabled: { control: 'boolean' },
    href: { control: 'text' },
    asChild: { control: false },
    onClick: { control: false, table: { category: 'Events' } },
  },
  render: (args) =>
    args.intent === 'inverse' ? (
      <div className="rounded-lg bg-background-inverse p-4">
        <Link {...args} />
      </div>
    ) : (
      <Link {...args} />
    ),
})

/** Intent, size, disabled and the text are in Controls. */
export const Default = meta.story()

Default.test('is a link that can be followed', async ({ canvas, canvasElement, args }) => {
  // Keep the test page in place: the click reaches the link, the browser does not navigate.
  canvasElement.addEventListener('click', (event) => event.preventDefault(), { capture: true })
  const link = canvas.getByRole('link', { name: 'Label' })
  await expect(link).toHaveAttribute('href', '#label')
  await userEvent.click(link)
  await expect(args.onClick).toHaveBeenCalledOnce()
})

/** Figma intent × state × size. Inverse sits on an inverse surface. */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      {INTENTS.map((intent) => (
        <div
          key={intent}
          className={
            intent === 'inverse'
              ? 'grid grid-cols-4 gap-6 rounded-lg bg-background-inverse p-4'
              : 'grid grid-cols-4 gap-6 p-4'
          }
        >
          {STATES.map((state) =>
            (['default', 'sm'] as const).map((size) => (
              <span
                key={`${state}-${size}`}
                className={
                  state === 'hover' ? 'pseudo-hover-all' : state === 'focus' ? 'pseudo-focus-visible-all' : ''
                }
              >
                <Link href="#label" intent={intent} size={size} disabled={state === 'disabled'}>
                  Label
                </Link>
              </span>
            )),
          )}
        </div>
      ))}
    </div>
  ),
})

/** Figma show icon left / right: the icon follows the size (16 / 12px). */
export const WithIcons = meta.story({
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Link href="#all">
        View all
        <Icon icon={ArrowRightIcon} />
      </Link>
      <Link href="#docs" size="sm" intent="neutral">
        <Icon icon={ExternalLinkIcon} />
        Open docs
      </Link>
    </div>
  ),
})

/** Disabled links leave the tab order and ignore clicks. */
export const Disabled = meta.story({ args: { disabled: true } })

Disabled.test('is skipped by Tab and ignores clicks', async ({ canvas, args }) => {
  const link = canvas.getByRole('link', { name: 'Label' })
  await expect(link).toHaveAttribute('aria-disabled', 'true')
  await userEvent.tab()
  await expect(link).not.toHaveFocus()
  link.click()
  await expect(args.onClick).not.toHaveBeenCalled()
})

/** Inline in running text. */
export const InText = meta.story({
  render: () => (
    <p className="max-w-100 type-text-sm-normal text-foreground">
      Subtitle <Link href="#label">Label</Link> Subtitle.
    </p>
  ),
})
