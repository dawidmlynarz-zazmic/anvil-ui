import preview from '#.storybook/preview'
import { expect, fn, userEvent, waitFor } from 'storybook/test'

import { Badge } from './badge'
import { Icon, SettingsIcon } from './icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=8218-18525'
const FIGMA_ITEM = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=1623-6844'
const TABS = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5']

type DemoProps = {
  variant?: 'contained' | 'line'
  fullWidth?: boolean
  orientation?: 'horizontal' | 'vertical'
  /** Story controls: Figma `show icon` / `show badge` on the triggers. */
  showIcon?: boolean
  showBadge?: boolean
  disabledTab?: boolean
  onValueChange?: (value: string) => void
}

function DemoTabs({
  variant = 'contained',
  fullWidth = false,
  orientation = 'horizontal',
  showIcon = false,
  showBadge = false,
  disabledTab = false,
  onValueChange,
}: DemoProps) {
  return (
    <Tabs
      defaultValue="1"
      orientation={orientation}
      onValueChange={onValueChange}
      className="w-full max-w-190"
    >
      <TabsList variant={variant} fullWidth={fullWidth}>
        {TABS.map((label, i) => (
          <TabsTrigger key={label} value={String(i + 1)} disabled={disabledTab && i === TABS.length - 1}>
            {showIcon && <Icon icon={SettingsIcon} />}
            {label}
            {showBadge && (
              <Badge variant="subtle" intent="neutral" size="xs">
                3
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((label, i) => (
        <TabsContent
          key={label}
          value={String(i + 1)}
          className="px-4 type-text-sm-normal text-muted-foreground"
        >
          Subtitle {i + 1}
        </TabsContent>
      ))}
    </Tabs>
  )
}

const meta = preview.meta({
  title: 'Molecules/Tabs',
  tags: ['molecule'],
  component: DemoTabs,
  parameters: {
    shadcn: 'tabs',
    layout: 'padded',
    design: { type: 'figma', url: FIGMA },
    figmaProps: [
      { property: 'full width', values: 'false · true', code: '`fullWidth` prop on `TabsList`' },
      { property: 'variant', values: 'contained · line', code: '`variant` prop on `TabsList`' },
    ],
    docs: {
      description: {
        component:
          'Underlined tab navigation (shadcn/ui Tabs on Radix). `TabsList variant` contained (a rule under the list, default) · line (no rule); `fullWidth` stretches the triggers. Triggers take an optional icon and a count Badge. Arrow keys move between tabs, Home / End jump to the ends.',
      },
    },
  },
  args: {
    variant: 'contained',
    fullWidth: false,
    orientation: 'horizontal',
    showIcon: false,
    showBadge: false,
    disabledTab: false,
    onValueChange: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['contained', 'line'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    fullWidth: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    showBadge: { control: 'boolean' },
    disabledTab: { control: 'boolean' },
    onValueChange: { control: false, table: { category: 'Events' } },
  },
})

export const Default = meta.story()

Default.test('click and arrow keys switch tabs', async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('tab', { name: 'Label 2' }))
  await expect(canvas.getByRole('tab', { name: 'Label 2' })).toHaveAttribute('aria-selected', 'true')
  await expect(args.onValueChange).toHaveBeenLastCalledWith('2')
  await userEvent.keyboard('{ArrowRight}')
  await waitFor(() => expect(canvas.getByRole('tab', { name: 'Label 3' })).toHaveFocus())
  await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Subtitle 3')
})

Default.test('a disabled tab is skipped', { args: { disabledTab: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole('tab', { name: 'Label 5' })).toBeDisabled()
  canvas.getByRole('tab', { name: 'Label 4' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  await waitFor(() => expect(canvas.getByRole('tab', { name: 'Label 1' })).toHaveFocus())
})

/** Figma variant=contained · line × full width=false · true. */
export const Variants = meta.story({
  render: () => (
    <div className="flex flex-col gap-10">
      <DemoTabs variant="contained" />
      <DemoTabs variant="contained" fullWidth />
      <DemoTabs variant="line" />
      <DemoTabs variant="line" fullWidth />
    </div>
  ),
})

/** Figma .tab-nav-item: icon, label and count badge; selected · unselected × hover · focus · disabled (reference). */
export const ItemStates = meta.story({
  parameters: { design: { type: 'figma', url: FIGMA_ITEM } },
  render: () => (
    <div className="flex flex-col gap-6">
      {(['default', 'hover', 'focus-visible', 'disabled'] as const).map((state) => (
        <div key={state} className="flex items-center gap-6">
          <span className="w-24 type-text-xs-medium text-muted-foreground">{state}</span>
          <Tabs defaultValue="1">
            <TabsList variant="line" className="px-0">
              {['1', '2'].map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  disabled={state === 'disabled'}
                  // The state on the trigger only (not its badge), via storybook-addon-pseudo-states.
                  className={state === 'hover' || state === 'focus-visible' ? `pseudo-${state}` : undefined}
                >
                  <Icon icon={SettingsIcon} />
                  Label
                  <Badge variant="subtle" intent="neutral" size="xs">
                    3
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {['1', '2'].map((value) => (
              <TabsContent key={value} value={value} className="sr-only">
                Subtitle
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ))}
    </div>
  ),
})

/** shadcn orientation="vertical": the underline moves to the right edge. */
export const Vertical = meta.story({ args: { orientation: 'vertical', showIcon: true } })
