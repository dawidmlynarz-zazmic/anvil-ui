import * as React from 'react'

import type { LucideIcon } from '@/components/ui/icon'

// The Showroom's script engine. A flow is an async function that talks to a `Ctx`: it adds agent turns,
// streams text, shows widgets and WAITS for the user (`ask`), so a conversation is interactive, not a
// recording. Everything a flow awaits can be aborted (a new flow, or Reset), and `speed` scales every
// pause so tests and reduced motion are fast. See docs/showroom.md for how to add a flow.

export type Speed = 'normal' | 'fast' | 'instant'
const FACTOR: Record<Speed, number> = { normal: 1, fast: 0.3, instant: 0 }

export type Tool = { name: string; summary: string; duration: string }
/** A widget is data (`kind` plus its props); `widgets.tsx` maps each kind to a real component. */
export type WidgetSpec = { kind: string } & Record<string, unknown>
export type WidgetEntry = { id: string; spec: WidgetSpec; done: boolean }

export type AgentTurn = {
  id: string
  kind: 'agent'
  typing?: boolean
  thinking?: { title: string; done?: string; body: string; finished?: boolean }
  tools?: { list: Tool[]; done: number }
  text?: string
  widgets: WidgetEntry[]
}
export type Turn =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'marker'; text: string; icon?: LucideIcon }
  | AgentTurn

export type WidgetHandle = {
  id: string
  /** Changes the widget's data (its status, progress, …). */
  update(patch: Record<string, unknown>): void
  /** Resolves with what the user chose (set by `ask`). */
  resolved: Promise<unknown>
  /** Listens for a widget event other than the answer: pause, resume, stop… */
  on(event: string, listener: (payload?: unknown) => void): void
}

export type Agent = {
  id: string
  think(title: string, done: string, body: string, ms?: number): Promise<void>
  tools(list: Tool[]): Promise<void>
  stream(text: string): Promise<void>
  widget(spec: WidgetSpec): WidgetHandle
  /** Shows an interactive widget and waits for the user to answer it. */
  ask<T = unknown>(spec: WidgetSpec): Promise<T>
  /** Quick replies; the choice is echoed as the user's message. */
  chips(items: string[]): Promise<string>
}

export type AppActions = {
  setTheme(theme: 'light' | 'dark'): void
  setDevice(device: 'desktop' | 'mobile'): void
  setShell(shell: 'full-screen' | 'side-panel' | 'popover'): void
  requestReset(): void
}

export type Ctx = {
  signal: AbortSignal
  app: AppActions
  /** A counter per intent id, kept until Reset: lets an easter egg answer differently the 2nd time. */
  count(id: string): number
  wait(ms: number): Promise<void>
  agent(): Agent
  /** One agent turn with streamed text; returns it so you can add more. */
  say(text: string): Promise<Agent>
  marker(text: string, icon?: LucideIcon): void
  /** Routes a message through the brain, as if the user had typed it (`echo` also shows it as theirs). */
  send(text: string, echo?: boolean): void
}

export type Intent = {
  id: string
  /** `flow`: a longer conversation that replaces the one running. `egg`: an instant reply on the side. */
  kind: 'flow' | 'egg' | 'action'
  match: RegExp[]
  title?: string
  /** Shown in the actions menu and the help list. */
  prompt?: string
  hint?: string
  run(ctx: Ctx, text: string): Promise<void>
}

class Aborted extends Error {}

