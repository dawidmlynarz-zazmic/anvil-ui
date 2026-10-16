# Showroom

A scripted assistant inside Storybook (sidebar: **Showroom**, opened by the primary button on Welcome).
Everything is real Anvil components; the "brain" is a list of scripted intents, so it never goes off-script.

Top bar: **Device** (desktop / mobile) · **Theme** (light / dark) · **Chat shell** (full screen / side panel /
popover; mobile is a plain responsive phone frame) · **Reduce motion** · **Actions** (⌘K) · **Start over**
(asks first with an Alert Dialog).

Flows can be mixed in one conversation: starting a new flow leaves the running one with a marker
("Left “Research task”. Ask again to start it over.").

## Flows

| Say | What happens |
| --- | --- |
| `research`, `competitor`, `deep dive`, `investigate`, `pricing study` | Questions → brief (approve / edit / refine) → plan (approve / edit) → live progress (pause, resume, stop, wrap up) → summary with follow-ups |
| `daypack`, `backpack`, `buy`, `shop`, `order` | Tool calls → offer card → Order it / Show me another / Not now → approval → order tracker |
| `tickets`, `book`, `theatre`, `musical`, `this weekend` | Tool calls → a carousel of three shows → the availability calendar → the slot list → the quantity selector → an approval → confirmation with a ticket file. Each step folds into a one-line summary once answered |
| `human`, `person`, `someone`, `representative`, `refund`, `complain`, `support`, `speak to` | Pick a topic → summary → queue (3 → 2 → 1) → connected → Maya replies |

## Easter eggs and small talk

| Say | Gets you |
| --- | --- |
| hi / hello / hey / good morning | A greeting |
| how are you · what's up | Mood report |
| who are you · your name · introduce yourself | Introduction |
| who made / built you | Origin story |
| are you an AI / real / human / ChatGPT | Honest answer |
| are you sentient / conscious / alive | Existential reply |
| do you dream · electric sheep | Android dreams |
| thanks / thank you / cheers | You're welcome |
| i love you | Awkward affection |
| i'm bored · entertain me | Distraction |
| sing · sing me a song | A short song |
| tell me a secret · secret | A secret |
| favourite colour · best colour | A colour |
| favourite food · hungry · pizza | A food opinion |
| meaning of life · 42 · answer to everything | 42 |
| why (alone) | A philosophical answer |
| ok · cool · nice · lol · haha · wow | A nod |
| ping | pong |
| hello world | Hello, world |
| woodchuck | How much wood |
| tabs or spaces | Spaces |
| make it pop · make the logo bigger | Design-review humour |
| the cake is a lie | Portal nod |
| i am your father | Star Wars nod |
| beam me up · scotty | Star Trek nod |
| xyzzy · plugh | Nothing happens |
| pod bay doors | HAL |
| never gonna give you up · rickroll | Rickroll |
| easter eggs · how many eggs | Hints |
| joke · make me laugh · another one | 8 rotating jokes with quick replies |
| knock knock | Knock-knock exchange |
| rock paper scissors · rps | A game with quick replies |
| flip a coin · heads or tails | Coin flip |
| roll a die · roll dice · d20 | Dice roll |
| what time is it · what's the date | Time and date |
| weather · forecast · is it raining | Metrics widget |
| konami · up up down down left right left right b a | 5-star rating |
| make me a sandwich · sudo | Approval card |
| rm -rf · delete everything · drop the database · format c | Denied approval |
| launch the rocket · countdown · 3 2 1 | Countdown, then a limits widget |
| draw / paint / sketch / generate an image of | Image output |
| make a deck · 5-slide deck · slide deck | File output card |
| break this down by plan tier | Follow-up on the research |
| compare with enterprise pricing | Follow-up on the research |
| remember that… · my name · my favourite | Memory widget |
| help · ? · commands · what can you do | Quick replies for the flows |

Repeating an egg rotates through different lines. Anything unknown gets a rotating fallback with
**Help** and **Tell me a joke**.

## UI commands (typed or from ⌘K)

| Say | Does |
| --- | --- |
| dark mode · night mode · lights off | Dark theme |
| light mode · day mode · lights on | Light theme |
| mobile · phone view | Phone frame |
| desktop · laptop view | Desktop |
| side panel · sidebar view | Side panel shell |
| popover · launcher · chat bubble | Popover shell |
| full screen | Full screen shell |
| start over · /clear · /reset · reset chat | Opens the "Start over?" dialog |

## Adding a flow or an egg

- **Egg:** in `src/showroom/eggs.ts` copy an entry (`say(id, [regex], [lines])` for text, `egg(id, [regex], run)`
  for anything richer) and change `match` and the lines.
- **Flow:** add `src/showroom/flows/<name>.ts` exporting an `Intent` (`kind: 'flow'`, `prompt`, `hint`, `match`,
  `async run(c)`), compose it from `c.agent()` (`think`, `tools`, `stream`, `widget`, `ask`, `chips`), add a widget
  kind in `widgets.tsx` if it needs a new component, then list it in `brain.ts`.
- Widgets map to real Anvil components only; reuse before adding.
- Add a `Story.test` in `showroom.stories.tsx` (the `Scripted` story runs at instant speed).

## Roadmap

v0.2 agent on your page with In-page assist · v0.3 more flows as Catalog, Checkout and Trust land ·
v0.4 X-ray (component names on hover) · v0.5 accessibility view · v0.6 brand lab · v0.7 presentation mode and tour.
