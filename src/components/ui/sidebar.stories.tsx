import preview from '#.storybook/preview'
import type { ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import {
  BookOpenIcon,
  BotIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  EllipsisIcon,
  FolderIcon,
  HouseIcon,
  Icon,
  type LucideIcon,
  MessageSquareIcon,
  PinIcon,
  PlusIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SquarePenIcon,
  WrenchIcon,
} from './icon'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './sidebar'

const FIGMA = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=10912-1011'

type Preset = 'assistant' | 'platform' | 'workspace'
type DemoProps = {
  /** SidebarProvider `open`: expanded (true) or collapsed (false). A live control. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Figma `preset` (a composition, not a prop). */
  preset?: Preset
  collapsible?: 'offcanvas' | 'icon' | 'none'
  variant?: 'sidebar' | 'floating' | 'inset'
  side?: 'left' | 'right'
}

// ── Parts used by the Figma presets ──────────────────────────────────────────────────────────

/** Figma sidebar / header: logo tile + title / subtitle (brand: agent tile; workspace: switcher). */
function Header({ workspace = false }: { workspace?: boolean }) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="h-8 px-0 hover:bg-transparent group-data-[collapsible=icon]:p-0!"
            asChild
          >
            <div>
              <span
                className={
                  workspace
                    ? 'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground'
                    : 'flex size-8 shrink-0 items-center justify-center rounded-lg bg-agent-subtle text-agent'
                }
              >
                <Icon icon={workspace ? FolderIcon : BotIcon} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-text-sm-semibold text-sidebar-foreground">Title</span>
                <span className="truncate type-text-xs-normal text-muted-foreground">Subtitle</span>
              </span>
              {workspace && <Icon icon={ChevronsUpDownIcon} className="text-muted-foreground" />}
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}

/** Figma sidebar / footer (user): avatar + name / plan + menu. */
function Footer() {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="h-11.5" tooltip="Label">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning-soft type-text-xs-medium text-warning-strong">
              L
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate type-text-sm-medium">Label</span>
              <span className="truncate type-text-xs-normal text-muted-foreground">Subtitle</span>
            </span>
            <Icon icon={ChevronsUpDownIcon} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}

/**
 * Figma sidebar / conversation item: title + meta; status running · needs input · pinned. Hover,
 * focus and active show the more action instead of the meta (as drawn). Meta and tree counts use
 * --muted-foreground: Figma's --foreground-subtle on --sidebar is 4.34:1.
 */
function Conversation({
  title,
  meta,
  status,
  active,
}: {
  title: string
  meta: string
  status?: 'running' | 'needs input' | 'pinned'
  active?: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className="type-text-sm-normal data-[active=true]:type-text-sm-medium"
      >
        <a href={`#${title}`} aria-current={active ? 'page' : undefined}>
          {status === 'running' && (
            <span aria-label="Running" role="img" className="flex size-3 items-center justify-center">
              <span className="size-2 animate-pulse rounded-full bg-agent" />
            </span>
          )}
          {status === 'needs input' && (
            <span aria-label="Needs input" role="img" className="size-2 rounded-full bg-warning" />
          )}
          {status === 'pinned' && <Icon icon={PinIcon} label="Pinned" className="size-3.5" />}
          <span className="flex-1 truncate">{title}</span>
          <span
            className={
              status === 'needs input'
                ? 'type-text-xs-normal text-warning-strong group-hover/menu-item:invisible group-focus-within/menu-item:invisible in-data-[active=true]:invisible'
                : 'type-text-xs-normal text-muted-foreground group-hover/menu-item:invisible group-focus-within/menu-item:invisible in-data-[active=true]:invisible'
            }
          >
            {meta}
          </span>
        </a>
      </SidebarMenuButton>
      <SidebarMenuAction showOnHover aria-label="More actions">
        <Icon icon={EllipsisIcon} />
      </SidebarMenuAction>
    </SidebarMenuItem>
  )
}

function NavItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  badge?: string
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={label}>
        <a href={`#${label}`} aria-current={active ? 'page' : undefined}>
          <Icon icon={icon} />
          <span>{label}</span>
        </a>
      </SidebarMenuButton>
      {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  )
}

