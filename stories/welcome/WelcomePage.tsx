import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { addons } from 'storybook/preview-api'
import { NAVIGATE_URL } from 'storybook/internal/core-events'

import { IconTile } from '@/components/anvil/icon-tile'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowRightIcon,
  BlocksIcon,
  BotIcon,
  BracesIcon,
  ChevronRightIcon,
  ComponentIcon,
  ExternalLinkIcon,
  FlaskConicalIcon,
  Icon,
  LayersIcon,
  LayoutPanelTopIcon,
  MailIcon,
  MessageSquareTextIcon,
  NetworkIcon,
  PenToolIcon,
  RecycleIcon,
  SquareIcon,
  SunMoonIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'

import { LEVELS, type LevelTitle } from '../../.storybook/taxonomy'

import { catalog, type CatalogItem } from './catalog'
import { ChatDemo } from './ChatDemo'

const FIGMA_URL = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/'
const REPO_URL = 'https://github.com/dawidmlynarz-zazmic/anvil-ui'

// ---------------------------------------------------------------------------------------------
// Storybook index: which catalog items exist, and the path to open for each.

type IndexEntry = {
  id: string
  title: string
  type: 'story' | 'docs'
  subtype?: string
  name: string
  tags?: string[]
}

function useStorybookPaths() {
  const [paths, setPaths] = useState<Map<string, string> | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((index: { entries: Record<string, IndexEntry> }) => {
        const map = new Map<string, string>()
        for (const entry of Object.values(index.entries)) {
          if (map.has(entry.title)) continue
          if (entry.type === 'docs') map.set(entry.title, `/docs/${entry.id}`)
          else if (entry.subtype !== 'test') map.set(entry.title, `/story/${entry.id}`)
        }
        // A group item (e.g. "Agent Builder/Checkout & orders") links to the first page inside it.
        for (const [title, path] of [...map]) {
          const parent = title.slice(0, title.lastIndexOf('/'))
          if (parent && !map.has(parent)) map.set(parent, path)
        }
        if (!cancelled) setPaths(map)
      })
      .catch(() => !cancelled && setPaths(new Map()))
    return () => {
      cancelled = true
    }
  }, [])
  return { paths }
}

/** A link to another Storybook page: navigates the manager (no reload); new-tab still works. */
function StoryLink({
  path,
  className,
  children,
  ...props
}: { path: string; className?: string; children: ReactNode } & Omit<React.ComponentProps<'a'>, 'href'>) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    addons.getChannel().emit(NAVIGATE_URL, `?path=${path}`)
  }
  return (
    <a href={`/?path=${path}`} target="_top" onClick={onClick} className={className} {...props}>
      {children}
    </a>
  )
}

// ---------------------------------------------------------------------------------------------
// Building blocks

