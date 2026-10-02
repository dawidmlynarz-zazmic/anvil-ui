`anvil.tokens.json` is pulled from the Figma file (variables, effect styles, text styles) by
running `scripts/figma/export-tokens.js` through the Figma MCP `use_figma` tool. Figma is the
source of truth: never edit the JSON by hand; re-pull when Figma changes, then `pnpm tokens:build`.
