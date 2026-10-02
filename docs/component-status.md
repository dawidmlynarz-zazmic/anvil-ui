# Component status

Updated by Claude Code after each component. Figma node ids come from `CLAUDE.md` → Page map.

| Component | Figma page · node | Code path | Status | Notes |
| --- | --- | --- | --- | --- |
| Foundations (tokens) | Colors 8272:455 · Typography 8207:6875 · Spacings 8272:456 · Elevation 8369:2258 | src/styles/tokens | Not started | Needs tokens/anvil.tokens.json |
| Button | Button 8208:12587 | src/components/ui/button.tsx | Not started | Reference component |
| Tooltip | Tooltip 8208:12600 | src/components/ui/tooltip.tsx | Scaffold only | shadcn primitive added in Step 1 for the Storybook `TooltipProvider`; unstyled until Step 4 |
| Toast (Sonner) | Toast 8208:12599 | src/components/ui/sonner.tsx | Scaffold only | Added in Step 1 for the Storybook `Toaster`; theme passed as a prop (no next-themes); unstyled until Step 4 |
