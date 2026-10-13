import { useCallback, useEffect, useMemo, useState } from 'react'

import { CommandPalette, CommandPaletteItem } from '@/components/agent/command-palette'
import {
  ChatShell,
  ChatShellComposer,
  ChatShellHeader,
  ChatShellThread,
  type ChatSurface,
} from '@/components/agent/chat-shell'
import { Launcher } from '@/components/agent/launcher'
import { PromptInput } from '@/components/agent/prompt-input'
import { StarterPromptCard } from '@/components/agent/starter-prompt-card'
import { WelcomeState } from '@/components/agent/welcome-state'
import { IconTile } from '@/components/anvil/icon-tile'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CommandGroup } from '@/components/ui/command'
import {
  BotIcon,
  Icon,
  KeyboardIcon,
  MonitorIcon,
  MoonIcon,
  PanelRightIcon,
  PackageIcon,
  PartyPopperIcon,
  RotateCcwIcon,
  SmartphoneIcon,
  SparklesIcon,
  SquarePenIcon,
  SunIcon,
  TelescopeIcon,
  UserRoundIcon,
  MessageSquareIcon,
  MaximizeIcon,
} from '@/components/ui/icon'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'

import { fallback, flows, intents } from './brain'
import { useShowroomChat, type AppActions, type Speed } from './engine'
import { HostMock } from './host'
import { ScrollToStart, Thread } from './thread'

// The Showroom: a scripted assistant you can talk to, in every chat shell, on desktop or mobile, in light or
// dark. State: device · theme · shell · reduce motion (remembered in local storage), the conversation, and
// two dialogs (Start over, the ⌘K actions menu). See docs/showroom.md for the flows and the easter eggs.

type Device = 'desktop' | 'mobile'
type Theme = 'light' | 'dark'
type Shell = 'full-screen' | 'side-panel' | 'popover'

