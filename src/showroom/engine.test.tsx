import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'

import { useShowroomChat, type AppActions, type Ctx, type Intent, type Turn } from './engine'

// The Showroom engine: intents, flows that wait for the user, abort on a new flow or Reset, and counts.
// A tiny probe component runs the hook in a real React tree; `speed: 'instant'` makes every pause 0ms.

const app: AppActions = { setTheme() {}, setDevice() {}, setShell() {}, requestReset() {} }
type Chat = ReturnType<typeof useShowroomChat>

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(intents: Intent[], fallback: Intent) {
  const holder: { chat?: Chat } = {}
  function Probe() {
    holder.chat = useShowroomChat({ intents, fallback, speed: 'instant', app })
    return null
  }
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  act(() => root.render(createElement(Probe)))
  return { chat: () => holder.chat as Chat }
}

const flush = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 30)))
const texts = (turns: Turn[]) => turns.map((t) => ('text' in t && t.text ? `${t.kind}:${t.text}` : t.kind))
const intent = (id: string, match: RegExp, run: Intent['run'], kind: Intent['kind'] = 'egg'): Intent => ({
  id,
  kind,
  match: [match],
  run,
})
const reply =
  (text: string): Intent['run'] =>
  async (c: Ctx) =>
    void (await c.say(text))
const fallback = intent('fallback', /^$/, reply('I did not get that'))

