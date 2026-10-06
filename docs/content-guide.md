# Anvil content guide

How story content and component copy read in Anvil (next-phase Phase 7). Two rules:

| Level | Content | Example |
| --- | --- | --- |
| **Atoms** | Context-agnostic placeholders. An atom has no meaning of its own. | "Title", "Label", "Value", "Placeholder" |
| **Molecules · Organisms · Agent Builder** | Realistic agent UI content that shows how the component is actually used. | "Delete conversation?" · "This conversation and its messages will be permanently removed." |

Actions always say what they do ("Delete", "Save changes", "Send feedback"), at every level.

## Voice

- **Plain and specific.** Say what happens: "Connect Google Drive" beats "Get started".
- **Sentence case** everywhere: titles, buttons, labels, menu items.
- **Short.** Titles fit on one line; descriptions are one or two sentences.
- **The agent speaks in the first person, briefly** ("I used your saved preference"); the
  product speaks neutrally ("Saved to memory").
- **Destructive confirmations** name the object and the consequence: "Delete “Q3 launch plan”?"
  · "Its 14 messages and 3 files will be permanently removed." · actions "Cancel" + "Delete".
- **Errors** say what went wrong and what to do next: "Couldn't reach Google Drive. Check your
  connection and try again."
- **Empty states** say what is empty and the next step: "No sources yet" · "Sources appear here
  when the assistant searches the web."
- **Status text** is a present participle while running ("Searching the web…") and past when
  done ("Searched 6 sites · 4.2s").
- **No real companies, people or products** in examples. Use the scenario below.

## The scenario (shared fiction)

Every higher-level story draws from one world so the kit reads as one product.

- **Product**: an AI workspace assistant, called **"Assistant"** in the UI (avatar: bot icon).
- **User**: **Maya Chen**, product lead at **Northwind Labs** (fictional), initials **MC**.
- **Project**: **"Q3 launch plan"**, a launch of **Northwind Sync** (fictional app).
- **Conversations**: "Q3 launch plan", "Competitor pricing research", "Onboarding email draft",
  "Weekly metrics review".
- **Files**: `q3-launch-plan.pdf` (2.4 MB), `pricing-research.xlsx` (380 KB),
  `launch-deck.pptx` (8.1 MB), `onboarding-email.docx` (42 KB), `hero-image.png` (1.2 MB).
- **Sources** (fictional domains): `marketpulse.example` · `devsurvey.example` ·
  `northwind.example/blog` · `analyticsweekly.example`.
- **Connected apps** (generic names): Calendar, Drive, Mail, Chat, Issue Tracker.
- **Tools**: `web_search`, `read_file`, `create_chart`, `send_email`, `query_database`.
- **Metrics**: Weekly active users **12,480** (+8.2%) · Trial conversion **4.6%** (−0.3 pt) ·
  Churn **2.1%** · Revenue **$48.2k**.
- **Memory**: "Prefers concise answers with bullet points" · "Works in Pacific Time" · "Team
  uses Issue Tracker for launch tasks".
- **Models** (generic): "Fast", "Balanced", "Deep reasoning".
- **People**: Maya Chen, Leo Park (design), Priya Shah (engineering), Sam Ortiz (marketing).

Typical prompts: "Summarize the Q3 launch plan", "Compare competitor pricing for Northwind Sync",
"Draft the onboarding email", "Chart weekly active users for the last 8 weeks".

## Per component

- Stories show one real moment, not a wall of variants with the same text. A Variants grid may
  keep short labels ("Default", "Outline") when the point is the comparison.
- Tests query the new copy; when copy changes, change the test with it.
- Docs (`parameters.guide`) say **when to use**, **when not to** (and what to use instead),
  **content** guidance and **accessibility** notes, in short bullets.
