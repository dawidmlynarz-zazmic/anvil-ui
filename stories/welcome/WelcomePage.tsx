import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { addons } from 'storybook/preview-api'
import { NAVIGATE_URL } from 'storybook/internal/core-events'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  MailIcon,
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
import { cn } from '@/lib/utils'

import { CUSTOM_TAG, SECTIONS } from '../../.storybook/taxonomy'

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
  const [custom, setCustom] = useState<Set<string>>(new Set())
  useEffect(() => {
    let cancelled = false
    fetch('index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((index: { entries: Record<string, IndexEntry> }) => {
        const map = new Map<string, string>()
        const customTitles = new Set<string>()
        for (const entry of Object.values(index.entries)) {
          if (entry.tags?.includes(CUSTOM_TAG)) customTitles.add(entry.title)
          if (map.has(entry.title)) continue
          if (entry.type === 'docs') map.set(entry.title, `/docs/${entry.id}`)
          else if (entry.subtype !== 'test') map.set(entry.title, `/story/${entry.id}`)
        }
        // A group item (e.g. "Agent Blocks/Checkout") links to the first page inside it.
        for (const [title, path] of [...map]) {
          const parent = title.slice(0, title.lastIndexOf('/'))
          if (parent && !map.has(parent)) map.set(parent, path)
        }
        if (!cancelled) {
          setPaths(map)
          setCustom(customTitles)
        }
      })
      .catch(() => !cancelled && setPaths(new Map()))
    return () => {
      cancelled = true
    }
  }, [])
  return { paths, custom }
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

