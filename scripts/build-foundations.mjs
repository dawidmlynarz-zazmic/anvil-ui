// pnpm tokens:build (step 2) — writes the Storybook Foundations pages from tokens/anvil.tokens.json:
//   stories/foundations/foundations.generated.ts   data (resolved values, contrast ratios)
//   stories/foundations/{Colors,Typography,Spacing,Radius,Elevation}.mdx
// Generated files; rendered by the hand-written blocks in stories/foundations/blocks.tsx.
import fs from 'node:fs'
import path from 'node:path'

import {
  ROOT,
  collectionOf,
  contrast,
  cssVarName,
  effectVarName,
  figmaExt,
  fontWeight,
  isRef,
  loadModel,
  modesOf,
  refPath,
  resolve,
  shadowCss,
  textStyleUtility,
} from './tokens/model.mjs'

const model = loadModel()
const OUT = path.join(ROOT, 'stories/foundations')
const all = [...model.tokens.values()]
const figmaName = (t) => t.path.slice(1).join('/')
const refName = (value) => (isRef(value) ? refPath(value).split('.').slice(1).join('/') : null)
const rawRef = (t, mode) => refName(figmaExt(t).modes?.[mode] ?? t.$value)

// ── Colors ────────────────────────────────────────────────────────────────────────────────
const colorTokens = all.filter((t) => collectionOf(t) === 'colors')
const hexOf = (name, mode) => {
  const t = colorTokens.find((c) => cssVarName(c) === name)
  return t ? resolve(model, t, mode) : null
}

const groupKey = (t) => (t.path[1] === 'status' ? `status/${t.path[2]}` : t.path[1])
const GROUP_TITLES = {
  background: 'Background',
  foreground: 'Foreground',
  surface: 'Surfaces',
  border: 'Border',
  primary: 'Primary',
  secondary: 'Secondary',
  destructive: 'Destructive',
  button: 'Button',
  'status/info': 'Status · info',
  'status/success': 'Status · success',
  'status/warning': 'Status · warning',
  'status/danger': 'Status · danger',
  agent: 'Agent',
  chart: 'Chart',
  overlay: 'Overlay',
  gradient: 'Gradient',
  shadow: 'Shadow colors',
}
const colorGroups = Object.entries(Object.groupBy(colorTokens, groupKey))
  .sort(([a], [b]) => Object.keys(GROUP_TITLES).indexOf(a) - Object.keys(GROUP_TITLES).indexOf(b))
  .map(([key, tokens]) => ({
    title: GROUP_TITLES[key] ?? key,
    tokens: tokens.map((t) => ({
      figma: figmaName(t),
      cssVar: cssVarName(t),
      description: t.$description ?? '',
      light: { hex: resolve(model, t, 'light'), ref: rawRef(t, 'light') },
      dark: { hex: resolve(model, t, 'dark'), ref: rawRef(t, 'dark') },
    })),
  }))

// Contrast pairs: X-foreground on X, text on --background, strong on subtle, ring on background.
const names = new Set(colorTokens.map(cssVarName))
const pairs = []
for (const name of names) {
  if (name.endsWith('-foreground') && names.has(name.replace(/-foreground$/, ''))) {
    pairs.push({ fg: name, bg: name.replace(/-foreground$/, ''), kind: 'text' })
  }
  if (name.endsWith('-strong') && names.has(name.replace(/-strong$/, '-subtle'))) {
    pairs.push({ fg: name, bg: name.replace(/-strong$/, '-subtle'), kind: 'text' })
  }
}
for (const fg of ['--foreground', '--muted-foreground', '--foreground-subtle', '--foreground-link']) {
  pairs.push({ fg, bg: '--background', kind: 'text' })
}
pairs.push({ fg: '--foreground-inverse', bg: '--background-inverse', kind: 'text' })
pairs.push({ fg: '--foreground-disabled', bg: '--background', kind: 'disabled' })
pairs.push({ fg: '--ring', bg: '--background', kind: 'non-text' })
const contrastPairs = pairs.map((p) => ({
  ...p,
  light: +contrast(hexOf(p.fg, 'light'), hexOf(p.bg, 'light'), hexOf('--background', 'light')).toFixed(2),
  dark: +contrast(hexOf(p.fg, 'dark'), hexOf(p.bg, 'dark'), hexOf('--background', 'dark')).toFixed(2),
}))