const linkClassName =
  'rounded-sm type-text-sm-link text-foreground-link underline-offset-4 hover:underline focus-visible:focus-ring outline-none'

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-(--space-lg)">
      <header className="flex max-w-2xl flex-col gap-2">
        <p className="type-text-xs-semibold tracking-normal text-agent-strong uppercase dark:text-agent-medium">
          {eyebrow}
        </p>
        <h2 id={`${id}-title`} className="type-heading-3xl text-foreground">
          {title}
        </h2>
        {description && <p className="type-text-base-normal text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}

/** A tinted tile + a title + text: the page's one card pattern, on Card and Icon Tile. */
function Tile({
  icon,
  tone = 'neutral',
  title,
  children,
  footer,
}: {
  icon: LucideIcon
  tone?: 'neutral' | 'agent' | 'info'
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Card className="min-w-0 gap-3 rounded-xl border-border bg-card p-(--space-lg)">
      <IconTile icon={icon} tone={tone} size="sm" />
      <h3 className="type-text-base-semibold text-foreground">{title}</h3>
      <div className="flex-1 type-text-sm-normal text-muted-foreground">{children}</div>
      {footer}
    </Card>
  )
}

// ---------------------------------------------------------------------------------------------
// Sections

function Hero({ firstComponent }: { firstComponent?: string }) {
  return (
    <div className="grid gap-(--space-2xl) lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div className="flex flex-col gap-(--space-lg)">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand" shape="pill">
            Design system for AI agents
          </Badge>
          <Badge variant="subtle" tone="brand" shape="pill">
            React · shadcn/ui · Tailwind
          </Badge>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="type-heading-6xl text-foreground">Anvil UI</h1>
          <p className="max-w-xl type-heading-xl text-foreground">
            Everything you need to build a conversation with an AI agent.
          </p>
          <p className="max-w-xl type-text-base-normal text-muted-foreground">
            Messages, thinking, tool calls, questions, approvals, memory, files: the parts of an agent
            interface, designed in Figma and built in React with the same names, tokens and behaviour. Pick
            the pieces you need, or drop in a ready-made one.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {firstComponent && (
            <Button asChild size="lg">
              <StoryLink path={firstComponent}>
                Browse components
                <Icon icon={ArrowRightIcon} />
              </StoryLink>
            </Button>
          )}
          <Button asChild size="lg" variant="outline" intent="neutral">
            <a href={FIGMA_URL} target="_blank" rel="noreferrer">
              <Icon icon={PenToolIcon} />
              Open the Figma file
            </a>
          </Button>
        </div>
      </div>
      <ChatDemo />
    </div>
  )
}

const levels: {
  title: LevelTitle
  icon: LucideIcon
  tone: 'neutral' | 'agent' | 'info'
  body: string
  examples: string
}[] = [
  {
    title: 'Atoms',
    icon: SquareIcon,
    tone: 'neutral',
    body: 'Single pieces with no opinion about where they live. Their examples say “Title” and “Label” on purpose.',
    examples: 'Button, Badge, Input, Avatar, Icon',
  },
  {
    title: 'Molecules',
    icon: ComponentIcon,
    tone: 'neutral',
    body: 'A few atoms doing one job together, like a labelled field or a menu.',
    examples: 'Field, Select, Dropdown Menu, Card, Message Actions',
  },
  {
    title: 'Organisms',
    icon: LayoutPanelTopIcon,
    tone: 'info',
    body: 'Complete sections you reuse everywhere: overlays, navigation, tables.',
    examples: 'Dialog, Sheet, Sidebar, Table, Command',
  },
  {
    title: 'Agent Builder',
    icon: BotIcon,
    tone: 'agent',
    body: 'Finished agent experiences, built from everything above. Use them as they are.',
    examples: 'Prompt Input, Thinking Panel, Approval Card, Citation Drawer, Survey',
  },
]

function Levels({ paths }: { paths: Map<string, string> | null }) {
  return (
    <Section
      id="levels"
      eyebrow="How it’s organised"
      title="From single pieces to finished experiences"
      description="The sidebar has four levels. Start at Agent Builder when you need a whole pattern; go down a level when you need to build your own."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => {
          const first = catalog
            .filter((area) => area.section === level.title)
            .flatMap((area) => area.items)
            .find((item) => paths?.has(item.title))
          return (
            <Tile
              key={level.title}
              icon={level.icon}
              tone={level.tone}
              title={level.title}
              footer={
                first && (
                  <StoryLink path={paths!.get(first.title)!} className={cn(linkClassName, 'w-fit')}>
                    Open {level.title}
                  </StoryLink>
                )
              }
            >
              <p>{level.body}</p>
              <p className="mt-2 type-text-xs-normal">e.g. {level.examples}</p>
            </Tile>
          )
        })}
      </div>
    </Section>
  )
}

