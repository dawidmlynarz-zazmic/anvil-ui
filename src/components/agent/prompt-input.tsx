import * as React from 'react'

import { cn } from '@/lib/utils'
import { VoiceWaveform } from '@/components/agent/voice-waveform'
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, Icon, MicIcon } from '@/components/ui/icon'

// Figma Agent Builder › Core Kit › prompt input (10663:2292), built on Input Group: the composer.
// --background, --input stroke (1.5px --border-action while focused), radius 2xl, 12px padding,
// 8px gap. `size` default: attachment tray, a growing textarea (text/base, --foreground-subtle
// placeholder) and a toolbar (leading action + tools | token count text/xs, voice, send) · compact:
// one row that grows to 4 lines (leading | textarea | voice, send). Figma state → props: empty /
// typing = the value (send is disabled while empty) · file-attached = `attachments` · voice-active
// = `listening` (the waveform replaces the text, voice pressed) · streaming-disabled = `status`
// streaming (textarea off, "Waiting for response", send becomes Stop). Enter sends, Shift+Enter
// adds a line. Figma show attach / tools / voice / token count = pass `leading`, `tools`, `onVoice`,
// `tokenCount`.

type PromptInputProps = Omit<React.ComponentProps<'form'>, 'onSubmit' | 'onChange'> & {
  size?: 'default' | 'compact'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Sends the prompt; the field clears when uncontrolled. */
  onSubmit?: (value: string) => void
  placeholder?: string
  /** streaming: input disabled, send becomes Stop. */
  status?: 'idle' | 'streaming'
  onStop?: () => void
  /** The attachment tray (Figma file-attached), e.g. an AttachmentGroup. */
  attachments?: React.ReactNode
  /** Leading action: the attach button or Attachment Menu trigger. */
  leading?: React.ReactNode
  /** Tools menu trigger, after the leading action (default size). */
  tools?: React.ReactNode
  tokenCount?: React.ReactNode
  /** Shows the voice button. */
  onVoice?: () => void
  /** Figma voice-active: the waveform replaces the text. */
  listening?: boolean
  /** Lets an empty prompt send (e.g. attachments only). */
  canSendEmpty?: boolean
}

function PromptInput({
  size = 'default',
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSubmit,
  placeholder = 'Ask anything, or / for commands',
  status = 'idle',
  onStop,
  attachments,
  leading,
  tools,
  tokenCount,
  onVoice,
  listening = false,
  canSendEmpty = false,
  className,
  ...props
}: PromptInputProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const setValue = (next: string) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const streaming = status === 'streaming'
  const compact = size === 'compact'
  const canSend = !streaming && (canSendEmpty || value.trim().length > 0)

  const submit = () => {
    if (!canSend) return
    onSubmit?.(value.trim())
    if (valueProp === undefined) setInner('')
  }

  const field = listening ? (
    <div className="flex min-h-6 flex-1 items-center py-1">
      <VoiceWaveform label="Listening" />
    </div>
  ) : (
    <textarea
      aria-label="Prompt"
      rows={1}
      value={value}
      disabled={streaming}
      placeholder={streaming ? 'Waiting for response' : placeholder}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault()
          submit()
        }
      }}
      className={cn(
        'min-h-6 w-full min-w-0 flex-1 resize-none bg-transparent px-1 py-1 type-text-base-normal text-foreground outline-none [field-sizing:content] placeholder:text-foreground-subtle disabled:placeholder:text-foreground-disabled',
        compact ? 'max-h-26' : 'max-h-60',
      )}
    />
  )

  const right = (
    <div className="flex shrink-0 items-center gap-2">
      {!compact && tokenCount && (
        <span className="type-text-xs-normal text-muted-foreground">{tokenCount}</span>
      )}
      {onVoice && (
        <Button
          type="button"
          variant="outline"
          intent="neutral"
          size="icon-sm"
          shape={compact ? 'circle' : 'default'}
          aria-label={listening ? 'Stop voice input' : 'Voice input'}
          aria-pressed={listening}
          disabled={streaming}
          onClick={onVoice}
        >
          <Icon icon={MicIcon} />
        </Button>
      )}
      {streaming ? (
        <Button
          type="button"
          variant="outline"
          intent="neutral"
          size="icon-sm"
          shape={compact ? 'circle' : 'default'}
          aria-label="Stop"
          onClick={onStop}
        >
          <span className="size-3 rounded-2xs bg-agent" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon-sm"
          shape={compact ? 'circle' : 'default'}
          aria-label="Send"
          disabled={!canSend && !listening}
        >
          <Icon icon={ArrowUpIcon} />
        </Button>
      )}
    </div>
  )

  return (
    <form
      data-slot="prompt-input"
      data-size={size}
      data-status={status}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className={cn(
        'flex w-full max-w-(--shell-thread-max) flex-col gap-2 rounded-2xl bg-background p-3 text-foreground inset-ring inset-ring-input',
        'transition-shadow duration-(--duration-fast) focus-within:inset-ring-[1.5px] focus-within:inset-ring-border-action',
        streaming && 'inset-ring-[1.5px] inset-ring-border-action',
        compact && 'p-1.5',
        className,
      )}
      {...props}
    >
      {attachments && (
        <div className={cn('flex flex-wrap gap-2', compact && 'flex-col items-start p-1.5')}>
          {attachments}
        </div>
      )}
      {compact ? (
        <div className="flex items-end gap-2">
          <div className="flex shrink-0 items-center">{leading}</div>
          {field}
          {right}
        </div>
      ) : (
        <>
          {field}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {leading}
              {tools}
            </div>
            {right}
          </div>
        </>
      )}
    </form>
  )
}

export { PromptInput, type PromptInputProps }