const primitivePalettes = Object.entries(
  Object.groupBy(
    all.filter((t) => collectionOf(t) === 'primitives' && t.$type === 'color'),
    (t) => t.path[2],
  ),
).map(([family, tokens]) => ({
  family,
  swatches: tokens.map((t) => ({ name: t.path.slice(3).join('/'), cssVar: cssVarName(t), hex: t.$value })),
}))

// ── Typography ────────────────────────────────────────────────────────────────────────────
const typo = (key) => model.tokens.get(`typography.${key}`)
const both = (t) => Object.fromEntries(modesOf(model, t).map((m) => [m, resolve(model, t, m)]))
const fieldValue = (value, kind) => {
  if (!isRef(value))
    return kind === 'weight' ? fontWeight(value) : typeof value === 'object' ? value.value : value
  const t = model.tokens.get(refPath(value))
  const resolved = both(t)
  return kind === 'weight' ? fontWeight(resolved.desktop) : resolved
}
const textStyles = all
  .filter((t) => collectionOf(t) === 'text-styles')
  .map((t) => ({
    figma: figmaName(t),
    utility: textStyleUtility(t),
    description: t.$description ?? '',
    family: fieldValue(t.$value.fontFamily).desktop ?? t.$value.fontFamily,
    size: fieldValue(t.$value.fontSize),
    lineHeight: fieldValue(t.$value.lineHeight),
    weight: fieldValue(t.$value.fontWeight, 'weight'),
    tracking: fieldValue(t.$value.letterSpacing),
    underline: figmaExt(t).textDecoration === 'UNDERLINE',
  }))
const fontFamilies = ['heading', 'sans', 'mono'].map((k) => {
  const t = typo(`font-family.${k}`)
  return {
    figma: figmaName(t),
    cssVar: cssVarName(t),
    utility: `font-${k}`,
    family: t.$value,
    description: t.$description ?? '',
  }
})

// ── Spacing, radius, elevation ────────────────────────────────────────────────────────────
const dims = all.filter((t) => collectionOf(t) === 'dimensions')
const spacing = dims
  .filter((t) => t.path[1] === 'spacing')
  .map((t) => {
    const syntax = figmaExt(t).codeSyntax
    const step = syntax.match(/var\(--spacing\) \* ([\d.]+)/)?.[1]
    return {
      figma: figmaName(t),
      code: cssVarName(t) ? `var(${cssVarName(t)})` : syntax,
      utility: step ? `p-${step} · gap-${step}` : `p-(${cssVarName(t)})`,
      responsive: !!cssVarName(t),
      ...both(t),
      description: t.$description ?? '',
    }
  })
  .sort((a, b) => a.desktop - b.desktop)
const radii = dims
  .filter((t) => t.path[1] === 'radius')
  .map((t) => ({
    figma: figmaName(t),
    utility: `rounded-${t.path[2]}`,
    code: figmaExt(t).codeSyntax,
    value: resolve(model, t, 'desktop'),
    mobile: resolve(model, t, 'mobile'),
    description: t.$description ?? '',
  }))
  .sort((a, b) => a.value - b.value)
const effects = all
  .filter((t) => collectionOf(t) === 'effects')
  .map((t) => {
    const cssVar = effectVarName(t)
    return {
      figma: figmaName(t),
      utility: t.path[1] === 'focus' ? 'focus-ring' : cssVar.slice(2),
      css: shadowCss(model, t),
      description: t.$description ?? '',
    }
  })
const shell = all
  .filter((t) => collectionOf(t) === 'shell')
  .map((t) => ({ figma: figmaName(t), cssVar: cssVarName(t), ...both(t) }))

// ── Write ─────────────────────────────────────────────────────────────────────────────────
const banner =
  'Generated by `pnpm tokens:build` from tokens/anvil.tokens.json (pulled from Figma). Do not edit.'