describe('useShowroomChat', () => {
  it('echoes the message, routes it to the matching intent and streams the reply', async () => {
    const { chat } = mount([intent('hi', /hello/i, reply('Hi there friend'))], fallback)
    act(() => chat().send('Hello'))
    await flush()
    const turns = chat().turns
    expect(turns[0]).toMatchObject({ kind: 'user', text: 'Hello' })
    expect(turns[1]).toMatchObject({ kind: 'agent', text: 'Hi there friend' })
  })

  it('uses the fallback when nothing matches, and ignores blank messages', async () => {
    const { chat } = mount([intent('hi', /hello/i, reply('Hi'))], fallback)
    act(() => chat().send('   '))
    act(() => chat().send('zzz'))
    await flush()
    expect(chat().turns).toHaveLength(2)
    expect(chat().turns[1]).toMatchObject({ kind: 'agent', text: 'I did not get that' })
  })

  it('does not echo when asked not to', async () => {
    const { chat } = mount([intent('hi', /hello/i, reply('Hi'))], fallback)
    act(() => chat().send('hello', false))
    await flush()
    expect(chat().turns.every((t) => t.kind !== 'user')).toBe(true)
  })

  it('counts runs per intent so a repeat can answer differently, and Reset clears the counts', async () => {
    const seen: number[] = []
    const joke = intent('joke', /joke/, async (c) => {
      seen.push(c.count('joke'))
    })
    const { chat } = mount([joke], fallback)
    act(() => chat().send('joke'))
    act(() => chat().send('joke'))
    await flush()
    expect(seen).toEqual([1, 2])
    act(() => chat().reset())
    act(() => chat().send('joke'))
    await flush()
    expect(seen).toEqual([1, 2, 1])
  })

  it('a flow is busy until it ends and waits for the user to answer a widget', async () => {
    let result: unknown
    const flow = intent(
      'order',
      /order/,
      async (c) => {
        const agent = c.agent()
        result = await agent.ask({ kind: 'approval' })
        await c.say('Done')
      },
      'flow',
    )
    const { chat } = mount([flow], fallback)
    act(() => chat().send('order'))
    await flush()
    expect(chat().busy).toBe(true)
    const widget = chat().turns.flatMap((t) => (t.kind === 'agent' ? t.widgets : []))[0]
    expect(widget.spec.kind).toBe('approval')
    expect(widget.done).toBe(false)
    act(() => chat().emit(widget.id, 'resolve', { approved: true }))
    await flush()
    expect(result).toEqual({ approved: true })
    expect(chat().busy).toBe(false)
    expect(texts(chat().turns)).toContain('agent:Done')
    const resolved = chat().turns.flatMap((t) => (t.kind === 'agent' ? t.widgets : []))[0]
    expect(resolved.done).toBe(true)
  })

  it('forwards widget events other than the answer to the flow', async () => {
    const events: unknown[] = []
    const flow = intent(
      'run',
      /run/,
      async (c) => {
        const handle = c.agent().widget({ kind: 'progress' })
        handle.on('pause', (payload) => events.push(payload))
        await handle.resolved
      },
      'flow',
    )
    const { chat } = mount([flow], fallback)
    act(() => chat().send('run'))
    await flush()
    const widget = chat().turns.flatMap((t) => (t.kind === 'agent' ? t.widgets : []))[0]
    act(() => chat().emit(widget.id, 'pause', 'now'))
    expect(events).toEqual(['now'])
  })

  it('starting another flow stops the running one and says so', async () => {
    let firstFinished = false
    const first = intent(
      'first',
      /first/,
      async (c) => {
        await c.agent().ask({ kind: 'questions' })
        firstFinished = true
      },
      'flow',
    )
    first.title = 'First task'
    const second = intent('second', /second/, reply('Second flow'), 'flow')
    const { chat } = mount([first, second], fallback)
    act(() => chat().send('first'))
    await flush()
    act(() => chat().send('second'))
    await flush()
    expect(firstFinished).toBe(false)
    const all = texts(chat().turns)
    expect(all).toContain('marker:Left “First task”. Ask again to start it over.')
    expect(all).toContain('agent:Second flow')
    expect(chat().busy).toBe(false)
  })

  it('an egg runs beside a flow without stopping it', async () => {
    let done = false
    const flow = intent(
      'flow',
      /flow/,
      async (c) => {
        await c.agent().ask({ kind: 'questions' })
        done = true
      },
      'flow',
    )
    const egg = intent('egg', /joke/, reply('Ha'))
    const { chat } = mount([flow, egg], fallback)
    act(() => chat().send('flow'))
    await flush()
    act(() => chat().send('joke'))
    await flush()
    expect(chat().busy).toBe(true)
    expect(texts(chat().turns)).toContain('agent:Ha')
    const widget = chat().turns.flatMap((t) => (t.kind === 'agent' ? t.widgets : []))[0]
    act(() => chat().emit(widget.id, 'resolve', 'ok'))
    await flush()
    expect(done).toBe(true)
  })

  it('Reset stops a running flow, clears the conversation and is not busy', async () => {
    let resumed = false
    const flow = intent(
      'flow',
      /flow/,
      async (c) => {
        await c.agent().ask({ kind: 'questions' })
        resumed = true
        await c.say('never shown')
      },
      'flow',
    )
    const { chat } = mount([flow], fallback)
    act(() => chat().send('flow'))
    await flush()
    expect(chat().busy).toBe(true)
    act(() => chat().reset())
    await flush()
    expect(chat().turns).toEqual([])
    expect(chat().busy).toBe(false)
    expect(resumed).toBe(false)
  })

  it('chips echo the choice as the user’s message and return it', async () => {
    let choice = ''
    const flow = intent(
      'chips',
      /pick/,
      async (c) => {
        choice = await c.agent().chips(['Rock', 'Paper'])
      },
      'flow',
    )
    const { chat } = mount([flow], fallback)
    act(() => chat().send('pick'))
    await flush()
    const widget = chat().turns.flatMap((t) => (t.kind === 'agent' ? t.widgets : []))[0]
    act(() => chat().emit(widget.id, 'resolve', 'Paper'))
    await flush()
    expect(choice).toBe('Paper')
    expect(texts(chat().turns)).toContain('user:Paper')
  })

  it('routes c.send through the brain, with or without an echo', async () => {
    const router = intent('router', /route/, async (c) => c.send('hello', false))
    const hi = intent('hi', /hello/, reply('Hi'))
    const { chat } = mount([router, hi], fallback)
    act(() => chat().send('route'))
    await flush()
    const all = texts(chat().turns)
    expect(all).toContain('agent:Hi')
    expect(all).not.toContain('user:hello')
  })

  it('streams text word by word to the full sentence', async () => {
    const { chat } = mount([intent('long', /long/, reply('one two three four'))], fallback)
    act(() => chat().send('long'))
    await flush()
    const agent = chat().turns.find((t) => t.kind === 'agent')
    expect(agent && 'text' in agent && agent.text).toBe('one two three four')
  })
})
