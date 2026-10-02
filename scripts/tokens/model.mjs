// Shared token model for `pnpm tokens:build`: reads tokens/anvil.tokens.json (DTCG, pulled from
// Figma) and answers "what CSS does this token become in this mode?". Used by
// style-dictionary.config.mjs (CSS) and scripts/build-foundations.mjs (Storybook docs).
//
// Transforms (recorded in CLAUDE.md → Tokens):
// - CSS names come from each variable's Figma WEB code syntax, never from its path.
// - A reference to a token with a `var(--x)` code syntax stays `var(--x)`; a reference to a
//   literal (primitives/units → "8px") is inlined with the referencing token's own unit.
// - Numbers: px, except z-index and grid columns (unitless) and motion durations (ms).
// - Font weights "regular" / "medium" / "semibold" → 400 / 500 / 600.
// - Font families get a system fallback stack.
import fs from 'node:fs'
import path from 'node:path'

export const ROOT = path.resolve(import.meta.dirname, '../..')
export const TOKENS_FILE = path.join(ROOT, 'tokens/anvil.tokens.json')

const REF = /^\{([^}]+)\}$/
const VAR = /^var\((--[A-Za-z0-9-]+)\)$/

export function loadModel(file = TOKENS_FILE) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  const collections = json.$extensions['com.figma'].collections
  const tokens = new Map()
  const walk = (node, keys) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') || !child || typeof child !== 'object') continue
      const p = [...keys, key]
      if ('$value' in child) tokens.set(p.join('.'), { ...child, path: p, name: p.join('.') })
      else walk(child, p)
    }
  }
  walk(json, [])
  return { json, collections, tokens }
}

export const collectionOf = (token) => token.path[0]
export const figmaExt = (token) => token.$extensions?.['com.figma'] ?? {}
export const isRef = (value) => typeof value === 'string' && REF.test(value)
export const refPath = (value) => value.match(REF)[1]

/** The CSS custom property a token is declared as, from its `var(--x)` code syntax (or null). */
export function cssVarName(token) {
  const syntax = figmaExt(token).codeSyntax
  return (syntax && syntax.match(VAR)?.[1]) || null
}

/** Mode names of the token's collection; single-mode collections report their only mode. */
export function modesOf(model, token) {
  return model.collections[collectionOf(token)]?.modes ?? ['value']
}
export function defaultModeOf(model, token) {
  return model.collections[collectionOf(token)]?.defaultMode ?? 'value'
}

export function rawValue(model, token, mode) {
  const modes = figmaExt(token).modes
  if (modes && mode in modes) return modes[mode]
  return token.$value
}

function lookup(model, value, from) {
  const target = model.tokens.get(refPath(value))
  if (!target) throw new Error(`${from.name}: broken reference ${value}`)
  return target
}

// A reference into another collection uses the same mode name when that collection has it,
// otherwise its default mode (e.g. colors.dark → primitives.value).
const modeFor = (model, token, mode) => (modesOf(model, token).includes(mode) ? mode : defaultModeOf(model, token))

/** Follow references to the final Figma value (hex, number or string). */
export function resolve(model, token, mode = defaultModeOf(model, token)) {
  let current = token
  let value = rawValue(model, current, modeFor(model, current, mode))
  const seen = new Set()
  while (isRef(value)) {
    if (seen.has(value)) throw new Error(`${token.name}: circular reference ${value}`)
    seen.add(value)
    current = lookup(model, value, token)
    value = rawValue(model, current, modeFor(model, current, mode))
  }
  return value
}

export function unitOf(token) {
  const name = token.name
  if (token.$type !== 'number') return ''
  if (name.includes('.z-index.') || name.endsWith('.layout.grid.columns')) return ''
  if (name.includes('.motion.duration')) return 'ms'
  return 'px'
}

const FONT_WEIGHTS = { thin: 100, extralight: 200, light: 300, regular: 400, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 }
export function fontWeight(value) {
  if (typeof value === 'number') return value
  const weight = FONT_WEIGHTS[String(value).toLowerCase().replace(/[\s_-]/g, '')]
  if (!weight) throw new Error(`Unknown font weight "${value}"`)
  return weight
}

export function fontStack(family, kind) {
  const quoted = `"${family}"`
  return kind === 'mono'
    ? `${quoted}, ui-monospace, SFMono-Regular, Menlo, monospace`
    : `${quoted}, ui-sans-serif, system-ui, sans-serif`
}

export const px = (n) => (n === 0 ? '0' : `${n}px`)

/** Format a resolved Figma value as CSS for `token` (its type and unit decide the format). */
export function formatLiteral(token, value) {
  switch (token.$type) {
    case 'number':
      return `${value}${unitOf(token)}`
    case 'fontWeight':
      return String(fontWeight(value))
    case 'fontFamily':
      return fontStack(value, token.path.at(-1) === 'mono' ? 'mono' : 'sans')
    default:
      return String(value)
  }
}

/** The CSS value of `token` in `mode`: `var(--x)` for references to named tokens, else a literal. */
export function cssValue(model, token, mode) {
  const raw = rawValue(model, token, modeFor(model, token, mode))
  if (isRef(raw)) {
    const target = lookup(model, raw, token)
    const name = cssVarName(target)
    if (name) return `var(${name})`
    return formatLiteral(token, resolve(model, target, mode))
  }
  return formatLiteral(token, raw)
}

/** CSS for a value inside a composite (shadow color, text style field). */
export function cssRefOrLiteral(model, value, formatter) {
  if (isRef(value)) {
    const target = model.tokens.get(refPath(value))
    if (!target) throw new Error(`Broken reference ${value}`)
    const name = cssVarName(target)
    return name ? `var(${name})` : formatLiteral(target, resolve(model, target))
  }
  return formatter(value)
}

// ── Colors ────────────────────────────────────────────────────────────────────────────────

export function hexToRgba(hex) {
  const h = hex.replace('#', '')
  const n = (i) => parseInt(h.slice(i, i + 2), 16)
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 }
}

const luminance = ({ r, g, b }) => {
  const lin = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const over = (top, bottom) => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
})

/** WCAG 2 contrast ratio of `fg` on `bg` (translucent colors composited over `base`). */
export function contrast(fgHex, bgHex, baseHex = '#ffffff') {
  const base = hexToRgba(baseHex)
  const bg = over(hexToRgba(bgHex), base)
  const fg = over(hexToRgba(fgHex), bg)
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

// ── Effects and text styles ───────────────────────────────────────────────────────────────

/** CSS custom property for an effect style: shadow/* → --shadow-*, elevation/* → --shadow-elevation-*. */
export function effectVarName(token) {
  const [, group, ...rest] = token.path
  const key = rest.join('-')
  if (group === 'shadow' && key === 'inner') return '--inset-shadow-xs' // Figma: "inset-shadow-xs · …"
  if (group === 'shadow') return `--shadow-${key}`
  return `--shadow-${group}-${key}`
}

export function shadowCss(model, token) {
  return token.$value
    .map((layer) => {
      const color = cssRefOrLiteral(model, layer.color, String)
      const lengths = [layer.offsetX, layer.offsetY, layer.blur, layer.spread].map(px).join(' ')
      return `${layer.inset ? 'inset ' : ''}${lengths} ${color}`
    })
    .join(', ')
}

/** Tailwind utility for a text style: heading/6xl → type-heading-6xl. */
export const textStyleUtility = (token) => `type-${token.path.slice(1).join('-')}`
