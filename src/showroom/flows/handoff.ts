import type { Intent } from '../engine'

// Flow: hand the conversation to a person: ask what it is about, summarise, queue, connect. The
// queue counts down on its own, then Maya joins and says hello.

export const handoff: Intent = {
  id: 'handoff',
  kind: 'flow',
  title: 'Talk to a person',
  prompt: 'I’d like to talk to a person',
  hint: 'A handoff with a queue and a person joining',
  match: [
    /\b(human|person|someone|representative|real agent)\b/i,
    /\brefund\b/i,
    /\bcomplain/i,
    /\bsupport\b/i,
    /\bspeak to\b/i,
  ],
  async run(c) {
    const a = await c.say(
      'Of course. What is it about, so I can brief them and you don’t have to repeat yourself?',
    )
    const topic = await a.chips(['An order', 'Billing', 'Something else'])
    const b = c.agent()
    await c.wait(500)
    await b.tools([
      { name: 'conversation.summarise', summary: `Topic: ${topic.toLowerCase()}`, duration: '0.9s' },
    ])
    await b.stream('Done. I’ve written them a two-line summary. Finding someone now.')
    const card = b.widget({ kind: 'handoff', status: 'queued', position: 3 })
    for (const position of [2, 1]) {
      await c.wait(1500)
      card.update({ position })
    }
    await c.wait(1500)
    card.update({ status: 'connecting' })
    await c.wait(1400)
    card.update({ status: 'connected' })
    c.marker('Maya Chen joined the conversation')
    await c.say('Maya here. I’ve read the summary, so no need to start from the top. How can I help?')
    await c.say('(This is the end of the demo handoff. Say “start over” and I’ll forget Maya ever existed.)')
  },
}
