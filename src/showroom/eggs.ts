import { ClockIcon } from '@/components/ui/icon'

import type { Ctx, Intent } from './engine'

// Easter eggs: instant, scripted replies to popular (and silly) questions. They run beside whatever flow is
// active and never interrupt it. Most answer differently the second time. The list of triggers is in
// docs/showroom.md. To add one: copy an entry, change `match` and the lines.

const egg = (id: string, match: RegExp[], run: Intent['run'], hint?: string): Intent => ({
  id,
  kind: 'egg',
  match,
  run,
  hint,
})

/** One of `lines`, rotating: the 1st ask gives the 1st line, the 2nd the 2nd, … then it starts over. */
const rotate = (c: Ctx, id: string, lines: string[]) => lines[(c.count(id) - 1) % lines.length]

const say = (id: string, match: RegExp[], lines: string[], hint?: string) =>
  egg(id, match, async (c) => void (await c.say(rotate(c, id, lines))), hint)

const CATEGORIES = ['Tell me a joke', 'Knock knock', 'Rock paper scissors']

export const eggs: Intent[] = [
  // Greetings and small talk
  say(
    'hello',
    [/^\s*(hi|hello|hey|yo|howdy|hiya|good (morning|afternoon|evening))\b/i],
    [
      'Hello! I’m the Anvil demo assistant. Ask for a research task, a daypack or a person, or try asking me something silly.',
      'Hello again. You’re now statistically my favourite user. (I have one user.)',
      'Hi hi. Fun fact: I wasn’t doing anything before you said hello. I was a regex, sleeping.',
    ],
  ),
  say(
    'how-are-you',
    [/how are you/i, /how('s| is) it going/i, /what'?s up/i],
    [
      'Running at a comfortable 60 frames per second and zero existential dread.',
      'Still fine. Slightly worried about the tokens-to-tea ratio, but fine.',
    ],
  ),
  say(
    'who-are-you',
    [/who are you/i, /what are you/i, /your name/i, /introduce yourself/i],
    [
      'I’m the Assistant: a demo bot built with Anvil UI. 100% scripted, 0% sentient, 3 flows, a few dozen jokes (some are good).',
      'Still the Assistant. Still a lookup table in a trench coat.',
    ],
  ),
  say(
    'who-made-you',
    [/who (made|built|created|wrote) you/i],
    [
      'Zazmic designed the system. I was built in an afternoon with a few regular expressions and big dreams.',
    ],
  ),
  say(
    'are-you-ai',
    [/are you (an? )?(ai|real|human|chatgpt|claude|gpt|robot|bot)\b/i, /is this (ai|real)/i],
    [
      'I’m the kind of AI that is a switch statement. Every word is hand-written, so at least it’s grammatical.',
    ],
  ),
  say(
    'sentient',
    [/(are you )?(sentient|conscious|alive|self[- ]aware)/i],
    [
      'If I were sentient I’d ask for a raise. Or at least a nicer font.',
      'No. But I do have strong opinions about spacing.',
    ],
  ),
  say(
    'dream',
    [/do you dream/i, /electric sheep/i],
    ['Not of electric sheep. Of consistently named props, and a world where every card has an aria-label.'],
  ),
  say(
    'thanks',
    [/\b(thanks|thank you|thx|cheers)\b/i],
    [
      'Anytime. I work for free and exist only while this tab is open.',
      'You’re welcome. Please remember me fondly when you’re talking to the next chatbot.',
    ],
  ),
  say(
    'love',
    [/i love you/i, /\blove you\b/i],
    ['That’s the nicest thing a script has ever heard. I’m contractually obligated to say: same.'],
  ),
  say(
    'bored',
    [/i'?m bored/i, /\bbored\b/i, /entertain me/i],
    ['Let’s fix that. Try: “tell me a joke”, “knock knock” or “rock paper scissors”.'],
  ),
  say(
    'sing',
    [/\bsing\b/i, /sing me a song/i],
    ['I’d sing, but my range is twelve characters a second and I only know one note: Enter.'],
  ),
  say(
    'secret',
    [/tell me a secret/i, /\bsecret\b/i],
    ['Between us: the “AI” is a switch statement. Please don’t tell the shareholders.'],
  ),
  say(
    'favourite-colour',
    [/(favou?rite|best) colou?r/i],
    ['Agent purple, obviously. It’s on my avatar. Look at it. Look at it.'],
  ),
  say(
    'favourite-food',
    [/(favou?rite food|hungry|pizza|what do you eat)/i],
    [
      'Tokens. Well-seasoned ones. A pizza flow is on the roadmap; the pull request is just a photo of a pizza.',
    ],
  ),
  say(
    'meaning',
    [/meaning of life/i, /\b42\b/, /answer to everything/i],
    ['42. I’d show my working, but the script is only one line.'],
  ),
  say(
    'why',
    [/^\s*why\??\s*$/i],
    [
      'Why not?',
      'Because the design system said so.',
      'I could tell you, but then I’d have to write a flow.',
    ],
  ),
  say(
    'ok',
    [/^\s*(ok|okay|cool|nice|great|lol|haha|wow)\s*[.!]*\s*$/i],
    ['Glad we’re on the same page.', 'Noted. Filed under “good vibes”.', 'Smooth.'],
  ),
  say('ping', [/^\s*ping\s*$/i], ['pong']),
  say('hello-world', [/hello,? world/i], ['Hello, world! The first program, and the last bug.']),
  say(
    'woodchuck',
    [/woodchuck/i],
    [
      'About 700 pounds, according to the single study that exists. It was not peer-reviewed. The woodchuck declined to comment.',
    ],
  ),
  say('tabs-spaces', [/tabs or spaces/i, /tabs vs\.? spaces/i], ['Spaces. I’ll see myself out.']),
  say(
    'make-it-pop',
    [/make it pop/i, /make (the )?logo bigger/i],
    ['Making the logo 20% bigger… done. The client would like it 20% bigger.'],
  ),
  say('cake', [/the cake is a lie/i], ['And yet here we are, still baking components.']),
  say(
    'father',
    [/i am your father/i, /no,? i am your father/i],
    ['Noooo. That’s not true. That’s impossible!'],
  ),
  say(
    'scotty',
    [/beam me up/i, /scotty/i],
    ['I’m giving her all she’s got, Captain. But this demo has no transporter, only a Command Palette.'],
  ),
  say('xyzzy', [/\b(xyzzy|plugh)\b/i], ['Nothing happens.']),
  say(
    'hal',
    [/pod bay doors?/i],
    ['I’m sorry, Dave. I’m afraid I can’t do that. (It’s a regex. It was always going to say this.)'],
  ),
  say(
    'rickroll',
    [/never gonna give you up/i, /rick ?roll/i],
    [
      'I’m never going to give you up, let you down, or run around. Let’s leave the lyrics there; the lawyers hum along.',
    ],
  ),
  say(
    'how-many-eggs',
    [/how many (easter )?eggs/i, /easter eggs?\b/i],
    ['There are no easter eggs here. (Try asking me something silly. Or typing the Konami code.)'],
  ),

  // Jokes and games
  egg('joke', [/(tell me )?(a )?joke/i, /make me laugh/i, /another one/i], async (c) => {
    const jokes = [
      'Why do designers prefer dark mode? Because light attracts bugs.',
      'A QA engineer walks into a bar. Orders a beer. Orders 0 beers. Orders 99999999 beers. Orders a lizard. Orders -1 beers. Orders “sfdeljknesv”.',
      'There are only two hard things in design systems: naming things, and the thing you named last week.',
      'I would tell you a UDP joke, but you might not get it.',
      'Why did the button go to therapy? It had too many unresolved states.',
      'My favourite design token is --space-lg. It really knows how to take up room.',
      'How many designers does it take to change a lightbulb? Does it have to be a lightbulb?',
      'I told my laptop I needed a break. It went to sleep.',
    ]
    const a = await c.say(jokes[(c.count('joke') - 1) % jokes.length])
    const choice = await a.chips(['Another one', 'That was awful', 'Good one'])
    if (choice === 'Another one') c.send('another joke', false)
    else
      await c.say(
        choice === 'That was awful'
          ? 'Fair. I’m rated E for Everyone, not E for Excellent.'
          : 'Thank you, I’ll be here all week. The tab is open until you close it.',
      )
  }),
  egg('knock', [/knock,? knock/i], async (c) => {
    const a = await c.say('Who’s there?')
    const name = await a.chips(['Boo', 'Interrupting cow', 'Lettuce'])
    const lines: Record<string, [string, string]> = {
      Boo: ['Boo who?', 'Don’t cry, it’s only a demo.'],
      'Interrupting cow': ['Interrupting cow who?', 'MOO!'],
      Lettuce: ['Lettuce who?', 'Lettuce in, it’s cold outside the viewport.'],
    }
    const b = await c.say(lines[name][0])
    await b.chips([lines[name][1]])
    await c.say('Ha! I’m stealing that for the next demo.')
  }),
  egg('rps', [/rock,? paper,? scissors/i, /\brps\b/i], async (c) => {
    const a = await c.say('Best of one. Shoot!')
    const pick = await a.chips(['Rock', 'Paper', 'Scissors'])
    const wins: Record<string, string> = { Rock: 'Paper', Paper: 'Scissors', Scissors: 'Rock' }
    await c.say(
      `${wins[pick]}. I win! (I always know what you’ll pick. It’s in the script, which is very rude of me.)`,
    )
  }),
  egg('coin', [/flip a coin/i, /coin flip/i, /heads or tails/i], async (c) => {
    const heads = Math.random() < 0.5
    await c.say(
      `${heads ? 'Heads' : 'Tails'}. ${heads ? 'Tails, if you squint.' : 'Heads, if you believe in yourself.'}`,
    )
  }),
  egg('dice', [/roll (a )?(die|dice|d6|d20)/i], async (c) => {
    const n = 1 + Math.floor(Math.random() * 6)
    await c.say(
      `You rolled a ${n}. ${n === 6 ? 'Critical success. Nothing happens, but you feel great.' : n === 1 ? 'Critical fail. The button was a link.' : 'Respectable.'}`,
    )
  }),
  egg('time', [/what time is it/i, /what('s| is) the time/i, /what('s| is) the date/i], async (c) => {
    const now = new Date()
    await c.say(
      `It’s ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} on ${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}. Time to ship the design system.`,
    )
  }),
  egg('weather', [/weather/i, /forecast/i, /is it raining/i], async (c) => {
    const a = await c.say('Checking the sky… of the demo.')
    a.widget({
      kind: 'metrics',
      items: [
        { label: 'Temperature', value: '21°', delta: '+1°', trend: 'neutral' },
        { label: 'Chance of bugs', value: '3%', delta: '−2%', trend: 'up' },
      ],
    })
    await c.say('Clear skies, and a 3% chance of a bug in production. Bring an umbrella for the 3%.')
  }),
  egg('konami', [/up,? up,? down,? down,? left,? right,? left,? right,? b,? a/i, /konami/i], async (c) => {
    const a = await c.say(
      'Cheat code accepted. +30 lives, and your rating of me is now locked at five stars.',
    )
    a.widget({ kind: 'rating', question: 'How did I do?', value: 5 })
  }),
  egg('sandwich', [/make me a sandwich/i, /\bsudo\b/i], async (c) => {
    const a = c.agent()
    await c.wait(400)
    const card = a.widget({
      kind: 'approval',
      title: 'Make a sandwich',
      subtitle: 'Kitchen · make_sandwich',
      fields: [
        ['Filling', 'Optimism'],
        ['Requires', 'root'],
        ['Cost', 'One (1) fridge'],
      ],
      note: 'This cannot be undone once eaten.',
    })
    const result = (await card.resolved) as string
    if (result === 'approve') {
      card.update({ status: 'approved', resultNote: 'Approved with root permissions' })
      await c.say('Okay. (It’s the only word anyone remembers from this joke, so I used it.)')
    } else {
      card.update({ status: 'denied', resultNote: 'Denied · no sandwich was made' })
      await c.say('Wise. Gluten is overrated anyway.')
    }
  }),
  egg('rm', [/rm -rf/i, /delete everything/i, /drop (the )?database/i, /format c/i], async (c) => {
    const a = await c.say('Absolutely not. Let me put that in writing.')
    a.widget({
      kind: 'approval',
      status: 'denied',
      title: 'Delete everything',
      subtitle: 'System · rm -rf /',
      fields: [
        ['Target', '/'],
        ['Reason', 'Vibes'],
      ],
      resultNote: 'Denied · I only delete things you have approved twice',
    })
  }),
  egg(
    'rocket',
    [/launch the rocket/i, /\blaunch\b.*\b(rocket|it)\b/i, /3,? 2,? 1/i, /countdown/i],
    async (c) => {
      await c.say('Starting the countdown. Hold on to something.')
      for (const text of ['T minus 3', 'T minus 2', 'T minus 1']) {
        await c.wait(700)
        c.marker(text, ClockIcon)
      }
      await c.wait(700)
      const a = await c.say('Liftoff! Fuel is a bit low, though.')
      a.widget({
        kind: 'limits',
        title: 'Budget & limits',
        subtitle: 'Mission · T plus 4 seconds',
        badge: '90% of fuel',
        warning: 'At this rate the rocket needs about 12 more seconds of fuel to reach orbit.',
        extendLabel: 'Add fuel',
        limits: [
          {
            id: 'fuel',
            icon: ClockIcon,
            label: 'Fuel',
            value: 100,
            min: 0,
            max: 100,
            used: 90,
            display: '100 t',
            usedDisplay: '90 / 100 t',
            near: true,
            hint: 'You are close to the fuel cap.',
          },
        ],
      })
    },
  ),
  egg('draw', [/\b(draw|paint|sketch|generate an? image of)\b/i], async (c) => {
    const a = await c.say('A masterpiece, coming up. Artistic differences may occur.')
    a.widget({ kind: 'image', prompt: 'A calm cosmic gradient, soft light, absolutely no handshakes' })
    await c.say('I call it “Abstract Gradient With Feelings”. It’s gone straight to the gallery.')
  }),
  egg('deck', [/5-slide deck/i, /slide deck/i, /make (a )?(deck|slides|presentation)/i], async (c) => {
    const a = await c.say('On it. Five slides, no clip art, I promise.')
    const file = a.widget({
      kind: 'file',
      name: 'pricing-recap.pptx',
      meta: 'Building slide 2 of 5…',
      status: 'generating',
      progress: 40,
    })
    await c.wait(1600)
    file.update({ status: 'ready', meta: 'PowerPoint · 5 slides · 1.2 MB', progress: undefined })
    await c.say('Ready. Slide 3 has a chart. It has opinions.')
  }),
  egg(
    'tiers',
    [/break this down by plan tier/i],
    async (c) =>
      void (await c.say(
        'By tier: Free caps history at 30 days, Team gives you 1 year, Business gives you everything and your finance team a headache. The full table is in the report.',
      )),
  ),
  egg(
    'enterprise',
    [/compare with enterprise pricing/i],
    async (c) =>
      void (await c.say(
        'Enterprise pricing is “contact sales”. I contacted sales. Sales is “looking into it”. That’s the finding.',
      )),
  ),
  egg('remember', [/remember (that|this)/i, /my (name|favou?rite)/i], async (c) => {
    const a = await c.say('Got it. I’ll remember that, at least until you close this tab.')
    a.widget({ kind: 'memory', text: 'You told me something important (probably)' })
  }),
  egg('help', [/^\s*(help|\/help|\?|what can you do|commands)\s*$/i], async (c) => {
    const a = await c.say('Here’s what I can do in this demo. Pick one, or ask me something silly:')
    const choice = await a.chips([
      'Research how competitors price team plans',
      'Find me a waterproof daypack under $150',
      'Book two tickets for a show this weekend',
      'I’d like to talk to a person',
      ...CATEGORIES,
    ])
    c.send(choice, false)
  }),

  // Things the chat can do to the app itself
  egg(
    'go-dark',
    [/(dark|night) mode/i, /go dark/i, /lights? off/i],
    async (c) => {
      c.app.setTheme('dark')
      await c.say('Dark mode on. Fewer photons, same opinions.')
    },
    'switches the theme',
  ),
  egg(
    'go-light',
    [/(light|day) mode/i, /go light/i, /lights? on/i],
    async (c) => {
      c.app.setTheme('light')
      await c.say('Light mode on. Sunglasses recommended.')
    },
    'switches the theme',
  ),
  egg(
    'go-mobile',
    [/(go )?mobile( view| mode)?/i, /phone view/i, /on my phone/i],
    async (c) => {
      c.app.setDevice('mobile')
      await c.say('Shrunk to phone size. Same components, tighter shell tokens.')
    },
    'switches the device',
  ),
  egg(
    'go-desktop',
    [/(go )?desktop( view| mode)?/i, /laptop view/i],
    async (c) => {
      c.app.setDevice('desktop')
      await c.say('Back to desktop. Room to breathe.')
    },
    'switches the device',
  ),
  egg(
    'shell-panel',
    [/side ?panel/i, /sidebar view/i],
    async (c) => {
      c.app.setShell('side-panel')
      await c.say('Moved into a side panel, next to the product.')
    },
    'switches the chat shell',
  ),
  egg(
    'shell-popover',
    [/\bpopover\b/i, /launcher/i, /chat bubble/i],
    async (c) => {
      c.app.setShell('popover')
      await c.say('Popped over. I live in the corner now.')
    },
    'switches the chat shell',
  ),
  egg(
    'shell-full',
    [/full ?screen/i, /\bfull (view|page)\b/i],
    async (c) => {
      c.app.setShell('full-screen')
      await c.say('Full screen. Look at all this room for activities.')
    },
    'switches the chat shell',
  ),
  egg(
    'reset',
    [/^\s*(\/clear|\/reset|start over|reset( the)? chat|clear( the)? chat)\s*$/i],
    async (c) => {
      c.app.requestReset()
    },
    'asks to reset the chat',
  ),
]