export function useShowroomChat({
  intents,
  fallback,
  speed,
  app,
}: {
  intents: Intent[]
  fallback: Intent
  speed: Speed
  app: AppActions
}) {
  const [turns, setTurns] = React.useState<Turn[]>([])
  const [busy, setBusy] = React.useState(false)
  const speedRef = React.useRef(speed)
  const appRef = React.useRef(app)
  const seq = React.useRef(0)
  const globalAbort = React.useRef(new AbortController())
  const mainAbort = React.useRef<AbortController | null>(null)
  const counts = React.useRef(new Map<string, number>())
  const answers = React.useRef(new Map<string, (value: unknown) => void>())
  const listeners = React.useRef(new Map<string, Map<string, (payload?: unknown) => void>>())
  const flowTitle = React.useRef<string | null>(null)
  const sendRef = React.useRef<(text: string, echo?: boolean) => void>(() => {})

  const nextId = (prefix: string) => `${prefix}${++seq.current}`

  const makeCtx = React.useCallback((signal: AbortSignal): Ctx => {
    const patchAgent = (id: string, change: (turn: AgentTurn) => AgentTurn) =>
      setTurns((all) => all.map((t) => (t.id === id && t.kind === 'agent' ? change(t) : t)))
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(new Aborted())
        const timer = setTimeout(() => resolve(), ms * FACTOR[speedRef.current])
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer)
            reject(new Aborted())
          },
          { once: true },
        )
      })
    const makeAgent = (): Agent => {
      const id = nextId('a')
      setTurns((all) => [...all, { id, kind: 'agent', typing: true, widgets: [] }])
      const widget = (spec: WidgetSpec): WidgetHandle => {
        const wid = nextId('w')
        patchAgent(id, (t) => ({
          ...t,
          typing: false,
          widgets: [...t.widgets, { id: wid, spec, done: false }],
        }))
        const resolved = new Promise<unknown>((resolve, reject) => {
          answers.current.set(wid, (value) => {
            patchAgent(id, (t) => ({
              ...t,
              widgets: t.widgets.map((w) => (w.id === wid ? { ...w, done: true } : w)),
            }))
            resolve(value)
          })
          signal.addEventListener('abort', () => reject(new Aborted()), { once: true })
        })
        resolved.catch(() => {})
        return {
          id: wid,
          resolved,
          update: (patch) =>
            patchAgent(id, (t) => ({
              ...t,
              widgets: t.widgets.map((w) => (w.id === wid ? { ...w, spec: { ...w.spec, ...patch } } : w)),
            })),
          on: (event, listener) => {
            const map = listeners.current.get(wid) ?? new Map()
            map.set(event, listener)
            listeners.current.set(wid, map)
          },
        }
      }
      return {
        id,
        think: async (title, done, body, ms = 1500) => {
          patchAgent(id, (t) => ({ ...t, typing: false, thinking: { title, body } }))
          await wait(ms)
          patchAgent(id, (t) => ({ ...t, thinking: { title, done, body, finished: true } }))
        },
        tools: async (list) => {
          for (let done = 0; done < list.length; done++) {
            patchAgent(id, (t) => ({ ...t, typing: false, tools: { list, done } }))
            await wait(900)
          }
          patchAgent(id, (t) => ({ ...t, tools: { list, done: list.length } }))
          await wait(300)
        },
        stream: async (text) => {
          const words = text.split(' ')
          for (let i = 1; i <= words.length; i++) {
            patchAgent(id, (t) => ({ ...t, typing: false, text: words.slice(0, i).join(' ') }))
            await wait(45)
          }
          await wait(250)
        },
        widget,
        ask: async <T>(spec: WidgetSpec) => (await widget(spec).resolved) as T,
        chips: async (items) => {
          const choice = (await widget({ kind: 'chips', items }).resolved) as string
          setTurns((all) => [...all, { id: nextId('u'), kind: 'user', text: choice }])
          return choice
        },
      }
    }
    return {
      signal,
      app: appRef.current,
      count: (id) => counts.current.get(id) ?? 0,
      wait,
      agent: makeAgent,
      say: async (text) => {
        const agent = makeAgent()
        await wait(450)
        await agent.stream(text)
        return agent
      },
      marker: (text, icon) => setTurns((all) => [...all, { id: nextId('m'), kind: 'marker', text, icon }]),
      send: (text, echo = true) => sendRef.current(text, echo),
    }
  }, [])

  const run = React.useCallback(
    async (intent: Intent, text: string) => {
      counts.current.set(intent.id, (counts.current.get(intent.id) ?? 0) + 1)
      const isFlow = intent.kind === 'flow'
      let signal: AbortSignal
      let controller: AbortController | null = null
      if (isFlow) {
        mainAbort.current?.abort()
        controller = new AbortController()
        mainAbort.current = controller
        signal = AbortSignal.any([globalAbort.current.signal, controller.signal])
        flowTitle.current = intent.title ?? intent.id
        setBusy(true)
      } else {
        signal = globalAbort.current.signal
      }
      try {
        await intent.run(makeCtx(signal), text)
      } catch (error) {
        if (!(error instanceof Aborted)) console.error(error)
      } finally {
        if (isFlow && mainAbort.current === controller) {
          mainAbort.current = null
          flowTitle.current = null
          setBusy(false)
        }
      }
    },
    [makeCtx],
  )

  const send = React.useCallback(
    (text: string, echo = true) => {
      const clean = text.trim()
      if (!clean) return
      if (echo) setTurns((all) => [...all, { id: nextId('u'), kind: 'user', text: clean }])
      const hit = intents.find((i) => i.match.some((re) => re.test(clean)))
      if (hit?.kind === 'flow' && flowTitle.current && mainAbort.current) {
        const left = flowTitle.current
        setTurns((all) => [
          ...all,
          { id: nextId('m'), kind: 'marker', text: `Left “${left}”. Ask again to start it over.` },
        ])
      }
      void run(hit ?? fallback, clean)
    },
    [intents, fallback, run],
  )
  React.useEffect(() => {
    speedRef.current = speed
    appRef.current = app
    sendRef.current = send
  })

  /** Called by a widget: `resolve` answers an `ask`; any other event goes to the flow's listener. */
  const emit = React.useCallback((widgetId: string, event: string, payload?: unknown) => {
    if (event === 'resolve') {
      const resolve = answers.current.get(widgetId)
      answers.current.delete(widgetId)
      resolve?.(payload)
      return
    }
    listeners.current.get(widgetId)?.get(event)?.(payload)
  }, [])

  const reset = React.useCallback(() => {
    globalAbort.current.abort()
    globalAbort.current = new AbortController()
    mainAbort.current = null
    flowTitle.current = null
    counts.current.clear()
    answers.current.clear()
    listeners.current.clear()
    setTurns([])
    setBusy(false)
  }, [])

  React.useEffect(() => {
    const abort = globalAbort.current
    return () => abort.abort()
  }, [])

  return { turns, busy, send, emit, reset }
}
