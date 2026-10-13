import { FileTextIcon } from '@/components/ui/icon'
import type { Answers } from '@/components/agent/question-set'
import type { TimelineStep } from '@/components/agent/progress-timeline'

import type { Intent } from '../engine'

// Flow: a research task, start to finish, the Tasks group in one conversation:
// questions → brief (approve) → plan (approve) → live progress (pause, resume, stop, wrap up) → summary
// with follow-ups. Every card waits for the user; Edit and Refine are answered in character.

const QUESTIONS = [
  { id: 'regions', question: 'Which regions matter most?', options: ['US', 'EU', 'UK', 'All of them'] },
  { id: 'plans', question: 'Include free and trial plans?', options: ['Yes', 'No'] },
  {
    id: 'sources',
    question: 'Preferred source types?',
    options: ['Pricing pages', 'Analyst reports', 'News'],
    multiple: true,
  },
]

const PLAN = [
  { title: 'Map the competitors', description: 'List the tools teams compare.', tags: ['Pricing pages'] },
  {
    title: 'Collect team-plan prices',
    description: 'Per-seat prices and annual discounts.',
    tags: ['Pricing pages'],
  },
  {
    title: 'Compare feature limits',
    description: 'Storage, history and admin controls.',
    tags: ['Pricing pages', 'News'],
  },
  {
    title: 'Check customer sentiment',
    description: 'What reviewers say about value for money.',
    tags: ['News'],
  },
  { title: 'Recommend positioning', description: 'Where Northwind Sync can win.', tags: ['Analyst reports'] },
]

const DETAILS = [
  '9 sources · 3 findings',
  '14 sources · 5 findings',
  '11 sources · 4 findings',
  '8 sources · 3 findings',
  '5 sources · 3 scenarios',
]
const DURATIONS = ['2m 05s', '3m 18s', '2m 51s', '1m 57s', '2m 22s']

const steps = (at: number, state: 'running' | 'paused' | 'complete' = 'running'): TimelineStep[] =>
  PLAN.map((step, i) => ({
    id: String(i + 1),
    title: step.title,
    status: i < at ? 'done' : i === at && state !== 'complete' ? 'running' : 'waiting',
    detail: i < at ? DETAILS[i] : i === at ? 'Reading sources…' : `Waiting for step ${at + 1}`,
    duration: i < at ? DURATIONS[i] : undefined,
  }))

const FIELDS = (answers: Answers | null) => [
  { label: 'Objective', value: 'Compare team-plan pricing and find where Northwind Sync can win' },
  { label: 'Audience', value: 'Launch team' },
  { label: 'Time range', value: 'Last 12 months' },
  { label: 'Geography', value: answers?.regions?.[0] ?? 'US and EU' },
  { label: 'Depth', value: 'Standard · 40–60 sources' },
  {
    label: 'Out of scope',
    value: answers?.plans?.[0] === 'No' ? 'Enterprise and free plans' : 'Enterprise contracts',
  },
]