/** Figma sidebar / menu item with sub items (platform nav): a Collapsible section. */
function NavSection({
  icon,
  label,
  items,
  defaultOpen,
}: {
  icon: LucideIcon
  label: string
  items: string[]
  defaultOpen?: boolean
}) {
  return (
    <Collapsible asChild defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={label}>
            <Icon icon={icon} />
            <span>{label}</span>
            <Icon
              icon={ChevronRightIcon}
              size="xs"
              className="ml-auto transition-transform duration-(--duration-fast) group-data-[state=open]/collapsible:rotate-90"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item, i) => (
              <SidebarMenuSubItem key={item}>
                <SidebarMenuSubButton
                  href={`#${item}`}
                  isActive={defaultOpen && i === 0}
                  aria-current={defaultOpen && i === 0 ? 'page' : undefined}
                >
                  <span>{item}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

/** Figma sidebar / tree item: chevron, icon, label, count; nested levels indent. */
function TreeItem({
  label,
  count,
  children,
  defaultOpen,
}: {
  label: string
  count: number
  children?: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <Collapsible asChild defaultOpen={defaultOpen} className="group/tree">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton size="sm" className="gap-1 pl-1 type-text-sm-normal" tooltip={label}>
            <Icon
              icon={ChevronRightIcon}
              size="xs"
              className="transition-transform duration-(--duration-fast) group-data-[state=open]/tree:rotate-90"
            />
            <Icon icon={FolderIcon} />
            <span className="flex-1 truncate">{label}</span>
            <span className="type-text-xs-normal text-muted-foreground">{count}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {children && (
          <CollapsibleContent>
            <SidebarMenu className="pl-4">{children}</SidebarMenu>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}

function PresetContent({ preset }: { preset: Preset }) {
  if (preset === 'platform') {
    return (
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Title 1</SidebarGroupLabel>
          <SidebarMenu>
            <NavItem icon={HouseIcon} label="Label 1" />
            <NavSection
              icon={WrenchIcon}
              label="Label 2"
              items={['Label 3', 'Label 4', 'Label 5']}
              defaultOpen
            />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Title 2</SidebarGroupLabel>
          <SidebarMenu>
            <NavSection icon={ShieldCheckIcon} label="Label 6" items={['Label 7', 'Label 8']} />
            <NavItem icon={BookOpenIcon} label="Label 9" badge="3" />
            <NavItem icon={SettingsIcon} label="Label 10" />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    )
  }
  if (preset === 'workspace') {
    return (
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Title 1</SidebarGroupLabel>
          <SidebarMenu>
            <Conversation title="Label 1" meta="2h" status="running" active />
            <Conversation title="Label 2" meta="3h" status="needs input" />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Title 2</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Add">
            <Icon icon={PlusIcon} />
          </SidebarGroupAction>
          <SidebarMenu>
            <TreeItem label="Label 3" count={12} defaultOpen>
              <TreeItem label="Label 4" count={4} />
              <TreeItem label="Label 5" count={8} />
            </TreeItem>
            <TreeItem label="Label 6" count={3} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    )
  }
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <NavItem icon={SquarePenIcon} label="Label 1" />
          <NavItem icon={MessageSquareIcon} label="Label 2" />
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Title 1</SidebarGroupLabel>
        <SidebarMenu>
          <Conversation title="Label 3" meta="2h" status="pinned" />
          <Conversation title="Label 4" meta="2h" status="running" active />
          <Conversation title="Label 5" meta="5h" />
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          Title 2
          <Icon icon={ChevronDownIcon} className="ml-auto" />
        </SidebarGroupLabel>
        <SidebarMenu>
          <Conversation title="Label 6" meta="1d" status="needs input" />
          <Conversation title="Label 7" meta="1d" />
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}

function DemoSidebar({
  open,
  onOpenChange,
  preset = 'assistant',
  collapsible = 'icon',
  variant = 'sidebar',
  side = 'left',
}: DemoProps) {
  return (
    <SidebarProvider open={open} onOpenChange={onOpenChange} className="min-h-[640px]">
      <Sidebar collapsible={collapsible} variant={variant} side={side} className="absolute h-full">
        <Header workspace={preset === 'workspace'} />
        <PresetContent preset={preset} />
        <Footer />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <span className="type-text-sm-medium">Title</span>
        </header>
        <div className="p-4 type-text-sm-normal text-muted-foreground">Subtitle</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const meta = preview.meta({
  title: 'Components/Sidebar',
  component: DemoSidebar,
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA },
    docs: {
      story: { inline: false, height: '660px' },
      description: {
        component:
          'The app sidebar (shadcn/ui Sidebar): `SidebarProvider` › `Sidebar` (`collapsible` offcanvas · icon · none, `variant` sidebar · floating · inset) › `SidebarHeader`, `SidebarContent` (groups of `SidebarMenu` items, sub menus, badges and actions) and `SidebarFooter`, beside `SidebarInset`. ⌘B or `SidebarTrigger` toggles it; below 768px it becomes a sheet. Figma presets (assistant, platform, agent workspace) are compositions of the parts — conversation and tree items included.',
      },
    },
  },
  args: { open: true, preset: 'assistant', collapsible: 'icon', variant: 'sidebar', side: 'left' },
  argTypes: {
    preset: { control: 'inline-radio', options: ['assistant', 'platform', 'workspace'] },
    collapsible: { control: 'inline-radio', options: ['offcanvas', 'icon', 'none'] },
    variant: { control: 'inline-radio', options: ['sidebar', 'floating', 'inset'] },
    side: { control: 'inline-radio', options: ['left', 'right'] },
    onOpenChange: { table: { disable: true } },
  },
})

const sidebarOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-slot=sidebar][data-state]') as HTMLElement

/** Figma preset=assistant, expanded. */
export const Default = meta.story()

Default.test(
  'the trigger and ⌘B collapse it to the icon rail and back',
  async ({ canvas, canvasElement }) => {
    await expect(sidebarOf(canvasElement)).toHaveAttribute('data-state', 'expanded')
    // The trigger and the rail are both named "Toggle Sidebar" (shadcn); use the trigger.
    const trigger = canvas
      .getAllByRole('button', { name: 'Toggle Sidebar' })
      .find((b) => b.dataset.slot === 'sidebar-trigger')!
    await userEvent.click(trigger)
    await waitFor(() => expect(sidebarOf(canvasElement)).toHaveAttribute('data-state', 'collapsed'))
    await expect(sidebarOf(canvasElement)).toHaveAttribute('data-collapsible', 'icon')
    await userEvent.keyboard('{Meta>}b{/Meta}')
    await waitFor(() => expect(sidebarOf(canvasElement)).toHaveAttribute('data-state', 'expanded'))
  },
)

Default.test('the active conversation is the current page; its actions are reachable', async ({ canvas }) => {
  await expect(canvas.getByRole('link', { name: /Label 4/ })).toHaveAttribute('aria-current', 'page')
  const actions = canvas.getAllByRole('button', { name: 'More actions' })
  await expect(actions.length).toBeGreaterThan(0)
})

/** Figma mode=icon: the 56px icon rail (items show tooltips). */
export const IconRail = meta.story({ args: { open: false } })

/** Figma preset=platform: nav groups with collapsible sub items and a badge. */
export const Platform = meta.story({ args: { preset: 'platform' } })

Platform.test('a section expands to its sub items', async ({ canvas }) => {
  const section = canvas.getByRole('button', { name: 'Label 6' })
  await expect(section).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(section)
  await expect(canvas.getByRole('link', { name: 'Label 7' })).toBeVisible()
  await expect(within(canvas.getByRole('link', { name: 'Label 3' })).getByText('Label 3')).toBeInTheDocument()
})

/** Figma preset=agent workspace: switcher, live tasks and a knowledge tree. */
export const Workspace = meta.story({ args: { preset: 'workspace' } })

/** shadcn variant="floating" (and "inset"). */
export const Floating = meta.story({ args: { variant: 'floating' } })
