// Rendering blocks for the generated Foundations pages (stories/foundations/*.mdx).
// Data comes from foundations.generated.ts (`pnpm tokens:build`); swatches and samples use the
// generated CSS variables and utilities, so the pages show what code actually gets.
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

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

export function RadiusScale({
  radii,
}: {
  radii: readonly { figma: string; utility: string; code: string; value: number; description: string }[]
}) {
  return (
    <ModePanels className="flex flex-wrap gap-6">
      {() =>
        radii.map((r) => (
          <div key={r.figma} className="flex w-28 flex-col gap-1">
            <div className={cn(r.utility, 'size-20 border border-border-strong bg-muted')} />
            <Code>{r.utility}</Code>
            <div className="type-text-xs-normal text-muted-foreground">
              {r.value === 9999 ? 'full' : `${r.value}px`} · {r.code}
            </div>
          </div>
        ))
      }
    </ModePanels>
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
