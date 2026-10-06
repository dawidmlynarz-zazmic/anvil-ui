import preview from '#.storybook/preview'
import type { ReactNode } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from './button'
import {
  Icon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from './icon'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=917-9268'
const FIGMA_ICON = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8218-5908'

const variants = ['default', 'outline', 'ghost'] as const
const intents = ['brand', 'neutral', 'destructive', 'inverse'] as const
const sizes = ['xs', 'sm', 'default', 'lg'] as const
const iconSizes = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const

/** Inverse buttons sit on inverse surfaces (tooltips, dark chips, media). */
function Surface({ intent, children }: { intent?: string; children: ReactNode }) {
  return (
    <div
      className={
        intent === 'inverse'
          ? 'flex flex-wrap items-center gap-3 rounded-lg bg-background-inverse p-3'
          : 'flex flex-wrap items-center gap-3 p-3'
      }
    >
      {children}
    </div>
  )
}

const RowLabel = ({ children }: { children: ReactNode }) => (
  <div className="w-24 shrink-0 type-text-xs-medium text-muted-foreground">{children}</div>
)

const meta = preview.meta({
  title: 'Atoms/Button',
  tags: ['atom'],
  component: Button,
  parameters: {
    shadcn: 'button',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'variant', values: 'default · outline · ghost', code: '`variant` prop' },
      { property: 'intent', values: 'brand · neutral · inverse · destructive', code: '`intent` prop' },
      { property: 'size', values: 'lg · default · sm · xs', code: '`size` prop' },
      { property: 'shape', values: 'default · pill', code: '`shape` prop' },
      { property: 'loading', values: 'boolean', code: '`loading` prop' },
      {
        property: 'state',
        values: 'default · hover · disabled · focus',
        code: 'selectors: `hover:` · `disabled:` · `focus-visible:` (not a prop)',
      },
      { property: 'label', values: 'text', code: 'children' },
      {
        property: 'show icon left / right · icon left / right',
        values: 'boolean · instance',
        code: 'an `<Icon>` child before or after the label',
      },
      {
        property: 'icon button · variant',
        values: 'default · outline · ghost',
        code: '`variant` prop',
      },
      {
        property: 'icon button · intent',
        values: 'brand · neutral · inverse · destructive',
        code: '`intent` prop',
      },
      {
        property: 'icon button · size',
        values: 'icon-xs · icon-sm · icon · icon-lg',
        code: '`size` prop (`icon*` values)',
      },
      { property: 'icon button · shape', values: 'default · circle', code: '`shape` prop' },
      {
        property: 'icon button · state',
        values: 'default · hover · disabled · focus',
        code: 'selectors: `hover:` · `disabled:` · `focus-visible:` (not a prop)',
      },
      {
        property: 'icon button · icon',
        values: 'instance',
        code: 'an `<Icon>` child (+ `aria-label` on the Button)',
      },
    ],
    guide: {
      use: [
        'For any action: submitting, confirming, opening a layer, starting a task. One `intent="brand"` (primary) button per view or footer.',
        'Icon-only buttons (`size="icon*"`) for compact, well-known actions in toolbars and message rows; always pass `aria-label`.',
        '`loading` while the action runs (it keeps the width and disables the button).',
      ],
      avoid: [
        'Navigation to another page: use Link. On/off states: use Toggle or Switch.',
        'Several primary buttons side by side: keep one brand button; the others outline or ghost.',
      ],
      content: [
        'A verb that says what happens: “Save changes”, “Send”, “Delete”, not “OK” or “Yes”.',
        'Sentence case, no trailing punctuation; a leading icon only when it adds meaning.',
      ],
      a11y: [
        'A real `<button>` (or `asChild` link): Enter and Space activate it; focus shows the focus ring.',
        'Icon-only buttons need `aria-label`; toggles add `aria-pressed`.',
        'Disabled buttons drop out of the tab order; prefer explaining why an action is unavailable.',
      ],
    },
    docs: {
      description: {
        component:
          'Primary action control (shadcn/ui Button). `variant` sets the appearance, `intent` the color role. Icon-only buttons use an `icon*` size and need an accessible label. `shape="pill"` / `"circle"` inside fully rounded containers.',
      },
    },
  },
  args: {
    children: 'Label',
    variant: 'default',
    intent: 'brand',
    size: 'default',
    shape: 'default',
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    intent: { control: 'inline-radio', options: intents },
    size: { control: 'select', options: [...sizes, ...iconSizes] },
    shape: { control: 'inline-radio', options: ['default', 'pill', 'circle'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    onClick: { control: false, table: { category: 'Events' } },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <Surface intent={args.intent ?? undefined}>
      <Button {...args} />
    </Surface>
  ),
})

/** Every prop and the interaction state are in Controls. */
export const Default = meta.story()

Default.test('clicks and takes keyboard focus', async ({ canvas, args }) => {
  const button = canvas.getByRole('button', { name: 'Label' })
  await userEvent.click(button)
  await expect(args.onClick).toHaveBeenCalledTimes(1)
  button.blur()
  await userEvent.tab()
  await expect(button).toHaveFocus()
})

Default.test('loading is busy and ignores clicks', { args: { loading: true } }, async ({ canvas, args }) => {
  const button = canvas.getByRole('button', { name: 'Label' })
  await expect(button).toHaveAttribute('aria-busy', 'true')
  await userEvent.click(button, { pointerEventsCheck: 0 })
  await expect(args.onClick).not.toHaveBeenCalled()
})

Default.test('disabled', { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('button', { name: 'Label' })).toBeDisabled()
})