const knowledge: { icon: LucideIcon; title: string; body: ReactNode }[] = [
  {
    icon: LayersIcon,
    title: 'Figma decides, code follows',
    body: 'Colours, type, spacing, radii and shadows are pulled from Figma variables. Nothing is typed by hand, so if a value looks wrong, fix it in Figma.',
  },
  {
    icon: NetworkIcon,
    title: 'Every page shows its family',
    body: 'Each component’s docs list what it’s built with and where it’s used, with links, plus when to use it, when not to, and its shadcn original.',
  },
  {
    icon: RecycleIcon,
    title: 'Reuse before you build',
    body: 'Bigger components are made from smaller ones; nothing is drawn twice. Need something new? Combine what exists, or add a variant.',
  },
  {
    icon: BracesIcon,
    title: 'One set of prop names',
    body: (
      <>
        <code className="type-code-xs">variant</code>, <code className="type-code-xs">intent</code>,{' '}
        <code className="type-code-xs">tone</code> and <code className="type-code-xs">size</code> mean the
        same thing everywhere. Hover, focus and pressed are never props: they’re CSS.
      </>
    ),
  },
  {
    icon: SunMoonIcon,
    title: 'Check every state from the toolbar',
    body: 'Switch light and dark, the four places an agent lives (full screen, side panel, popover, mobile), turn motion off, and preview hover, focus and pressed with the State control.',
  },
  {
    icon: FlaskConicalIcon,
    title: 'Interactions are tests',
    body: 'Stories open at rest and never click on their own. What a component does lives in its tests, under each story in the sidebar, run in both themes with accessibility checks.',
  },
  {
    icon: MessageSquareTextIcon,
    title: 'Examples read like the product',
    body: 'Above atoms, stories use real agent copy from one shared story (Maya, Northwind Labs, the Q3 launch plan), so you see how a component should actually be used.',
  },
  {
    icon: BlocksIcon,
    title: 'Built on shadcn/ui',
    body: 'Behaviour, keyboard support and focus come from shadcn/ui and Radix; Anvil restyles them. Know shadcn? You already know most of the API.',
  },
]

