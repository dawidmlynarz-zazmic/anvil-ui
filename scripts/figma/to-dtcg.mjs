// Anvil UI — Figma token export (step 2 of 2).
//
// Turns the parts returned by scripts/figma/export-tokens.js into tokens/anvil.tokens.json (DTCG).
//   node scripts/figma/to-dtcg.mjs <folder with part-0.json … part-N.json>
//
// - One top-level group per Figma variable collection, plus `effects` and `text-styles`.
// - `$value` is the collection's default-mode value; other modes live in
//   `$extensions["com.figma"].modes`. Aliases stay `{collection.path}` references.
// - The WEB code syntax and scopes are kept in `$extensions["com.figma"]`; `pnpm tokens:build`
//   names every CSS variable from the code syntax.
// - Numbers stay unitless (`$type: "number"`); units are applied by the build.
import fs from 'node:fs'
import path from 'node:path'

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node scripts/figma/to-dtcg.mjs <folder with part-*.json>')
  process.exit(1)
}

const parts = fs
  .readdirSync(dir)
  .filter((f) => /^part-\d+\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
const vars = parts.flatMap((p) => p.vars ?? [])
const { meta, effects = [], text = [] } = parts.find((p) => p.meta) ?? {}
if (!meta) throw new Error('No part with `meta` found; run the last export part as well.')
if (vars.length !== meta.variableCount) {
  throw new Error(`Expected ${meta.variableCount} variables, got ${vars.length}; a part is missing.`)
}

const collections = Object.fromEntries(
  meta.collections.map(([name, modes, defaultMode]) => [name, { modes, defaultMode }]),
)

const typeOf = (resolvedType, name) => {
  if (resolvedType === 'COLOR') return 'color'
  if (resolvedType === 'BOOLEAN') return 'boolean'
  if (resolvedType === 'FLOAT') return 'number'
  if (name.startsWith('font-family/')) return 'fontFamily'
  if (name.startsWith('font-weight/')) return 'fontWeight'
  return 'string'
}

// Natural sort so 2xs, xs … and 4, 8, 16 come out in a readable order.
const naturalKey = (s) => s.replace(/\d+/g, (n) => n.padStart(6, '0'))
const byPath = (a, b) => naturalKey(a[0] + '/' + a[1]).localeCompare(naturalKey(b[0] + '/' + b[1]))

const setPath = (root, keys, token) => {
  let node = root
  for (const key of keys.slice(0, -1)) {
    node[key] ??= {}
    if ('$value' in node[key]) throw new Error(`Token and group collide at ${keys.join('.')}`)
    node = node[key]
  }
  node[keys.at(-1)] = token
}

const tokens = {
  $description:
    'Anvil UI design tokens. Pulled from Figma by scripts/figma/export-tokens.js; never edit by hand.',
  $extensions: {
    'com.figma': {
      fileKey: meta.fileKey,
      exportedAt: meta.exportedAt,
      collections,
    },
  },
}

for (const [collection, name, resolvedType, codeSyntax, scopes, description, modes] of [...vars].sort(
  byPath,
)) {
  const { defaultMode, modes: modeNames } = collections[collection]
  const figma = { codeSyntax, scopes: scopes ? scopes.split(',') : [] }
  if (modeNames.length > 1) figma.modes = modes
  const token = { $type: typeOf(resolvedType, name), $value: modes[defaultMode] }
  if (description) token.$description = description
  token.$extensions = { 'com.figma': figma }
  setPath(tokens, [collection, ...name.split('/')], token)
}

// Figma lists effects bottom → top; CSS box-shadow lists top → bottom.
tokens.effects = {}
for (const [name, description, layers] of effects) {
  const token = {
    $type: 'shadow',
    $value: layers
      .map(([color, offsetX, offsetY, blur, spread, inset]) => ({
        color,
        offsetX,
        offsetY,
        blur,
        spread,
        inset,
      }))
      .reverse(),
  }
  if (description) token.$description = description
  setPath(tokens.effects, name.split('/'), token)
}

tokens['text-styles'] = {}
for (const [
  name,
  description,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  fontStyle,
  textDecoration,
  textCase,
] of text) {
  const token = {
    $type: 'typography',
    $value: { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing },
  }
  if (description) token.$description = description
  token.$extensions = { 'com.figma': { fontStyle, textDecoration, textCase } }
  setPath(tokens['text-styles'], name.split('/'), token)
}

const out = path.resolve(import.meta.dirname, '../../tokens/anvil.tokens.json')
fs.writeFileSync(out, JSON.stringify(tokens, null, 2) + '\n')
console.log(
  `Wrote ${path.relative(process.cwd(), out)}: ${vars.length} variables, ${effects.length} effect styles, ${text.length} text styles.`,
)
