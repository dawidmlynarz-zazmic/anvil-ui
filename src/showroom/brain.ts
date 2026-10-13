import type { Intent } from './engine'
import { eggs } from './eggs'
import { handoff } from './flows/handoff'
import { order } from './flows/order'
import { research } from './flows/research'

// The brain: which intents the assistant knows, in order (the first match wins). Flows are longer
// conversations (and are listed in the actions menu); eggs are instant replies. To add a flow, write
// `flows/<name>.ts` and add it to `flows` below.

export const flows: Intent[] = [research, order, handoff]
export const intents: Intent[] = [...flows, ...eggs]

const MISSES = [
  'I didn’t catch that. I’m a demo, so I only know a few things. Say “help” for the list.',
  'Still no idea. In my defence, my vocabulary is a regex.',
  'That’s outside my script. Try “help”, or ask for a joke if you need a hug.',
  'My training data for that is exactly zero lines. Say “help” and I’ll show you what I do know.',
]

export const fallback: Intent = {
  id: 'fallback',
  kind: 'egg',
  match: [],
  async run(c) {
    const a = await c.say(MISSES[(c.count('fallback') - 1) % MISSES.length])
    const choice = await a.chips(['Help', 'Tell me a joke'])
    c.send(choice, false)
  },
}
