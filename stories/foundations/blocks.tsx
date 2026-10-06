// Rendering blocks for the generated Foundations pages (stories/foundations/*.mdx).
// Data comes from foundations.generated.ts (`pnpm tokens:build`); swatches and samples use the
// generated CSS variables and utilities, so the pages show what code actually gets.
import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type ModeValue = { hex: string; ref: string | null }
type ColorToken = { figma: string; cssVar: string; description: string; light: ModeValue; dark: ModeValue }

const Th = ({ children }: { children?: ReactNode }) => (
  <th className="border-b border-border px-3 py-2 text-left type-text-xs-semibold text-muted-foreground">
    {children}
  </th>
)
const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn('border-b border-border px-3 py-2 align-top type-text-sm-normal', className)}>
    {children}
  </td>
)
const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded-sm bg-muted px-1 type-code-xs text-foreground">{children}</code>
)

/** Light and dark panels side by side; each re-declares the color tokens via .light / .dark. */
function ModePanels({
  children,
  className,
}: {
  children: (mode: 'light' | 'dark') => ReactNode
  className?: string
}) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
      {(['light', 'dark'] as const).map((mode) => (
        <div key={mode} className={cn(mode, 'bg-background p-4 text-foreground', className)}>
          <div className="mb-3 type-text-xs-medium text-muted-foreground">
            {mode === 'light' ? 'Light' : 'Dark'}
          </div>
          {children(mode)}
        </div>
      ))}
    </div>
  )
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="sb-unstyled overflow-x-auto rounded-lg border border-border bg-background text-foreground">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {head.map((h) => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

const swatch = (cssVar: string) => ({ background: `var(${cssVar})` })

export function ColorGroups({
  groups,
}: {
  groups: readonly { title: string; tokens: readonly ColorToken[] }[]
}) {
  return (
    <div className="sb-unstyled flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-2">
          <h3 className="type-heading-xl text-foreground">{group.title}</h3>
          <Table head={['Light', 'Dark', 'Token', 'Light value', 'Dark value', 'Usage']}>
            {group.tokens.map((t) => (
              <tr key={t.figma}>
                {(['light', 'dark'] as const).map((mode) => (
                  <Td key={mode} className={cn(mode, 'w-16 bg-background')}>
                    <div
                      className="size-10 rounded-md border border-border-alpha-8"
                      style={swatch(t.cssVar)}
                    />
                  </Td>
                ))}
                <Td>
                  <div className="type-text-sm-medium">{t.figma}</div>
                  <Code>{t.cssVar}</Code>
                </Td>
                {(['light', 'dark'] as const).map((mode) => (
                  <Td key={mode}>
                    <Code>{t[mode].hex}</Code>
                    {t[mode].ref && (
                      <div className="type-text-xs-normal text-muted-foreground">{t[mode].ref}</div>
                    )}
                  </Td>
                ))}
                <Td className="text-muted-foreground">{t.description}</Td>
              </tr>
            ))}
          </Table>
        </section>
      ))}
    </div>
  )
}

const threshold = (kind: string) => (kind === 'non-text' ? 3 : kind === 'disabled' ? 0 : 4.5)

export function ContrastTable({
  pairs,
}: {
  pairs: readonly { fg: string; bg: string; kind: string; light: number; dark: number }[]
}) {
  return (
    <Table head={['Sample', 'Foreground on background', 'Light', 'Dark', 'Needs']}>
      {pairs.map((p) => (
        <tr key={p.fg + p.bg}>
          <Td>
            <div className="flex gap-1">
              {(['light', 'dark'] as const).map((mode) => (
                <div
                  key={mode}
                  className={cn(mode, 'rounded-sm px-2 py-1 type-text-sm-semibold')}
                  style={{ background: `var(${p.bg})`, color: `var(${p.fg})` }}
                >
                  Aa
                </div>
              ))}
            </div>
          </Td>
          <Td>
            <Code>{p.fg}</Code> on <Code>{p.bg}</Code>
          </Td>
          {(['light', 'dark'] as const).map((mode) => {
            const pass = p[mode] >= threshold(p.kind)
            return (
              <Td key={mode} className={pass ? undefined : 'text-destructive type-text-sm-semibold'}>
                {p[mode].toFixed(2)}:1 {pass ? '' : '✕'}
              </Td>
            )
          })}
          <Td className="text-muted-foreground">
            {p.kind === 'disabled' ? 'exempt' : `${threshold(p.kind)}:1 (${p.kind})`}
          </Td>
        </tr>
      ))}
    </Table>
  )
}

