# Anvil Showroom — playground concept (v2, for approval)

Status: **proposal, nothing built.** Replaces the first outline. This version is about **showing what the
design system can do**, not checking it against Figma (that stays in Storybook and the quality pass).
Scope as in `docs/roadmap.md`: local development, no hosting.

## The pitch in one line

*One design system, any agent, any surface, any brand — and you can watch it work.*

Storybook shows 170 parts on a shelf. The Showroom shows what they become together: a conversation that
books a trip, plans a research task, hands off to a human, acts on a web page — in four surfaces, light
and dark, in anyone's brand colours.

## Audiences

Clients and stakeholders (a demo they can drive), designers (see the range), engineers (see how it is
composed), and Zazmic sales (a 5-minute guided tour, in presentation mode).

## Six experiences

**1 · One agent, every surface** (the opener). A single scripted conversation rendered at once as a full
screen app, a side panel beside a host product, a launcher popover on a web page and a mobile sheet,
in device frames, in sync. Play it and all four move together. Switch light and dark, reduce motion.
*Shows: the same components adapt through shell tokens, no per-surface code.*

**2 · The agent on your page** (the wow). A believable host app (a travel-booking site) with the agent
living in it: select text and the Selection Toolbar appears; ⌘K opens the Command Palette and parses
“book 2 tickets Saturday”; an Announcement Bar and a Proactive Drawer nudge you; Element Spotlight and
the Co-browse Bar fill a form while you watch, with Pause, Take over and Stop that really work.
*Shows: the whole In-page assist group, interactive, on a page that is not ours.*

**3 · Industry stories** (the library). Eight scripted scenarios, each a few minutes: Travel and booking,
E-commerce (offer, order, tracking), Customer support with a human handoff, Deep research (brief, plan,
limits, change, summary), Financial review, Workspace and documents, Ticketing, HR onboarding. Each
has a side panel “what is in play” listing the patterns used, with links to their Storybook pages, and
a speed control. *Shows: the pattern groups composing into real products.*

**4 · Make it yours** (brand and density lab). Pick an accent, a radius, a density and a type scale, or a
preset (Zazmic, Finance, Playful, Mono), and every scenario re-themes live by overriding the CSS
variables on the frame (client-side, nothing saved, tokens untouched). *Shows: white-label potential.*

**5 · X-ray** (how it is built). Toggle an overlay on any scenario: hover a card to see its name and level
(atom · molecule · organism · pattern) and an expandable “built with” tree (Task Plan → Task Card →
Shell Header → Icon Tile → Icon), from the relationship data the docs already generate.
*Shows: composability and reuse, the thing that makes the system cheap to extend.*

**6 · Accessibility and resilience**. A keyboard-only mode that draws the focus path; a **live “what a
screen reader hears” panel** beside the conversation (roles, names, live-region announcements); reduced
motion; and injectors: streaming, offline, error, empty, very long text. *Shows: it is accessible and
robust by construction, not by demo.*

**Presentation mode** (across all six). Full-screen, chrome hidden, arrow keys step through scenarios,
an auto-advance timer, a laser-pointer cursor. A guided **tour** strings experiences 1 → 2 → 3 → 5 → 4
in about five minutes with short captions.

## How it is built

- A small Vite app (the repo already has `pnpm dev`), `src/showroom/`, hash-routed so every view is a link.
- **One engine.** Extract the Welcome page's chat demo script language (`say`, `agent`, `think`, `tools`,
  `stream`, `widget`, `marker`, `pause`) into `src/showroom/engine`; the Welcome demo and all scenarios
  use it. A new widget kind is one case in one switch; every Tasks and Evidence pattern is already a
  props-driven component, so scenarios are mostly data.
- **Surfaces are real.** Chat Shell, Sheet, the Launcher popover and Drawer exactly as in Storybook, with
  `data-shell` tokens: the four sizes are real, not mock-ups.
- **The host app** for experience 2 is a few plain components in the repo (no external site), with the
  In-page assist components wired to its elements.
- **Theme lab** sets CSS variables on a wrapper element; **X-ray** reads the same relationship data as the
  docs pages and wraps rendered parts in an inspectable boundary; the **screen-reader panel** reads the
  accessibility tree of the frame (roles and names) and the live regions as they update.
- No new dependencies. Smoke test per scenario in the existing runner (plays to the end, no axe
  violations, no console errors).

## Phases

| Phase | Delivers | Needs |
| --- | --- | --- |
| **P0** | Engine extracted, app shell, surface frames, presentation mode | now |
| **P1** | Experience 1 (every surface) + the first three industry stories (research, daypack/shop, support) | existing patterns |
| **P2** | Experience 2 (the agent on your page) | In-page assist: done |
| **P3** | X-ray, and the screen-reader panel | relationship data: done |
| **P4** | Theme lab | P1 |
| **P5** | Remaining industry stories and the guided tour | Catalog, Checkout, Trust groups |

The Catalog, Checkout and Trust groups can continue in parallel: P0–P4 do not need them.

## Out of scope

Hosting or auth; real model calls (the agent is always scripted); saving or sharing to a server; editing
the real tokens; a drag-and-drop page builder (a Composer could follow later, built on the same engine).

## Decisions needed

1. **Audience first:** internal design review, or client demos? (It changes how polished P1 must be.)
2. **The opener:** experience 1 (every surface) or experience 2 (the agent on your page)? I would open
   with 2 once P0 is done, and use 1 as the establishing shot.
3. **Theme lab ambition:** a live preview only (proposed), or also export the overrides as a token file?
4. **Name:** “Showroom”, or keep “Playground”?
5. **Where:** a separate Vite app inside the repo (proposed), or a section of Storybook?