const KEY = 'anvil-showroom'
const read = (): Partial<{ device: Device; theme: Theme; shell: Shell; reduced: boolean }> => {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

const STARTERS = [
  {
    icon: TelescopeIcon,
    title: 'Research a task',
    description: 'Questions, a brief, a plan and live progress.',
    prompt: 'Research how competitors price team plans',
  },
  {
    icon: PackageIcon,
    title: 'Find a daypack',
    description: 'An offer, an approval and a delivery tracker.',
    prompt: 'Find me a waterproof daypack under $150',
  },
  {
    icon: UserRoundIcon,
    title: 'Talk to a person',
    description: 'A handoff with a queue and a human joining.',
    prompt: 'I’d like to talk to a person',
  },
]

function Panel({
  surface,
  turns,
  emit,
  onSend,
  onNewChat,
}: {
  surface: ChatSurface
  turns: ReturnType<typeof useShowroomChat>['turns']
  emit: ReturnType<typeof useShowroomChat>['emit']
  onSend: (text: string) => void
  onNewChat: () => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <ChatShell surface={surface}>
      <ChatShellHeader
        media={<IconTile icon={BotIcon} tone="agent" size="sm" shape="circle" />}
        title="Showroom assistant"
        subtitle="Scripted demo · online"
        online
        actions={
          <Button variant="ghost" intent="neutral" size="icon-sm" aria-label="Start over" onClick={onNewChat}>
            <Icon icon={SquarePenIcon} />
          </Button>
        }
      />
      <ChatShellThread>
        {turns.length === 0 ? (
          <>
            <ScrollToStart />
            <WelcomeState
              greeting="Hi, I’m the Showroom assistant"
              subtitle="A scripted demo of Anvil UI. Pick something, or ask anything."
            >
              {STARTERS.map((starter) => (
                <StarterPromptCard
                  key={starter.title}
                  icon={starter.icon}
                  title={starter.title}
                  description={starter.description}
                  onClick={() => onSend(starter.prompt)}
                />
              ))}
            </WelcomeState>
          </>
        ) : (
          <Thread turns={turns} emit={emit} />
        )}
      </ChatShellThread>
      <ChatShellComposer disclaimer="Scripted, so it can’t be wrong, only silly. Try “help” or press ⌘K.">
        <PromptInput
          aria-label="Message the assistant"
          size={surface === 'popover' || surface === 'mobile' ? 'compact' : 'default'}
          placeholder="Ask anything, or try “help”"
          value={draft}
          onValueChange={setDraft}
          onSubmit={(text) => {
            onSend(text)
            setDraft('')
          }}
        />
      </ChatShellComposer>
    </ChatShell>
  )
}

export function Showroom({
  speed = 'normal',
  persist = true,
  defaultDevice = 'desktop',
  defaultShell = 'side-panel',
}: {
  speed?: Speed
  /** Remember device, theme, shell and motion in local storage. */
  persist?: boolean
  defaultDevice?: Device
  defaultShell?: Shell
}) {
  const saved = useMemo(() => (persist ? read() : {}), [persist])
  const [device, setDevice] = useState<Device>(saved.device ?? defaultDevice)
  const [shell, setShell] = useState<Shell>(saved.shell ?? defaultShell)
  const [theme, setTheme] = useState<Theme>(
    () => saved.theme ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
  )
  const [reduced, setReduced] = useState(saved.reduced ?? false)
  const [launcherOpen, setLauncherOpen] = useState(true)
  const [resetOpen, setResetOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // The popover closes when you click the top bar, so every change of setup opens it again.
  const changeTheme = useCallback((next: Theme) => {
    setTheme(next)
    setLauncherOpen(true)
  }, [])
  const changeDevice = useCallback((next: Device) => {
    setDevice(next)
    setLauncherOpen(true)
  }, [])
  const changeShell = useCallback((next: Shell) => {
    setShell(next)
    setLauncherOpen(true)
  }, [])
  const app = useMemo<AppActions>(
    () => ({
      setTheme: changeTheme,
      setDevice: changeDevice,
      setShell: changeShell,
      requestReset: () => setResetOpen(true),
    }),
    [changeTheme, changeDevice, changeShell],
  )
  const { turns, send, emit, reset } = useShowroomChat({
    intents,
    fallback,
    speed: reduced ? 'fast' : speed,
    app,
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  useEffect(() => {
    document.documentElement.classList.toggle('no-motion', reduced)
    return () => document.documentElement.classList.remove('no-motion')
  }, [reduced])
  useEffect(() => {
    if (!persist) return
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ device, theme, shell, reduced }))
    } catch {
      // Storage can be blocked (private window): the Showroom still works.
    }
  }, [persist, device, theme, shell, reduced])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const sendText = useCallback((text: string) => send(text), [send])
  const panel = (s: ChatSurface) => (
    <Panel surface={s} turns={turns} emit={emit} onSend={sendText} onNewChat={() => setResetOpen(true)} />
  )

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-muted/30 text-foreground">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-background px-4 py-2.5">
        <div className="flex items-center gap-2">
          <IconTile icon={SparklesIcon} tone="agent" size="sm" />
          <div className="flex flex-col">
            <h1 className="type-text-sm-semibold text-foreground">Showroom</h1>
            <p className="type-text-xs-normal text-muted-foreground">Anvil UI, with a scripted assistant</p>
          </div>
        </div>
        <div className="ms-auto flex items-center gap-3 max-md:w-full max-md:overflow-x-auto max-md:pb-1 md:flex-wrap [&>*]:shrink-0">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={device}
            onValueChange={(v) => v && changeDevice(v as Device)}
            aria-label="Device"
          >
            <ToggleGroupItem value="desktop" aria-label="Desktop">
              <Icon icon={MonitorIcon} />
              Desktop
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" aria-label="Mobile">
              <Icon icon={SmartphoneIcon} />
              Mobile
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={theme}
            onValueChange={(v) => v && changeTheme(v as Theme)}
            aria-label="Theme"
          >
            <ToggleGroupItem value="light" aria-label="Light">
              <Icon icon={SunIcon} />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark">
              <Icon icon={MoonIcon} />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={device === 'mobile' ? '' : shell}
            disabled={device === 'mobile'}
            onValueChange={(v) => v && changeShell(v as Shell)}
            aria-label="Chat shell"
          >
            <ToggleGroupItem value="full-screen" aria-label="Full screen">
              <Icon icon={MaximizeIcon} />
              Full screen
            </ToggleGroupItem>
            <ToggleGroupItem value="side-panel" aria-label="Side panel">
              <Icon icon={PanelRightIcon} />
              Side panel
            </ToggleGroupItem>
            <ToggleGroupItem value="popover" aria-label="Popover">
              <Icon icon={MessageSquareIcon} />
              Popover
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="flex items-center gap-2">
            <Switch id="showroom-motion" size="sm" checked={reduced} onCheckedChange={setReduced} />
            <Label htmlFor="showroom-motion" className="type-text-xs-normal text-muted-foreground">
              Reduce motion
            </Label>
          </div>
          <Button variant="outline" intent="neutral" size="sm" onClick={() => setPaletteOpen(true)}>
            <Icon icon={KeyboardIcon} />
            Actions
            <kbd className="ms-1 type-text-xs-normal text-muted-foreground">⌘K</kbd>
          </Button>
          <Button variant="outline" intent="neutral" size="sm" onClick={() => setResetOpen(true)}>
            <Icon icon={RotateCcwIcon} />
            Start over
          </Button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 items-stretch justify-center p-4">
        <h2 className="sr-only">Chat with the assistant</h2>
        {device === 'mobile' ? (
          <div className="h-full max-h-195 w-97.5 max-w-full overflow-hidden rounded-3xl border bg-background shadow-elevation-raised">
            {panel('mobile')}
          </div>
        ) : shell === 'full-screen' ? (
          <div className="h-full w-full max-w-5xl overflow-hidden rounded-2xl border bg-background shadow-elevation-raised">
            {panel('full-screen')}
          </div>
        ) : shell === 'side-panel' ? (
          <div className="flex h-full w-full min-w-0 overflow-hidden rounded-2xl border bg-background shadow-elevation-raised">
            <div className="min-w-0 flex-1">
              <HostMock />
            </div>
            <div className="h-full w-96 max-w-[60%] shrink-0 border-s">{panel('side-panel')}</div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-2xl border bg-background shadow-elevation-raised">
            <HostMock />
            <Launcher open={launcherOpen} onOpenChange={setLauncherOpen} label="Open the assistant">
              {panel('popover')}
            </Launcher>
          </div>
        )}
      </main>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Icon icon={RotateCcwIcon} />
            </AlertDialogMedia>
            <AlertDialogTitle>Start over?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the conversation and stops anything that is running. The setup (device, theme and
              shell) stays as it is.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep chatting</AlertDialogCancel>
            <AlertDialogAction intent="destructive" onClick={reset}>
              Reset chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Showroom actions"
        description="Jump to a conversation, try something silly or change the setup"
        placeholder="Search actions…"
        commandProps={{ shouldFilter: true }}
        legend={null}
      >
        <CommandGroup heading="Conversations">
          {flows.map((flow) => (
            <CommandPaletteItem
              key={flow.id}
              kind="action"
              icon={
                flow.id === 'research' ? TelescopeIcon : flow.id === 'order' ? PackageIcon : UserRoundIcon
              }
              label={flow.title ?? flow.id}
              meta={flow.hint}
              onSelect={() => {
                setPaletteOpen(false)
                send(flow.prompt ?? flow.id)
              }}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Something silly">
          {[
            'Tell me a joke',
            'Knock knock',
            'Rock paper scissors',
            'Launch the rocket',
            'Make me a sandwich',
          ].map((text) => (
            <CommandPaletteItem
              key={text}
              kind="page"
              icon={PartyPopperIcon}
              label={text}
              onSelect={() => {
                setPaletteOpen(false)
                send(text)
              }}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Setup">
          <CommandPaletteItem
            kind="page"
            icon={theme === 'dark' ? SunIcon : MoonIcon}
            label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            onSelect={() => {
              setPaletteOpen(false)
              changeTheme(theme === 'dark' ? 'light' : 'dark')
            }}
          />
          <CommandPaletteItem
            kind="page"
            icon={device === 'desktop' ? SmartphoneIcon : MonitorIcon}
            label={device === 'desktop' ? 'Switch to mobile' : 'Switch to desktop'}
            onSelect={() => {
              setPaletteOpen(false)
              changeDevice(device === 'desktop' ? 'mobile' : 'desktop')
            }}
          />
          <CommandPaletteItem
            kind="page"
            icon={RotateCcwIcon}
            label="Start over"
            onSelect={() => {
              setPaletteOpen(false)
              setResetOpen(true)
            }}
          />
        </CommandGroup>
      </CommandPalette>
    </div>
  )
}