export function Palettes({
  palettes,
}: {
  palettes: readonly { family: string; swatches: readonly { name: string; cssVar: string; hex: string }[] }[]
}) {
  return (
    <div className="sb-unstyled flex flex-col gap-4">
      {palettes.map((p) => (
        <div key={p.family}>
          <div className="mb-1 type-text-sm-semibold text-foreground">{p.family}</div>
          <div className="flex flex-wrap gap-2">
            {p.swatches.map((s) => (
              <div key={s.cssVar} className="w-20">
                <div className="h-10 rounded-md border border-border" style={swatch(s.cssVar)} />
                <div className="type-text-2xs-medium text-foreground">{s.name}</div>
                <div className="type-code-xs text-muted-foreground">{s.hex}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function FontFamilies({
  families,
}: {
  families: readonly { figma: string; cssVar: string; utility: string; family: string; description: string }[]
}) {
  return (
    <Table head={['Sample', 'Token', 'Utility', 'Usage']}>
      {families.map((f) => (
        <tr key={f.figma}>
          <Td className={cn(f.utility, 'text-2xl')}>{f.family}</Td>
          <Td>
            <div className="type-text-sm-medium">{f.figma}</div>
            <Code>{f.cssVar}</Code>
          </Td>
          <Td>
            <Code>{f.utility}</Code>
          </Td>
          <Td className="text-muted-foreground">{f.description}</Td>
        </tr>
      ))}
    </Table>
  )
}

type Responsive = number | { desktop: number; mobile: number }
const responsive = (v: Responsive, unit = 'px') =>
  typeof v === 'number'
    ? `${v}${unit}`
    : v.desktop === v.mobile
      ? `${v.desktop}${unit}`
      : `${v.desktop} / ${v.mobile}${unit}`

export function TextStyles({
  styles,
}: {
  styles: readonly {
    figma: string
    utility: string
    description: string
    size: Responsive
    lineHeight: Responsive
    weight: number
    tracking: Responsive
  }[]
}) {
  return (
    <Table head={['Sample', 'Style', 'Size / line height', 'Weight', 'Tracking']}>
      {styles.map((s) => (
        <tr key={s.figma}>
          <Td className="max-w-md">
            <div className={cn(s.utility, 'text-foreground')}>Title</div>
          </Td>
          <Td>
            <div className="type-text-sm-medium">{s.figma}</div>
            <Code>{s.utility}</Code>
          </Td>
          <Td>
            {responsive(s.size)} · {responsive(s.lineHeight)}
          </Td>
          <Td>{s.weight}</Td>
          <Td>{responsive(s.tracking)}</Td>
        </tr>
      ))}
    </Table>
  )
}

export function SpacingScale({
  steps,
}: {
  steps: readonly {
    figma: string
    code: string
    utility: string
    responsive: boolean
    desktop: number
    mobile: number
    description: string
  }[]
}) {
  return (
    <Table head={['Step', 'Desktop', 'Mobile', 'Code', 'Use']}>
      {steps.map((s) => (
        <tr key={s.figma}>
          <Td className="type-text-sm-medium">{s.figma}</Td>
          {(['desktop', 'mobile'] as const).map((mode) => (
            <Td key={mode}>
              <div className="flex items-center gap-2">
                <div className="h-3 rounded-sm bg-primary" style={{ width: s[mode] }} />
                <span
                  className={s.responsive && s.desktop !== s.mobile ? 'type-text-sm-semibold' : undefined}
                >
                  {s[mode]}px
                </span>
              </div>
            </Td>
          ))}
          <Td>
            <Code>{s.code}</Code>
          </Td>
          <Td>
            <Code>{s.utility}</Code>
          </Td>
        </tr>
      ))}
    </Table>
  )
}

export function ShellTable({
  rows,
}: {
  rows: readonly ({ figma: string; cssVar: string } & Record<string, string | number>)[]
}) {
  const modes = ['full screen', 'side panel', 'popover', 'mobile']
  return (
    <Table head={['Token', ...modes]}>
      {rows.map((r) => (
        <tr key={r.figma}>
          <Td>
            <Code>{r.cssVar}</Code>
          </Td>
          {modes.map((m) => (
            <Td key={m}>{r[m]}px</Td>
          ))}
        </tr>
      ))}
    </Table>
  )
}

/** Where each radius step is used in Anvil (from the components' code). */
const RADIUS_USE: Record<string, string> = {
  'radius/none': 'Edge-to-edge surfaces: table cells, side sheets, full-bleed media',
  'radius/2xs': 'Tiny marks: the streaming caret, waveform bars',
  'radius/sm': 'Badge, Kbd, Checkbox, xs buttons, inline code',
  'radius/md': 'Button, Input, Select, Textarea, Toggle, Card, menu items',
  'radius/base': 'The base step every other one derives from',
  'radius/lg': 'Alert, Popover, menus, Calendar, large buttons, Tool Call Accordion',
  'radius/xl': 'Dialog, Alert Dialog, agent cards (Approval, Rating, Survey, Poll)',
  'radius/2xl': 'Prompt Input, Drawer (top corners), Message Bubble, Drop Overlay',
  'radius/full': 'Pills and circles: Avatar, Chip and Quick Reply, pill Badge, Switch',
}

export function RadiusScale({
  radii,
}: {
  radii: readonly {
    figma: string
    utility: string
    code: string
    value: number
    mobile: number
    description: string
  }[]
}) {
  const label = (v: number) => (v >= 9999 ? 'full' : `${v}px`)
  // Show desktop and mobile only when a step changes between them.
  const responsive = radii.some((r) => r.mobile !== r.value)
  return (
    <Table head={['Step', 'Preview', ...(responsive ? ['Desktop', 'Mobile'] : ['Value']), 'Code', 'Use']}>
      {radii.map((r) => (
        <tr key={r.figma}>
          <Td className="type-text-sm-medium">{r.figma.replace('radius/', '')}</Td>
          <Td>
            <div
              className="size-14 border-2 border-primary bg-info-subtle"
              style={{ borderRadius: r.value >= 9999 ? 9999 : r.value }}
              aria-hidden
            />
          </Td>
          <Td>{label(r.value)}</Td>
          {responsive && (
            <Td className={r.mobile !== r.value ? 'type-text-sm-semibold' : undefined}>{label(r.mobile)}</Td>
          )}
          <Td>
            <div className="flex flex-col items-start gap-1">
              <Code>{r.utility}</Code>
              <span className="type-code-xs text-muted-foreground">{r.code}</span>
            </div>
          </Td>
          <Td className="text-muted-foreground">{RADIUS_USE[r.figma] ?? ''}</Td>
        </tr>
      ))}
    </Table>
  )
}

/** Outer radius − padding = inner radius: an xl (12px) surface with 6px padding holds md (6px) content. */
export function RadiusNesting() {
  const cases = [
    { outer: 'rounded-xl', outerPx: 12, pad: 'p-1.5', padPx: 6, inner: 'rounded-md', innerPx: 6, ok: true },
    { outer: 'rounded-xl', outerPx: 12, pad: 'p-1.5', padPx: 6, inner: 'rounded-xl', innerPx: 12, ok: false },
  ]
  return (
    <div className="sb-unstyled flex flex-wrap gap-6">
      {cases.map((c) => (
        <figure key={c.inner} className="flex flex-col gap-2">
          <div className={cn(c.outer, c.pad, 'w-56 border border-border bg-muted')}>
            <div className={cn(c.inner, 'h-16 border border-primary bg-background')} />
          </div>
          <figcaption className="type-text-xs-normal text-muted-foreground">
            <span
              className={
                c.ok
                  ? 'text-success-strong dark:text-success-medium'
                  : 'text-danger-strong dark:text-danger-medium'
              }
            >
              {c.ok ? 'Do' : 'Don’t'}
            </span>{' '}
            · outer {c.outerPx}px − padding {c.padPx}px = inner{' '}
            {c.ok ? `${c.innerPx}px` : `${c.outerPx - c.padPx}px, not ${c.innerPx}px`}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export function Effects({
  effects,
}: {
  effects: readonly { figma: string; utility: string; css: string; description: string }[]
}) {
  return (
    <div className="sb-unstyled flex flex-col gap-4">
      <ModePanels>
        {() => (
          <div className="flex flex-wrap gap-6 p-2">
            {effects.map((e) => (
              <div key={e.figma} className="flex w-40 flex-col gap-2">
                <div className={cn(e.utility, 'h-20 rounded-lg border border-border bg-card')} />
                <Code>{e.utility}</Code>
              </div>
            ))}
          </div>
        )}
      </ModePanels>
      <Table head={['Style', 'Utility', 'CSS', 'Usage']}>
        {effects.map((e) => (
          <tr key={e.figma}>
            <Td className="type-text-sm-medium">{e.figma}</Td>
            <Td>
              <Code>{e.utility}</Code>
            </Td>
            <Td>
              <Code>{e.css}</Code>
            </Td>
            <Td className="text-muted-foreground">{e.description}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

// ── Motion ────────────────────────────────────────────────────────────────────────────────

type MotionToken = { figma: string; code: string; value: number | string }

const MOTION_USE: Record<string, string> = {
  'motion/duration-fast':
    'Hover, pressed and colour changes; chevrons; switch thumbs; tooltips; exits of small overlays and of expand / collapse',
  'motion/duration-base':
    'Small overlays and dialogs opening; expand / collapse opening; Sheet and Drawer closing',
  'motion/duration-slow': 'Large surfaces opening (Sheet, Drawer); the Sidebar width',
  'motion/ease-out': 'Everything that enters or responds to the user: fast start, soft landing',
  'motion/ease-in-out': 'Exits and state changes: things leave without a jolt',
}

const cssVarOf = (code: string) => code.replace(/^var\((--[\w-]+)\)$/, '$1')
const isDuration = (t: MotionToken) => t.figma.startsWith('motion/duration')

/** A dot that travels a 160px track, in one direction per toggle. */
function MotionTrack({ on, duration, easing }: { on: boolean; duration: string; easing: string }) {
  return (
    <div className="relative h-8 w-48 shrink-0 rounded-full bg-muted" aria-hidden>
      <div
        className={cn(
          'absolute top-1 left-1 size-6 rounded-full bg-primary transition-[translate]',
          on && 'translate-x-40',
        )}
        style={{ transitionDuration: `var(${duration})`, transitionTimingFunction: `var(${easing})` }}
      />
    </div>
  )
}

function PlayButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div className="mb-3">
      <Button size="sm" variant="outline" intent="neutral" onClick={onToggle}>
        {on ? 'Play back' : 'Play'}
      </Button>
    </div>
  )
}

export function MotionDurations({ tokens }: { tokens: readonly MotionToken[] }) {
  const [on, setOn] = useState(false)
  const durations = [...tokens.filter(isDuration)].sort((a, b) => Number(a.value) - Number(b.value))
  return (
    <>
      <PlayButton on={on} onToggle={() => setOn(!on)} />
      <Table head={['Token', 'Value', 'Code', 'Preview (ease-out)', 'Use']}>
        {durations.map((t) => (
          <tr key={t.figma}>
            <Td className="type-text-sm-medium whitespace-nowrap">{t.figma.replace('motion/', '')}</Td>
            <Td className="whitespace-nowrap">{t.value}ms</Td>
            <Td className="whitespace-nowrap">
              <Code>{`duration-(${cssVarOf(t.code)})`}</Code>
            </Td>
            <Td>
              <MotionTrack on={on} duration={cssVarOf(t.code)} easing="--ease-out" />
            </Td>
            <Td className="text-muted-foreground">{MOTION_USE[t.figma] ?? ''}</Td>
          </tr>
        ))}
      </Table>
    </>
  )
}

/** The cubic-bezier as a curve: time across, progress up. */
function EasingCurve({ value }: { value: string }) {
  const [x1, y1, x2, y2] = (value.match(/-?[\d.]+/g) ?? []).map(Number)
  const p = (x: number, y: number) => `${x * 56 + 4} ${60 - y * 56}`
  return (
    <svg viewBox="0 0 64 64" className="size-16 shrink-0 rounded-md bg-muted" aria-hidden>
      <path d={`M${p(0, 0)} L${p(1, 1)}`} className="stroke-border" strokeDasharray="2 2" fill="none" />
      <path
        d={`M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`}
        className="stroke-primary"
        strokeWidth={2}
        fill="none"
      />
    </svg>
  )
}

export function MotionEasings({ tokens }: { tokens: readonly MotionToken[] }) {
  const [on, setOn] = useState(false)
  return (
    <>
      <PlayButton on={on} onToggle={() => setOn(!on)} />
      <Table head={['Token', 'Curve', 'Code', 'Preview (slow)', 'Use']}>
        {tokens
          .filter((t) => !isDuration(t))
          // ease-out (enter) before ease-in-out (exit)
          .sort((a, b) => Number(b.figma.endsWith('ease-out')) - Number(a.figma.endsWith('ease-out')))
          .map((t) => (
            <tr key={t.figma}>
              <Td className="type-text-sm-medium whitespace-nowrap">{t.figma.replace('motion/', '')}</Td>
              <Td>
                <EasingCurve value={String(t.value)} />
              </Td>
              <Td>
                <div className="flex flex-col items-start gap-1">
                  <span className="whitespace-nowrap">
                    <Code>{cssVarOf(t.code).slice(2)}</Code>
                  </span>
                  <span className="type-code-xs text-muted-foreground">{t.value}</span>
                </div>
              </Td>
              <Td>
                <MotionTrack on={on} duration="--duration-slow" easing={cssVarOf(t.code)} />
              </Td>
              <Td className="text-muted-foreground">{MOTION_USE[t.figma] ?? ''}</Td>
            </tr>
          ))}
      </Table>
    </>
  )
}

const demoTrigger = (label: string) => (
  <Button size="sm" variant="outline" intent="neutral">
    {label}
  </Button>
)

const ARCHETYPES: {
  name: string
  usedBy: string
  enter: string
  exit: string
  helper: string
  demo: ReactNode
}[] = [
  {
    name: 'Small overlay',
    usedBy: 'Popover, menus, Select, Combobox, Hover Card, Date Picker',
    enter: 'Fade, scale from 95% and a 4px nudge from its side · base · ease-out',
    exit: 'Fade and scale to 95% · fast · ease-in-out',
    helper: 'overlayMotion + overlayNudge',
    demo: (
      <Popover>
        <PopoverTrigger asChild>{demoTrigger('Open popover')}</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverDescription>Description</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    name: 'Tooltip',
    usedBy: 'Tooltip',
    enter: 'Fade and scale from 95% · fast · ease-out',
    exit: 'Fade · fast · ease-in-out',
    helper: 'tooltipMotion + overlayNudge',
    demo: (
      <Tooltip>
        <TooltipTrigger asChild>{demoTrigger('Hover or focus')}</TooltipTrigger>
        <TooltipContent>Label</TooltipContent>
      </Tooltip>
    ),
  },
  {
    name: 'Modal',
    usedBy: 'Dialog, Alert Dialog, Command; every scrim',
    enter: 'Scrim fades; panel fades and scales from 95% · base · ease-out',
    exit: 'Reverse · fast · ease-in-out',
    helper: 'modalMotion',
    demo: (
      <Dialog>
        <DialogTrigger asChild>{demoTrigger('Open dialog')}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <DialogBody className="type-text-sm-normal text-muted-foreground">Content</DialogBody>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: 'Edge panel',
    usedBy: 'Sheet, Drawer',
    enter: 'Slides from its edge, scrim fades · slow · ease-out',
    exit: 'Slides back · base · ease-in-out',
    helper: 'panelMotion',
    demo: (
      <Sheet>
        <SheetTrigger asChild>{demoTrigger('Open sheet')}</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  },
  {
    name: 'Expand / collapse',
    usedBy: 'Accordion; Collapsible in Thinking Panel, Tool Calls, Instructions Banner, Rating',
    enter: 'Height to content · base · ease-out; chevron turns · fast',
    exit: 'Height to 0 · fast · ease-in-out',
    helper: 'accordionMotion / expandMotion + chevronMotion',
    demo: (
      <Accordion type="single" collapsible className="w-56">
        <AccordionItem value="demo">
          <AccordionTrigger>Title</AccordionTrigger>
          <AccordionContent>Content that opens and closes.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
]

/** One row per kind of movement, each with a live example built from the real component. */
export function MotionArchetypes() {
  return (
    // MDX pages skip the preview decorators, so the Tooltip example brings its own provider.
    <TooltipProvider>
      <Table head={['Kind', 'Enter', 'Exit', 'Helper', 'Example']}>
        {ARCHETYPES.map((a) => (
          <tr key={a.name}>
            <Td>
              <div className="type-text-sm-medium">{a.name}</div>
              <div className="type-text-xs-normal text-muted-foreground">{a.usedBy}</div>
            </Td>
            <Td className="text-muted-foreground">{a.enter}</Td>
            <Td className="text-muted-foreground">{a.exit}</Td>
            <Td>
              <Code>{a.helper}</Code>
            </Td>
            <Td>{a.demo}</Td>
          </tr>
        ))}
      </Table>
    </TooltipProvider>
  )
}