/** Every `variant` × `intent` at the default size. */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-2">
      {intents.map((intent) => (
        <div key={intent} className="flex items-center gap-2">
          <RowLabel>{intent}</RowLabel>
          <Surface intent={intent}>
            {variants.map((variant) => (
              <Button key={variant} variant={variant} intent={intent}>
                Label
              </Button>
            ))}
          </Surface>
        </div>
      ))}
    </div>
  ),
})

/** Text sizes 24 / 32 / 40 / 48 px and icon sizes; `xs` uses 12px icons. */
export const Sizes = meta.story({
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        {sizes.map((size) => (
          <Button key={size} size={size}>
            <Icon icon={PlusIcon} />
            Label
          </Button>
        ))}
      </Surface>
      <Surface>
        {iconSizes.map((size) => (
          <Button key={size} size={size} aria-label="Add">
            <Icon icon={PlusIcon} />
          </Button>
        ))}
      </Surface>
    </div>
  ),
})

export const Shapes = meta.story({
  render: () => (
    <Surface>
      <Button>Label</Button>
      <Button shape="pill">Label</Button>
      <Button variant="outline" intent="neutral" shape="pill">
        Label
      </Button>
      <Button size="icon" shape="circle" aria-label="Add">
        <Icon icon={PlusIcon} />
      </Button>
      <Button size="icon" variant="outline" intent="neutral" shape="circle" aria-label="Next">
        <Icon icon={ChevronRightIcon} />
      </Button>
    </Surface>
  ),
})

/** Figma `state` values side by side (reference sheet). For one button, use the State control on Default. */
export const States = meta.story({
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <RowLabel>{''}</RowLabel>
        <div className="flex gap-3 px-3">
          {['default', 'hover', 'focus', 'disabled', 'loading'].map((state) => (
            <div key={state} className="w-24 type-text-xs-medium text-muted-foreground">
              {state}
            </div>
          ))}
        </div>
      </div>
      {intents.map((intent) =>
        variants.map((variant) => (
          <div key={intent + variant} className="flex items-center gap-2">
            <RowLabel>
              {intent} · {variant}
            </RowLabel>
            <Surface intent={intent}>
              <Button variant={variant} intent={intent}>
                Label
              </Button>
              <span className="pseudo-hover-all contents">
                <Button variant={variant} intent={intent}>
                  Label
                </Button>
              </span>
              <span className="pseudo-focus-visible-all contents">
                <Button variant={variant} intent={intent}>
                  Label
                </Button>
              </span>
              <Button variant={variant} intent={intent} disabled>
                Label
              </Button>
              <Button variant={variant} intent={intent} loading>
                Label
              </Button>
            </Surface>
          </div>
        )),
      )}
    </div>
  ),
})

export const WithIcons = meta.story({
  render: () => (
    <Surface>
      <Button>
        <Icon icon={ChevronLeftIcon} />
        Back
      </Button>
      <Button variant="outline" intent="neutral">
        Next
        <Icon icon={ArrowRightIcon} />
      </Button>
      <Button variant="ghost" intent="brand">
        <Icon icon={SparklesIcon} />
        Generate
      </Button>
      <Button intent="destructive">
        <Icon icon={Trash2Icon} />
        Delete
      </Button>
    </Surface>
  ),
})

/** Icon-only buttons (Figma `icon button`): always pass an accessible label. */
export const IconButtons = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_ICON } },
  render: () => (
    <div className="flex flex-col gap-2">
      {intents.map((intent) => (
        <div key={intent} className="flex items-center gap-2">
          <RowLabel>{intent}</RowLabel>
          <Surface intent={intent}>
            {variants.map((variant) => (
              <Button key={variant} size="icon" variant={variant} intent={intent} aria-label="Add">
                <Icon icon={PlusIcon} />
              </Button>
            ))}
          </Surface>
        </div>
      ))}
    </div>
  ),
})

/** A footer action row, and `asChild` rendering a link. */
export const Composition = meta.story({
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-end gap-2 rounded-lg border border-border p-4">
        <Button variant="ghost" intent="neutral">
          Cancel
        </Button>
        <Button>Save</Button>
      </div>
      <Button asChild variant="outline" intent="brand">
        <a href="#docs">
          Learn more
          <Icon icon={ArrowRightIcon} />
        </a>
      </Button>
    </div>
  ),
})

Composition.test('asChild renders a link styled as a button', async ({ canvasElement }) => {
  const link = within(canvasElement).getByRole('link', { name: 'Learn more' })
  await expect(link).toHaveAttribute('data-slot', 'button')
})