function Hero({ firstComponent }: { firstComponent?: string }) {
  return (
    <div className="grid gap-(--space-2xl) lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div className="flex flex-col gap-(--space-lg)">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" intent="neutral">
            Zazmic Design System for Agents
          </Badge>
          <Badge variant="outline" intent="neutral">
            React · shadcn/ui · Tailwind CSS
          </Badge>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="type-heading-6xl text-foreground">Anvil UI</h1>
          <p className="max-w-xl type-heading-xl text-foreground">Built to forge agents faster</p>
          <p className="max-w-xl type-text-base-normal text-muted-foreground">
            Developers get accessible React components on shadcn/ui, wired to the same tokens as Figma, so
            every conversation, tool call and answer is ready to ship. Product managers get one shared
            language for agent experiences, from the first prompt to the final result, so ideas move from
            concept to product without being rebuilt along the way.
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
  { name: 'Agent tiers', detail: 'Primitives, blocks and templates' },
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

function CatalogRow({ item, path, custom }: { item: CatalogItem; path?: string; custom?: boolean }) {
  return (
    <li className="flex min-h-8 items-center justify-between gap-2">
      {path ? (
        <StoryLink path={path} className={linkClassName}>
          {item.name}
        </StoryLink>
      ) : (
        <span className="type-text-sm-normal text-muted-foreground">{item.name}</span>
      )}
      {custom && (
        <span
          title="Anvil-only: no shadcn/ui counterpart, outside the shadcn sync"
          className="ml-auto rounded-sm bg-muted px-1 py-0.5 type-text-2xs-medium text-muted-foreground"
        >
          Anvil
        </span>
      )}
      <Status ready={Boolean(path)} />
    </li>
  )
}

// Explore groups: the sidebar's sections, Foundations first.
const exploreGroups = [
  { key: 'Foundations', label: 'Foundations', description: 'Tokens pulled from Figma.' },
  ...SECTIONS.map((section) => ({
    key: section.title,
    label: section.title,
    description: section.description,
  })),
]

function Explore({
  paths,
  custom,
  ready,
  total,
}: {
  paths: Map<string, string> | null
  custom: Set<string>
  ready: number
  total: number
}) {
  return (
    <Section
      id="explore"
      eyebrow="Explore"
      title="Everything we're building"
      description="Every area of the system, grouped like the sidebar. Ready items open their docs. Planned items follow the roadmap."
    >
      <dl className="flex flex-wrap gap-x-(--space-2xl) gap-y-3">
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
      {exploreGroups.map((group) => {
        const areas = catalog.filter((area) => area.section === group.key)
        return (
          <section
            key={group.key}
            aria-labelledby={`explore-${group.key.replace(/\W+/g, '-')}`}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <h3
                id={`explore-${group.key.replace(/\W+/g, '-')}`}
                className="type-heading-xl text-foreground"
              >
                {group.label}
              </h3>
              <p className="type-text-sm-normal text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {areas.map((area) => {
                const ready = area.items.filter((item) => paths?.has(item.title)).length
                return (
                  <div
                    key={area.id}
                    className="flex flex-col gap-3 rounded-xl bg-card p-(--space-lg) text-card-foreground inset-ring inset-ring-border"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="type-text-base-semibold">{area.name}</h4>
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
                    <ul className="flex flex-col" aria-label={`${group.label} · ${area.name}`}>
                      {area.items.map((item) => (
                        <CatalogRow
                          key={item.title}
                          item={item}
                          path={paths?.get(item.title)}
                          custom={custom.has(item.title)}
                        />
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </Section>
  )
}

const tips: { icon: LucideIcon; title: string; body: ReactNode }[] = [
  {
    icon: LayersIcon,
    title: 'Sidebar',
    body: (
      <>
        <strong className="text-foreground">Foundations</strong> (tokens), then{' '}
        <strong className="text-foreground">UI Components</strong> (shadcn/ui and Anvil-only controls, A–Z),{' '}
        <strong className="text-foreground">Agent Primitives</strong> (elements and composites),{' '}
        <strong className="text-foreground">Agent Blocks</strong> (features) and{' '}
        <strong className="text-foreground">Agent Templates</strong>. Agent sections keep the Figma section a
        component comes from (Input, Messages, Sources…). Every docs page shows how the component is built
        (Element, Composite, Feature or Template); filter by it, or by <code>anvil-custom</code>, with the
        sidebar&apos;s tag filter.
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
    body: 'Names follow the API contract. Figma states map to CSS selectors, never props. Content stays neutral ("Title", "Label") and actions say what they do ("Save", "Open dialog"); realistic examples come later in a playground.',
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

function Contributors() {
  return (
    <Section
      id="contributors"
      eyebrow="People"
      title="Contributors"
      description="The people shaping Anvil UI. Questions, ideas and feedback are welcome."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl bg-card p-(--space-lg) text-card-foreground inset-ring inset-ring-border">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>DM</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <h3 className="type-text-base-semibold">Dawid Młynarz</h3>
              <p className="type-text-sm-normal text-muted-foreground">Lead Product Designer</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="subtle" intent="neutral" size="sm">
              Founder of the idea
            </Badge>
            <Badge variant="subtle" intent="neutral" size="sm">
              Main contact
            </Badge>
            <Badge variant="subtle" intent="neutral" size="sm">
              Contributor
            </Badge>
          </div>
          <a
            className={cn(linkClassName, 'inline-flex w-fit items-center gap-1')}
            href="mailto:dawid.mlynarz@zazmic.ai"
          >
            <Icon icon={MailIcon} size="xs" />
            dawid.mlynarz@zazmic.ai
          </a>
        </div>
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
  const { paths, custom } = useStorybookPaths()
  const items = catalog.flatMap((area) => area.items)
  const ready = items.filter((item) => paths?.has(item.title)).length
  const firstComponent = items.find(
    (item) => item.title.startsWith('UI Components/') && paths?.has(item.title),
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-(--space-4xl) px-(--space-lg) py-(--space-2xl) md:px-(--space-2xl)">
        <Hero firstComponent={firstComponent ? paths?.get(firstComponent.title) : undefined} />
        <Audience />
        <Goals />
        <Architecture />
        <Explore paths={paths} custom={custom} ready={ready} total={items.length} />
        <UsingStorybook />
        <Contributors />
        <Footer />
      </div>
    </main>
  )
}
