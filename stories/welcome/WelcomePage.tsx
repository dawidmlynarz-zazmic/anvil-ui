import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { addons } from 'storybook/preview-api'
import { NAVIGATE_URL } from 'storybook/internal/core-events'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AccessibilityIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BotIcon,
  BoxesIcon,
  BracesIcon,
  ChevronRightIcon,
  CodeXmlIcon,
  ExternalLinkIcon,
  FlaskConicalIcon,
  Icon,
  LayersIcon,
  MousePointerClickIcon,
  PaletteIcon,
  PanelsTopLeftIcon,
  PenToolIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SunMoonIcon,
  type LucideIcon,
} from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import { catalog, type CatalogItem } from './catalog'

const FIGMA_URL = 'https://www.figma.com/design/2170cRKZD9nhz325op4rL1/'
const REPO_URL = 'https://github.com/dawidmlynarz-zazmic/anvil-ui'

// ---------------------------------------------------------------------------------------------
// Storybook index: which catalog items exist, and the path to open for each.

type IndexEntry = { id: string; title: string; type: 'story' | 'docs'; subtype?: string; name: string }

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
        // A group item (e.g. "Agent Builder/Core Kit") links to the first page inside it.
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
  return paths
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
        <p className="type-text-xs-semibold tracking-normal text-agent-strong uppercase">{eyebrow}</p>
        <h2 id={`${id}-title`} className="type-heading-3xl text-foreground">
          {title}
        </h2>
        {description && <p className="type-text-base-normal text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}

function IconTile({ icon, tone = 'neutral' }: { icon: LucideIcon; tone?: 'neutral' | 'agent' | 'info' }) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg',
        tone === 'agent' && 'bg-agent-subtle text-agent-strong',
        tone === 'info' && 'bg-info-subtle text-info-strong',
        tone === 'neutral' && 'bg-muted text-foreground',
      )}
    >
      <Icon icon={icon} />
    </span>
  )
}

