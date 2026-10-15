# Screen-reader pass

A person runs this with VoiceOver (macOS, Safari) and one Windows reader (NVDA with Firefox or Chrome). Takes
about 90 minutes for the first round. Record what you hear in the table at the end and file the problems.

## Set-up

Run Storybook, open the story in its own tab (`iframe.html?id=<story-id>&viewMode=story`), turn the reader on,
and use only the keyboard. Test light and dark is not needed; test **one** story per row, then the Showroom.

## For every component

- It is reachable with Tab in a sensible order and Shift+Tab goes back; focus is always visible.
- Its role and name are announced once and read naturally (not "button button", not the file name).
- State is announced: expanded / collapsed, pressed, checked, selected, disabled, invalid, busy.
- Changes are announced when they should be (a toast, a loading status, a new message) and not when they should
  not be (no repeated chatter while typing or streaming).
- Escape closes overlays and focus returns to the trigger; focus never lands on `<body>`.
- Nothing reads twice (a hidden duplicate, an icon with a label next to text that says the same).

## Priority list (do these first)

| Component | Story id | Listen for |
| --- | --- | --- |
| Dialog and Alert Dialog | `design-system-organisms-dialog--default` | Title and description announced on open; focus trap; Escape returns focus |
| Command Palette | `agent-builder-in-page-assist-command-palette--default` | Input role, result count, active option announced as arrows move |
| Combobox | `design-system-organisms-combobox--default` | Expanded state, active option, selection |
| Availability Calendar | `agent-builder-catalog-scheduling-availability-calendar--default` | Day names with availability and price; arrows move between days; month change |
| Slot List and Choice Card | `agent-builder-catalog-scheduling-slot-list--default` | Radio group name, each slot's full label, disabled sold-out slots |
| Chat Shell and Message Row | `agent-builder-surfaces-chat-shell--full` | Who said what, when; new assistant message announced once |
| Prompt Input | `agent-builder-input-prompt-input--default` | Name, send disabled state, attachment add and remove |
| Message Actions | `design-system-molecules-message-actions--default` | Toolbar name, arrow keys, Good / Bad response pressed state |
| Approval Card | `agent-builder-actions-approval-card--default` | Status announced; Approve and Deny named with their action |
| Task Progress (Progress Timeline) | `agent-builder-tasks-progress-timeline--default` | Step statuses in words; pause / resume announced |
| Tabs, Accordion, Carousel | `design-system-molecules-tabs--default` | Selected tab, expanded state, slide position |
| Toast | `design-system-molecules-toast--default` | Announced without stealing focus |
| The Showroom | `showroom--assistant` | A whole conversation: flows, approvals, a long answer streaming |

## Results

| Date | Reader + browser | Component | What you heard | Problem? | Issue |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
