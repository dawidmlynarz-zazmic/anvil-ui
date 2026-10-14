## What and why

<!-- One component or one tightly related group. Link the Figma node. -->

## Checklist

- [ ] Reuse checked: nothing here duplicates an existing component (Welcome catalog, `src/components`, `docs/system-audit.md`)
- [ ] Contract names only (`variant`, `intent`, `tone`, `size`…); no hex or px literals; no hand-edited tokens
- [ ] Compared with Figma in light and dark; differences fixed or noted
- [ ] Narrow widths checked (`pnpm audit:narrow` or the Showroom mobile frame)
- [ ] Accessibility: keyboard, focus, accessible names; `guide.a11y` written
- [ ] Stories: Default with Controls, states, usage guide, `figmaProps`; interactions as `Story.test`
- [ ] `pnpm typecheck && pnpm lint && pnpm test-storybook` pass (CI will check too)
- [ ] `docs/component-status.md` and the Welcome catalog updated
- [ ] Figma flag raised if code differs from a frame

## Notes for the reviewer

<!-- Deviations from Figma or shadcn, new dependencies (need approval), anything to look at closely. -->