const data = {
  exportedAt: model.json.$extensions['com.figma'].exportedAt,
  colorGroups,
  contrastPairs,
  primitivePalettes,
  textStyles,
  fontFamilies,
  spacing,
  radii,
  effects,
  shell,
}
const ts = `// ${banner}\n${Object.entries(data)
  .map(([k, v]) => `export const ${k} = ${JSON.stringify(v, null, 2)} as const\n`)
  .join('\n')}`
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'foundations.generated.ts'), ts)

const figmaLink = (node) =>
  `https://www.figma.com/design/2170cRKZD9nhz325op4rL1/?node-id=${node.replace(':', '-')}`
const page = (title, node, intro, body) => `{/* ${banner} */}
import { Meta } from '@storybook/addon-docs/blocks'
import * as Blocks from './blocks'
import * as data from './foundations.generated'

<Meta title="Foundations/${title}" />

# ${title}

${intro}

Source: [Figma · ${title}](${figmaLink(node)}) · exported ${data.exportedAt.slice(0, 10)}.

${body}
`
const pages = {
  Colors: page(
    'Colors',
    '8272:455',
    'Semantic colors from the Figma `colors` collection (light and dark modes). Each swatch is drawn live from the generated CSS variable inside a `.light` and a `.dark` panel; hex values and references come from Figma. Use the utility (`bg-*`, `text-*`, `border-*`), never the primitive.',
    `## Contrast\n\nWCAG 2 ratios in both modes. Text needs 4.5:1, focus rings and other non-text UI need 3:1; disabled text is exempt.\n\n<Blocks.ContrastTable pairs={data.contrastPairs} />\n\n## Semantic colors\n\n<Blocks.ColorGroups groups={data.colorGroups} />\n\n## Primitives\n\nThe palette the semantic colors point to. Components never use these directly.\n\n<Blocks.Palettes palettes={data.primitivePalettes} />`,
  ),
  Typography: page(
    'Typography',
    '8207:6875',
    'Figma text styles become `type-*` utilities; each one binds the font, size, line height, weight and tracking variables. Sizes marked with two values change below 768px (mobile mode).',
    `## Font families\n\n<Blocks.FontFamilies families={data.fontFamilies} />\n\n## Text styles\n\n<Blocks.TextStyles styles={data.textStyles} />`,
  ),
  Spacing: page(
    'Spacing',
    '8272:456',
    'Fixed steps are Tailwind spacing (`calc(var(--spacing) * n)`, 4px base). Steps lg–4xl are mode-dependent and exported as `--space-*` with a mobile override; use them with arbitrary values, e.g. `p-(--space-lg)`.',
    `<Blocks.SpacingScale steps={data.spacing} />\n\n## Shell\n\nShell tokens per \`data-shell\` mode (toolbar: Shell).\n\n<Blocks.ShellTable rows={data.shell} />`,
  ),
  Radius: page(
    'Radius',
    '8272:456',
    'One base, `--radius` (8px): every step is `calc(var(--radius) ± n)`, so changing the base rounds or squares the whole system at once. Use the step a component already uses; nest rounder surfaces outside squarer ones (a card at xl holds buttons at md). `rounded-full` is `calc(infinity * 1px)` for pills and circles.',
    `<Blocks.RadiusScale radii={data.radii} />\n\n## Nesting\n\nAn inner element’s radius is the outer radius minus the padding between them, so curves stay parallel.\n\n<Blocks.RadiusNesting />`,
  ),
  Elevation: page(
    'Elevation',
    '8369:2258',
    'Shadow, elevation and focus effect styles from Figma. Floating surfaces use `shadow-elevation-raised`, modal surfaces `shadow-elevation-modal`; Card stays flat (border only). Shadow colors are mode-aware.',
    `<Blocks.Effects effects={data.effects} />`,
  ),
}
for (const [name, mdx] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, `${name}.mdx`), mdx)
console.log(
  `✔︎ stories/foundations: ${Object.keys(pages).length} pages, ${contrastPairs.length} contrast pairs`,
)