export const research: Intent = {
  id: 'research',
  kind: 'flow',
  title: 'Research task',
  prompt: 'Research how competitors price team plans',
  hint: 'Questions, brief, plan, live progress and a summary',
  match: [/research/i, /competitor/i, /deep dive/i, /investigate/i, /pricing (study|analysis)/i],
  async run(c) {
    const a = c.agent()
    await a.think(
      'Scoping the research',
      'Thought for 3s',
      'Pricing is only half the story. A few answers now will save a lot of reading later.',
    )
    await a.stream('Three quick questions first, so I read the right things.')
    const answers = await a.ask<Answers | null>({ kind: 'questions', questions: QUESTIONS })

    const b = c.agent()
    await c.wait(500)
    await b.stream(
      answers
        ? 'Thanks. Here’s the brief I’ll work from. Nothing runs until you approve it.'
        : 'Skipping ahead, I’ll use sensible defaults. Here’s the brief. Nothing runs until you approve it.',
    )
    let fields = FIELDS(answers)
    const question = 'How do team plans for sync tools compare on price, and where can Northwind Sync win?'
    for (;;) {
      const brief = b.widget({
        kind: 'brief',
        status: 'review',
        subtitle: 'Review before I start · ~15 min',
        question,
        fields,
      })
      const choice = (await brief.resolved) as string
      if (choice === 'approve') {
        brief.update({
          status: 'approved',
          subtitle: 'Approved · running',
          approvedNote: 'Approved · you can still edit while it runs',
        })
        break
      }
      brief.update({ subtitle: choice === 'edit' ? 'Edited' : 'Refined' })
      fields = [
        ...fields.slice(0, 5),
        { label: 'Out of scope', value: 'Enterprise contracts, reseller pricing' },
      ]
      await c.say(
        choice === 'edit'
          ? 'In the real product this opens an editor. For the demo I narrowed the scope a little. Better?'
          : 'I tightened the wording and added reseller pricing to what’s out of scope. Better?',
      )
    }

    const p = c.agent()
    await c.wait(500)
    await p.stream('Here’s how I’ll do it. Edit any step before I start.')
    for (;;) {
      const plan = p.widget({
        kind: 'plan',
        status: 'review',
        subtitle: '5 steps · ~15 min · 40–60 sources',
        note: 'Estimated 15 min · up to 60 sources',
        steps: PLAN,
      })
      const choice = (await plan.resolved) as string
      if (choice === 'approve') {
        plan.update({ status: 'approved', approvedNote: 'Approved · research running' })
        break
      }
      plan.update({ subtitle: 'Edited · 5 steps' })
      await c.say(
        'Editing steps isn’t wired up in the demo, but picture a drag handle here. Shall I go with the plan as is?',
      )
    }

    // Live progress: the user can pause, resume, stop or wrap up.
    const r = c.agent()
    await c.wait(400)
    const run = r.widget({
      kind: 'progress',
      status: 'running',
      title: 'Researching',
      subtitle: 'Team-plan pricing · 5 steps',
      badge: '0m 05s',
      progress: 4,
      summary: 'Step 1 of 5 · 0 sources read',
      steps: steps(0),
    })
    let paused = false
    let stop = false
    let wrap = false
    run.on('pause', () => {
      paused = true
      run.update({
        status: 'paused',
        badge: 'Paused',
        pausedNote: 'Paused by you. Nothing is lost; resume any time.',
      })
    })
    run.on('resume', () => {
      paused = false
      run.update({ status: 'running', badge: 'Running', pausedNote: undefined })
    })
    run.on('stop', () => (stop = true))
    run.on('wrap', () => (wrap = true))
    let sources = 0
    for (let i = 0; i < PLAN.length && !stop && !wrap; i++) {
      for (let tick = 0; tick < 4 && !stop && !wrap; tick++) {
        while (paused && !stop && !wrap) await c.wait(200)
        await c.wait(650)
        sources += 2
        run.update({
          progress: Math.round(((i + (tick + 1) / 4) / PLAN.length) * 100),
          summary: `Step ${i + 1} of 5 · ${sources} sources read`,
          steps: steps(i),
          badge: `${i * 2 + 1}m ${10 + tick * 12}s`,
        })
      }
    }
    if (stop) {
      run.update({
        status: 'paused',
        badge: 'Stopped',
        pausedNote: 'Stopped by you. What I found so far is kept.',
      })
      await c.say('Stopped. Everything I found so far is saved. Say “research” to start it over.')
      return
    }
    run.update({
      status: 'complete',
      title: wrap ? 'Wrapped up' : 'Research complete',
      badge: 'Complete · 12m 33s',
      progress: 100,
      summary: wrap
        ? '4 of 5 steps · 38 sources read · wrapped up early'
        : '5 of 5 steps · 47 sources read · 18 findings',
      steps: steps(PLAN.length, 'complete'),
    })

    const s = c.agent()
    await c.wait(500)
    await s.stream(
      wrap
        ? 'Wrapped up early, so the last step is thinner than I’d like. Here’s what I have.'
        : 'Done. Here’s the short version.',
    )
    const follow = await s.ask<string>({
      kind: 'summary',
      subtitle: 'Research · delivered just now · 12m 33s',
      stats: [
        { label: 'sources read', value: wrap ? '38' : '47' },
        { label: 'sources cited', value: '22' },
        { label: 'findings', value: '18' },
        { label: 'gaps noted', value: '3' },
      ],
      takeaways: [
        {
          text: 'Annual billing cuts the per-seat price by about 20% at most tools; Northwind Sync is the only one that does not.',
          confidence: 'high',
        },
        {
          text: 'Free tiers cap history at 30 days, so history length is the main upgrade driver.',
          confidence: 'medium',
        },
        {
          text: 'Admin controls are bundled differently at every vendor, which makes a like-for-like comparison hard.',
          confidence: 'medium',
        },
      ],
      deliverable: { title: 'Deliverable', meta: 'Report · 14 pages', icon: FileTextIcon },
      followUps: [
        'Break this down by plan tier',
        'Compare with enterprise pricing',
        'Turn this into a 5-slide deck',
      ],
    })
    c.send(follow)
  },
}
