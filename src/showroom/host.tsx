import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChartColumnIcon, CloudIcon, Icon, RefreshCwIcon, ShieldCheckIcon } from '@/components/ui/icon'

// A stand-in host product the assistant lives in (shown behind the side panel and the popover). Decorative:
// inert and hidden from assistive tech, so it never competes with the real conversation.

const FEATURES = [
  { icon: RefreshCwIcon, title: 'Sync that keeps up', text: 'Edits land on every device in under a second.' },
  {
    icon: ShieldCheckIcon,
    title: 'Safe by default',
    text: 'End-to-end encryption and a full version history.',
  },
  { icon: ChartColumnIcon, title: 'Team insights', text: 'See who changed what, and when, at a glance.' },
]

export function HostMock() {
  return (
    <div aria-hidden inert className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/40">
      <div className="flex items-center gap-4 border-b bg-background px-6 py-3">
        <span className="flex items-center gap-2 type-text-sm-semibold text-foreground">
          <Icon icon={CloudIcon} className="text-primary" />
          Northwind Sync
        </span>
        <nav className="ms-6 hidden gap-5 type-text-sm-normal text-muted-foreground md:flex">
          <span>Product</span>
          <span>Pricing</span>
          <span>Customers</span>
          <span>Docs</span>
        </nav>
        <Button size="sm" className="ms-auto">
          Start free
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-8 overflow-hidden px-8 py-10">
        <div className="flex max-w-xl flex-col gap-3">
          <Badge variant="subtle" tone="info" shape="pill" size="sm" className="w-fit">
            New · Team history
          </Badge>
          <h2 className="type-heading-3xl text-foreground">Your files, always in sync.</h2>
          <p className="type-text-base-normal text-muted-foreground">
            Northwind Sync keeps every file, on every device, exactly where your team left it.
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="lg">Get started</Button>
            <Button size="lg" variant="outline" intent="neutral">
              See pricing
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="min-w-0 gap-2 p-4">
              <Icon icon={feature.icon} className="text-primary" />
              <p className="type-text-sm-semibold text-foreground">{feature.title}</p>
              <p className="type-text-sm-normal text-muted-foreground">{feature.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
