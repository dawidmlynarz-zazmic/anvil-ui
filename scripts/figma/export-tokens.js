// Anvil UI — Figma token export (step 1 of 2).
//
// Read-only Figma Plugin API script; it never writes to the Figma file. Run it through the Figma
// MCP `use_figma` tool on file 2170cRKZD9nhz325op4rL1. `use_figma` truncates results at 20 KB, so
// the export is returned in parts: run it once per PART (0 … PARTS - 1), save each result as
// JSON to one folder (part-0.json, part-1.json, …), then run step 2:
//
//   node scripts/figma/to-dtcg.mjs <folder>   → tokens/anvil.tokens.json
//
// Compact row formats (expanded to DTCG by to-dtcg.mjs):
//   vars:    [collection, name, resolvedType, codeSyntaxWEB, scopes, description, { mode: value }]
//   effects: [name, description, [[color, offsetX, offsetY, blur, spread, inset], …]]  (Figma order)
//   text:    [name, description, family, weight, size, lineHeight, letterSpacing, fontStyle,
//             textDecoration, textCase]
// Colors are hex; aliases are "{collection.path.to.token}" references.

const PART = 0
const PARTS = 5 // parts 0-3: variables, part 4: meta + effect and text styles

const toHex = (c) => {
  const h = (n) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a === undefined || c.a >= 1 ? '' : h(c.a)}`
}

const collections = await figma.variables.getLocalVariableCollectionsAsync()
const collectionById = Object.fromEntries(collections.map((c) => [c.id, c]))
const variables = (await figma.variables.getLocalVariablesAsync())
  .filter((v) => collectionById[v.variableCollectionId])
  .sort((a, b) => (a.id < b.id ? -1 : 1))
const pathOf = Object.fromEntries(
  variables.map((v) => [v.id, [collectionById[v.variableCollectionId].name, ...v.name.split('/')].join('.')]),
)
const ref = (id) => (pathOf[id] ? `{${pathOf[id]}}` : `{missing:${id}}`)
const valueOf = (raw) => {
  if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') return ref(raw.id)
  if (raw && typeof raw === 'object' && 'r' in raw) return toHex(raw)
  return raw
}
const bound = (b, key) => (b && b[key] ? ref(b[key].id) : null)

if (PART < PARTS - 1) {
  const size = Math.ceil(variables.length / (PARTS - 1))
  return {
    part: PART,
    vars: variables.slice(PART * size, (PART + 1) * size).map((v) => {
      const c = collectionById[v.variableCollectionId]
      return [
        c.name,
        v.name,
        v.resolvedType,
        (v.codeSyntax && v.codeSyntax.WEB) || null,
        v.scopes.join(','),
        v.description || '',
        Object.fromEntries(c.modes.map((m) => [m.name, valueOf(v.valuesByMode[m.modeId])])),
      ]
    }),
  }
}

const effects = (await figma.getLocalEffectStylesAsync()).map((s) => [
  s.name,
  s.description || '',
  s.effects
    .filter((e) => e.visible !== false && (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'))
    .map((e) => [
      bound(e.boundVariables, 'color') || toHex(e.color),
      e.offset.x,
      e.offset.y,
      e.radius,
      e.spread || 0,
      e.type === 'INNER_SHADOW',
    ]),
])

const text = (await figma.getLocalTextStylesAsync()).map((s) => {
  const b = s.boundVariables || {}
  return [
    s.name,
    s.description || '',
    bound(b, 'fontFamily') || s.fontName.family,
    bound(b, 'fontWeight') || bound(b, 'fontStyle') || s.fontName.style,
    bound(b, 'fontSize') || s.fontSize,
    bound(b, 'lineHeight') || (s.lineHeight.unit === 'AUTO' ? 'auto' : s.lineHeight),
    bound(b, 'letterSpacing') || s.letterSpacing,
    s.fontName.style,
    s.textDecoration,
    s.textCase,
  ]
})

return {
  part: PART,
  meta: {
    fileKey: '2170cRKZD9nhz325op4rL1',
    exportedAt: new Date().toISOString(),
    variableCount: variables.length,
    collections: collections.map((c) => [
      c.name,
      c.modes.map((m) => m.name),
      c.modes.find((m) => m.modeId === c.defaultModeId).name,
    ]),
  },
  effects,
  text,
}
