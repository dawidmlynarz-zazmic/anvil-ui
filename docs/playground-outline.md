# Anvil Playground — outline for approval

Status: **proposal, nothing built.** Scope stays as in `docs/roadmap.md`: local development only (no
hosting). Written 2026-10-13, after the component library reached ~87% of the catalog.

## 1. Why a playground, when we have Storybook

Storybook documents **one component at a time**. An agent product is **a conversation made of many
components in a surface** (a chat shell in a popover, a plan being approved, a budget running out). Today
the only place that is shown together is the Welcome page's chat demo. The playground answers questions
Storybook cannot:

- *Does it hold together?* A thread of ten components, in four shell sizes, light and dark.
- *Can I show it to someone?* A guided, scripted conversation a designer or stakeholder can play and pause.
- *Can I try my case?* Edit a conversation and see it, without writing React.
- *Does it match Figma?* Every component × state × theme in one grid, next to the Figma image.

## 2. Who it is for

| Audience | What they do there |
| --- | --- |
| Designers / design lead | Play scenarios, compare with Figma, flag differences, try a conversation of their own |
| Engineers | See components in context, copy the TSX, check a state or a long-text case |
| Product / stakeholders | Watch a domain scenario (booking, research, support) in a real shell |
| QA | Run the state matrix and the automated sweep (visual and axe) |

## 3. The shape: five rooms in one app

A small Vite app (the repo already has `pnpm dev` for a playground), `src/playground/`, with a left
rail and a top bar. State lives in the URL hash, so any view can be shared as a link.

1. **Scenarios** (the main room). A gallery of scripted conversations rendered in a **Shell Frame**
   (full screen · side panel · popover · mobile, switchable). A player bar: play · pause · step ·
   speed · restart, and a scrubber over the script's steps. Reduced motion and the Motion toolbar are
   respected. Scenarios come in two sets:
   - *Domain scenarios* (from the Figma domain kits): Ticketing, Deep Research, Booking, Travel,
     E-Commerce, Financial, Workspace, Customer Support.
   - *Templates* (Figma Surfaces › Threads): ticketing, welcome, connecting, unavailable, human handoff.
2. **Composer** (phase 2). A thread builder: add a message, then drop a component from a palette (the
   Agent Builder catalog, grouped as in Storybook) into the assistant's turn. A controls panel edits its
   props, generated from the same `argTypes` the stories use. Output: a shareable link, a JSON script,
   and a copy-ready TSX snippet.
3. **Script editor** (phase 2, with the Composer). The conversation as JSON in the language the Welcome
   demo already uses (`say`, `agent`, `think`, `tools`, `stream`, `widget`, `marker`, `pause`), with
   live preview and errors shown inline. This is also how scenarios are authored.
4. **State matrix** (phase 1). For any component: a grid of variants × states × light/dark × the four
   shell sizes, built from the stories, with the Figma screenshot beside each cell and the component's
   open flags (from `docs/component-status.md`) listed. A **Sweep** button renders every component and
   records pass or fail (axe, overflow, console errors) and a screenshot, for diffing between commits.
5. **Lab** (phase 3). Toggles for the things that break layouts: long text, RTL, 200% zoom, forced
   colors, reduced motion, loading / empty / error injected into widgets, a throttled “streaming” mode.

## 4. How it is built (no new dependencies)

- **Extract the script engine.** The Welcome page's `ChatDemo` already has a script language, a player
  loop and a widget vocabulary. Move the engine to `src/playground/engine` (types, `apply`, the
  playing loop, reduced-motion hook) and make the Welcome demo a consumer. One engine, two users.
- **Widgets stay data.** A scenario is data (`WidgetSpec`), rendered by one `Widget` switch that maps a
  kind to a real component, so adding a component to the playground is one case plus one palette entry.
  Every Tasks and Evidence pattern is already a self-contained component with props, so this is cheap.
- **Shell Frame** reuses Chat Shell, Sheet, Launcher popover and Drawer exactly as the stories do, with
  `data-shell` tokens, so the four sizes are real rather than faked.
- **Controls panel** reads `argTypes` from the CSF stories (they are required by lint), so it never drifts.
- **State matrix** reads `args` and story names the same way and uses the existing light and dark
  decorators; screenshots use the browser already in the test setup (Vitest browser mode).
- **Tests**: a smoke test per scenario (plays to the end, no axe violations, no console errors), run
  with `pnpm test-storybook`'s runner so scenarios cannot rot.
- **Where it lives in Storybook**: one “Examples” section links into the playground rooms. Storybook
  stays the reference; the playground is the workbench.

## 5. Phases

| Phase | Delivers | Size |
| --- | --- | --- |
| **P0 Foundation** | Engine extracted, Welcome demo on it, app shell (rail, top bar, hash state), Shell Frame | 1 PR |
| **P1 Scenarios + Matrix** | 8 domain scenarios + 5 templates; State matrix and Sweep (also the Figma-vs-code QA tool) | 3 PRs |
| **P2 Composer + Script editor** | Palette, controls panel, JSON editor, share link, TSX export | 2 PRs |
| **P3 Lab** | The toggles above | 1 PR |

The scenarios need the last three pattern groups (Catalog, Checkout, Trust), so P0 and the State matrix
can start now and the domain scenarios land as those groups do.

## 6. Out of scope (for now)

Hosting or auth; real model calls (the agent is always scripted); editing tokens (Figma is the source of
truth); a visual drag-and-drop page builder; saving scenarios to a server.

## 7. Decisions needed

1. **Where it lives:** the existing Vite app (proposed) or only as Storybook stories?
2. **Scope of v1:** Scenarios + State matrix first (proposed), with the Composer after, or Composer first?
3. **Scenario list:** confirm the eight domain kits and five templates, and any you would add or drop.
4. **Figma overlay** in the State matrix: use exported Figma screenshots checked into the repo
   (proposed: stable, offline) or fetch them live through the Figma MCP (always current, needs the
   connection)?
5. **Sharing:** URL-hash links only (proposed), or also a downloadable scenario JSON file?