function WorthKnowing() {
  return (
    <Section
      id="knowing"
      eyebrow="Good to know"
      title="The things that aren’t obvious"
      description={
        <>
          The rules behind the system, in short. Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to find any component.
        </>
      }
    >
      <div className="grid gap-x-(--space-xl) gap-y-(--space-lg) md:grid-cols-2 lg:grid-cols-4">
        {knowledge.map((item) => (
          <div key={item.title} className="flex flex-col gap-2">
            <IconTile icon={item.icon} tone="info" size="sm" />
            <h3 className="type-text-base-semibold text-foreground">{item.title}</h3>
            <p className="type-text-sm-normal text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

const layers = [
  { name: 'Figma', detail: 'Variables, styles and components' },
  { name: 'Tokens', detail: 'CSS variables for light and dark' },
  { name: 'shadcn/ui + Radix', detail: 'Behaviour and accessibility' },
  { name: 'Anvil components', detail: 'Atoms, molecules, organisms' },
  { name: 'Agent Builder', detail: 'Ready-made agent experiences' },
]

function Architecture() {
  return (
    <Section
      id="architecture"
      eyebrow="How it’s built"
      title="Five layers, each with one job"
      description="Design decisions flow down from Figma, behaviour comes from shadcn/ui, and Anvil adds the look and the agent patterns."
    >
      <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {layers.map((layer, i) => (
          <li key={layer.name} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-full flex-1 flex-col gap-1 rounded-lg p-4 inset-ring',
                i === layers.length - 1
                  ? 'bg-agent-subtle inset-ring-agent-muted'
                  : 'bg-card inset-ring-border',
              )}
            >
              <span className="type-text-sm-semibold text-foreground">{layer.name}</span>
              <span className="type-text-xs-normal text-muted-foreground">{layer.detail}</span>
            </div>
            {i < layers.length - 1 && (
              <Icon icon={ChevronRightIcon} className="hidden text-foreground-subtle lg:block" />
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}

function CatalogRow({ item, path }: { item: CatalogItem; path?: string }) {
  return (
    <li className="flex min-h-8 items-center justify-between gap-2">
      {path ? (
        <StoryLink path={path} className={linkClassName}>
          {item.name}
        </StoryLink>
      ) : (
        <span className="type-text-sm-normal text-muted-foreground">{item.name}</span>
      )}
      <Badge variant="subtle" tone={path ? 'success' : 'neutral'} shape="pill" size="xs">
        {path ? 'Ready' : 'Planned'}
      </Badge>
    </li>
  )
}

const exploreGroups = [
  { key: 'Foundations', label: 'Foundations', description: 'Colour, type, spacing, radius and elevation.' },
  ...LEVELS.map((level) => ({ key: level.title, label: level.title, description: level.description })),
]

function Explore({ paths }: { paths: Map<string, string> | null }) {
  return (
    <Section
      id="explore"
      eyebrow="Everything in the kit"
      title="What’s ready and what’s next"
      description="Every component, grouped like the sidebar. Ready ones open their docs; planned ones are on the roadmap. Figma names that live inside another component point to it."
    >
      {exploreGroups.map((group) => {
        const areas = catalog.filter((area) => area.section === group.key)
        const id = `explore-${group.key.replace(/\W+/g, '-')}`
        return (
          <section key={group.key} aria-labelledby={id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 id={id} className="type-heading-xl text-foreground">
                {group.label}
              </h3>
              <p className="type-text-sm-normal text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {areas.map((area) => (
                <Card key={area.id} className="min-w-0 gap-3 rounded-xl border-border bg-card p-(--space-lg)">
                  <h4 className="type-text-base-semibold text-foreground">{area.name}</h4>
                  <p className="type-text-xs-normal text-muted-foreground">{area.description}</p>
                  <ul className="flex flex-col" aria-label={`${group.label} · ${area.name}`}>
                    {area.items.map((item) => (
                      <CatalogRow key={item.title + item.name} item={item} path={paths?.get(item.title)} />
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </Section>
  )
}

function Contributors() {
  return (
    <Section
      id="contributors"
      eyebrow="People"
      title="Contributors"
      description="The people shaping Anvil UI. Questions, ideas and feedback are welcome."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="min-w-0 gap-4 rounded-xl border-border bg-card p-(--space-lg)">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>DM</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <h3 className="type-text-base-semibold">Dawid Młynarz</h3>
              <p className="type-text-sm-normal text-muted-foreground">Lead Product Designer</p>
            </div>
          </div>
          <a
            className={cn(linkClassName, 'inline-flex w-fit items-center gap-1')}
            href="mailto:dawid.mlynarz@zazmic.ai"
          >
            <Icon icon={MailIcon} size="xs" />
            dawid.mlynarz@zazmic.ai
          </a>
        </Card>
      </div>
    </Section>
  )
}

function Footer() {
  return (
    <footer className="flex flex-col gap-3 border-t border-border pt-(--space-lg) sm:flex-row sm:items-center sm:justify-between">
      <p className="type-text-sm-normal text-muted-foreground">
        Anvil UI by Zazmic. Local development preview.
      </p>
      <nav aria-label="Resources" className="flex flex-wrap gap-4">
        <a
          className={cn(linkClassName, 'inline-flex items-center gap-1')}
          href={FIGMA_URL}
          target="_blank"
          rel="noreferrer"
        >
          Figma file
          <Icon icon={ExternalLinkIcon} size="xs" />
        </a>
        <a
          className={cn(linkClassName, 'inline-flex items-center gap-1')}
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
        >
          Repository
          <Icon icon={ExternalLinkIcon} size="xs" />
        </a>
      </nav>
    </footer>
  )
}

// ---------------------------------------------------------------------------------------------

export function WelcomePage() {
  const { paths } = useStorybookPaths()
  const items = catalog.flatMap((area) => area.items)
  const firstComponent = items.find(
    (item) => item.title.startsWith('Agent Builder/') && paths?.has(item.title),
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-(--space-4xl) px-(--space-lg) py-(--space-2xl) md:px-(--space-2xl)">
        <Hero firstComponent={firstComponent ? paths?.get(firstComponent.title) : undefined} />
        <Levels paths={paths} />
        <WorthKnowing />
        <Architecture />
        <Explore paths={paths} />
        <Contributors />
        <Footer />
      </div>
    </main>
  )
}