function Tile({
  icon,
  tone,
  title,
  children,
}: {
  icon: LucideIcon
  tone?: 'neutral' | 'agent' | 'info'
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-(--space-lg) text-card-foreground inset-ring inset-ring-border">
      <IconTile icon={icon} tone={tone} />
      <h3 className="type-text-base-semibold">{title}</h3>
      <div className="type-text-sm-normal text-muted-foreground">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Sections

function Hero({ firstComponent, ready, total }: { firstComponent?: string; ready: number; total: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-gradient-neutral-start to-gradient-neutral-end inset-ring inset-ring-border">
      <div className="grid gap-(--space-2xl) p-(--space-2xl) lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="flex flex-col gap-(--space-lg)">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="subtle" intent="neutral">
              Zazmic design system
            </Badge>
            <Badge variant="outline" intent="neutral">
              React · shadcn/ui · Tailwind CSS
            </Badge>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="type-heading-6xl text-foreground">Anvil UI</h1>
            <p className="max-w-xl type-text-base-normal text-muted-foreground">
              The design system for Zazmic&apos;s conversational AI agents. It gives you shared foundations
              and accessible React components, with patterns for building agent experiences. The design lives
              in Figma and the code is built on shadcn/ui.
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
          <dl className="flex flex-wrap gap-x-(--space-xl) gap-y-3">
            {[
              [`${ready} of ${total}`, 'components and foundations ready'],
              ['2', 'themes (light and dark)'],
              ['4', 'shell modes'],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col">
                <dt className="sr-only">{label}</dt>
                <dd className="type-heading-xl text-foreground">{value}</dd>
                <dd className="type-text-xs-medium text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Sample />
      </div>
    </div>
  )
}

/** A small live composition: real Anvil components, drawn from the tokens. */
function Sample() {
  return (
    <div
      aria-label="Sample of Anvil components"
      role="group"
      className="flex flex-col gap-4 rounded-xl bg-popover p-(--space-lg) text-popover-foreground shadow-elevation-raised inset-ring inset-ring-overlay-4"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-agent text-agent-foreground">
          <Icon icon={SparklesIcon} />
        </span>
        <div className="flex flex-col">
          <span className="type-text-sm-semibold">Title</span>
          <span className="type-text-xs-normal text-muted-foreground">Subtitle</span>
        </div>
        <Badge variant="subtle" intent="neutral" className="ml-auto">
          Label
        </Badge>
      </div>
      <p className="rounded-lg bg-muted p-3 type-text-sm-normal text-foreground">Subtitle</p>
      <div className="flex items-center gap-3">
        <Switch id="welcome-sample-switch" defaultChecked aria-label="Label" />
        <label htmlFor="welcome-sample-switch" className="type-text-sm-medium">
          Label
        </label>
        <span className="ml-auto flex items-center gap-1 type-text-xs-medium text-muted-foreground">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" intent="neutral">
          Label
        </Button>
        <Button size="sm">Label</Button>
      </div>
    </div>
  )
}

function Audience() {
  return (
    <Section
      id="audience"
      eyebrow="Who it's for"
      title="One system for everyone shipping agent experiences"
      description="Anvil UI is the shared language between design and engineering, so agent products look, behave and read the same."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Tile icon={CodeXmlIcon} title="Product engineers">
          Build agent UIs from accessible components. Keyboard handling, focus and theming are already done,
          so you write product code instead of reimplementing primitives.
        </Tile>
        <Tile icon={PaletteIcon} title="Designers">
          Each Figma component, variant and token has one coded counterpart with the same name. You can check
          every state here, in light and dark.
        </Tile>
        <Tile icon={BotIcon} tone="agent" title="Agent and AI teams">
          Ready-made patterns for conversations: messages, attachments, markers and the surfaces an agent
          lives in, whether that's a full screen, a side panel, a popover or mobile.
        </Tile>
      </div>
    </Section>
  )
}

const goals: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: LayersIcon,
    title: 'Figma is the source of truth',
    body: 'Colors, type, spacing, radii and shadows are pulled straight from Figma variables and styles. None are invented in code.',
  },
  {
    icon: BoxesIcon,
    title: 'Built on shadcn/ui and Radix',
    body: 'Every component keeps shadcn behavior: triggers, focus management, keyboard support and dismissal. Anvil restyles it.',
  },
  {
    icon: AccessibilityIcon,
    title: 'Accessible by default',
    body: 'Every story is tested with axe in both themes, with WCAG AA contrast, real labels and visible focus.',
  },
  {
    icon: BracesIcon,
    title: 'One consistent API',
    body: 'Prop names come from the API contract: variant, intent, tone, size. You learn them once and use them everywhere.',
  },
  {
    icon: PanelsTopLeftIcon,
    title: 'Ready for any surface',
    body: 'Shell tokens adapt the same components to full screen, side panel, popover and mobile.',
  },
  {
    icon: SparklesIcon,
    title: 'Made for agents',
    body: 'Agent tones, status, streaming and conversation patterns are first-class, not bolted on.',
  },
]

function Goals() {
  return (
    <Section
      id="goals"
      eyebrow="Purpose"
      title="What Anvil UI is for"
      description="Ship conversational products faster, with one look and one behavior across every Zazmic agent."
    >
      <div className="grid gap-x-(--space-xl) gap-y-(--space-lg) md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <div key={goal.title} className="flex gap-3">
            <IconTile icon={goal.icon} tone="info" />
            <div className="flex flex-col gap-1">
              <h3 className="type-text-base-semibold text-foreground">{goal.title}</h3>
              <p className="type-text-sm-normal text-muted-foreground">{goal.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

const layers = [
  { name: 'Figma', detail: 'Variables, styles, components' },
  { name: 'Tokens', detail: 'CSS variables, light and dark' },
  { name: 'shadcn/ui + Radix', detail: 'Behavior and accessibility' },
  { name: 'Anvil components', detail: 'Restyled to the API contract' },
  { name: 'Agent Builder', detail: 'Conversation patterns' },
]

function Architecture() {
  return (
    <Section
      id="architecture"
      eyebrow="How it's built"
      title="Five layers, each with one job"
      description="Design decisions flow down from Figma; behavior comes from shadcn/ui; Anvil adds the styling and the agent patterns."
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
              <span className="type-text-xs-medium text-muted-foreground">Step {i + 1}</span>
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

function Status({ ready }: { ready: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 type-text-2xs-medium',
        ready ? 'bg-success-subtle text-success-strong' : 'bg-muted text-muted-foreground',
      )}
    >
      {ready ? 'Ready' : 'Planned'}
    </span>
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
      <Status ready={Boolean(path)} />
    </li>
  )
}

function Explore({ paths }: { paths: Map<string, string> | null }) {
  return (
    <Section
      id="explore"
      eyebrow="Explore"
      title="Everything we're building"
      description="Every area of the system. Ready items open their stories. Planned items follow the roadmap: shadcn counterparts first, then custom Anvil components and Agent Builder."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {catalog.map((area) => {
          const ready = area.items.filter((item) => paths?.has(item.title)).length
          return (
            <div
              key={area.id}
              className="flex flex-col gap-3 rounded-xl bg-card p-(--space-lg) text-card-foreground inset-ring inset-ring-border"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="type-text-base-semibold">{area.name}</h3>
                <span className="type-text-xs-medium text-muted-foreground">
                  {ready}/{area.items.length}
                </span>
              </div>
              <p className="type-text-xs-normal text-muted-foreground">{area.description}</p>
              <div
                className="h-1 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${ready} of ${area.items.length} ready`}
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(ready / area.items.length) * 100}%` }}
                />
              </div>
              <ul className="flex flex-col" aria-label={area.name}>
                {area.items.map((item) => (
                  <CatalogRow key={item.title} item={item} path={paths?.get(item.title)} />
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

const tips: { icon: LucideIcon; title: string; body: ReactNode }[] = [
  {
    icon: LayersIcon,
    title: 'Sidebar',
    body: (
      <>
        <strong className="text-foreground">Foundations</strong> (tokens),{' '}
        <strong className="text-foreground">Components</strong> (shadcn/ui, A–Z),{' '}
        <strong className="text-foreground">Anvil</strong> (shared parts) and{' '}
        <strong className="text-foreground">Agent Builder</strong>, grouped like the Figma pages: Primitives,
        Core Kit, Agent Patterns, Surfaces and Templates.
      </>
    ),
  },
  {
    icon: SunMoonIcon,
    title: 'Toolbar',
    body: (
      <>
        Switch the <strong className="text-foreground">theme</strong>, the{' '}
        <strong className="text-foreground">shell mode</strong> (full screen, side panel, popover, mobile) and
        turn <strong className="text-foreground">motion</strong> off to check reduced motion.
      </>
    ),
  },
  {
    icon: SlidersHorizontalIcon,
    title: 'Controls',
    body: (
      <>
        Each Default story shows the component at rest, with every prop in Controls: size, variant, disabled,
        loading, invalid and open. The <strong className="text-foreground">State</strong> control previews
        hover, focus and pressed.
      </>
    ),
  },
  {
    icon: MousePointerClickIcon,
    title: 'Real interaction',
    body: 'Stories never click or focus anything on their own. Use your mouse and keyboard as you would on a page. Overlays keep their open control in sync.',
  },
  {
    icon: FlaskConicalIcon,
    title: 'Tests',
    body: 'Interaction tests sit under each story in the sidebar. Run one, or press Run tests for all of them, with accessibility checks in light and dark.',
  },
  {
    icon: PenToolIcon,
    title: 'Design',
    body: 'The Design tab on each story embeds its Figma component, so you can compare them side by side.',
  },
  {
    icon: BookOpenIcon,
    title: 'Conventions',
    body: 'Names follow the API contract. Figma states map to CSS selectors, never props. Story copy stays neutral ("Title", "Label"); realistic examples come later in a playground.',
  },
]

function UsingStorybook() {
  return (
    <Section
      id="using"
      eyebrow="Getting around"
      title="How to use this Storybook"
      description={
        <>
          Find any component in the sidebar, or press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <Tile key={tip.title} icon={tip.icon} title={tip.title}>
            {tip.body}
          </Tile>
        ))}
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
  const paths = useStorybookPaths()
  const items = catalog.flatMap((area) => area.items)
  const ready = items.filter((item) => paths?.has(item.title)).length
  const firstComponent = items.find((item) => item.title.startsWith('Components/') && paths?.has(item.title))

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-(--space-4xl) px-(--space-lg) py-(--space-2xl) md:px-(--space-2xl)">
        <Hero
          firstComponent={firstComponent ? paths?.get(firstComponent.title) : undefined}
          ready={ready}
          total={items.length}
        />
        <Audience />
        <Goals />
        <Architecture />
        <Explore paths={paths} />
        <UsingStorybook />
        <Footer />
      </div>
    </main>
  )
}
