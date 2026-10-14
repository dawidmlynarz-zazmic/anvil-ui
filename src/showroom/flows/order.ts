import type { Intent } from '../engine'

// Flow: shop for a daypack: search tools → an offer (price, rating, perks) → quick replies → an approval →
// a delivery tracker that advances on its own. “Show me another” swaps the offer; “Not now” ends politely.

const PACKS = [
  {
    name: 'Trailhead 28L daypack',
    price: '$119',
    was: '$148',
    discount: '−20%',
    rating: 4.6,
    reviews: '4.6 · 1,204 reviews',
    perks: [
      ['Waterproof, taped seams', 'included'],
      ['Rain cover', 'included'],
      ['Gift wrap · $4', 'fee'],
      ['Lifetime warranty', 'excluded'],
    ],
  },
  {
    name: 'Drizzle 22L commuter',
    price: '$94',
    was: '$110',
    discount: '−15%',
    rating: 4.4,
    reviews: '4.4 · 612 reviews',
    perks: [
      ['Water-resistant fabric', 'included'],
      ['Laptop sleeve', 'included'],
      ['Rain cover', 'fee'],
      ['Chest strap', 'excluded'],
    ],
  },
] as const

const TRACKER = [
  { label: 'Ordered', meta: 'Mon 13' },
  { label: 'Packed', meta: 'Tue 14' },
  { label: 'Shipped', meta: 'Wed 15' },
  { label: 'Delivered', meta: 'Thu 16' },
]

export const order: Intent = {
  id: 'order',
  kind: 'flow',
  title: 'Daypack order',
  prompt: 'Find me a waterproof daypack under $150',
  hint: 'An offer, an approval and a delivery tracker',
  match: [/daypack/i, /backpack/i, /\bbuy\b/i, /\bshop(ping)?\b/i, /\border\b(?!\s*of)/i],
  async run(c) {
    let a = c.agent()
    await c.wait(500)
    await a.tools([
      { name: 'catalog.search', summary: '12 packs under $150', duration: '1.3s' },
      { name: 'reviews.summarise', summary: '1,204 reviews read', duration: '1.0s' },
    ])
    await a.stream('One stands out: fully taped seams, a rain cover and a decent sale on.')
    let index = 0
    for (;;) {
      const pack = PACKS[index % PACKS.length]
      const offer = a.widget({ kind: 'offer', ...pack, perks: pack.perks.map((p) => [...p]) })
      void offer
      const choice = await a.chips(['Order it', 'Show me another', 'Not now'])
      if (choice === 'Show me another') {
        index++
        const next = c.agent()
        await c.wait(400)
        await next.stream(
          `Fair. Here’s the ${PACKS[index % PACKS.length].name}: a bit cheaper, a bit lighter on rain protection.`,
        )
        a = next
        continue
      }
      if (choice === 'Not now') {
        await c.say('No rush. The sale runs until Friday, and I’ll still be here, pretending to blink.')
        return
      }
      const price = pack.price
      const o = c.agent()
      await c.wait(500)
      for (;;) {
        const approval = o.widget({
          kind: 'approval',
          title: 'Place the order',
          subtitle: 'Shop · place_order',
          fields: [
            ['Item', pack.name],
            ['Total', `${price}.00`],
            ['Arrives', 'Thu 16th'],
          ],
          note: 'Your card on file will be charged. You can cancel within 24 hours.',
        })
        const result = (await approval.resolved) as string
        if (result === 'deny') {
          approval.update({ status: 'denied', resultNote: 'Denied just now · nothing was charged' })
          await c.say('Cancelled. Nothing was charged, and no backpack was harmed.')
          return
        }
        approval.update({ status: 'approved', resultNote: 'Approved just now · order placed' })
        break
      }
      const t = c.agent()
      await c.wait(500)
      await t.stream('Ordered. It lands a day before your deadline. Here’s the tracker.')
      const tracker = t.widget({ kind: 'tracker', steps: TRACKER, step: 1 })
      c.marker('Order confirmed · #NW-48213')
      for (const step of [2, 3]) {
        await c.wait(1600)
        tracker.update({ step })
      }
      await c.say('Out for delivery. Tell it the rain is coming; it’ll hurry.')
      return
    }
  },
}
