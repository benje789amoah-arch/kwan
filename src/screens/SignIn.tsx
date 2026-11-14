import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Button, Field, Note, Screen } from '../ui'

type Phase = 'phone' | 'code' | 'name'

const titles: Record<Phase, string> = {
  phone: 'What is your number?',
  code: 'Enter the code',
  name: 'What should we call you?',
}

export default function SignIn() {
  const { state, update } = useStore()
  const nav = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('phone')
  const [phone, setPhone] = useState(state.phone ? `0${state.phone}` : '')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  // Errors appear after the rider leaves a field or tries to continue, not while they are still typing.
  const [checked, setChecked] = useState(false)
  const [sending, setSending] = useState(false)

  const digits = phone.replace(/\D/g, '').replace(/^0/, '')

  const errors: Record<Phase, string> = {
    phone: !digits
      ? 'Enter your phone number.'
      : digits.length !== 9
        ? 'That does not look right. A Ghana number has 10 digits, like 024 000 0000.'
        : '',
    code: /^\d{4}$/.test(code) ? '' : 'Enter the 4 digits from the text message.',
    name: name.trim() ? '' : 'Enter your first name.',
  }
  const error = checked ? errors[phase] : ''

  useEffect(() => {
    input.current?.focus()
  }, [phase])

  useEffect(() => {
    if (!sending) return
    // Stands in for the text message being sent.
    const timer = setTimeout(() => {
      setSending(false)
      setChecked(false)
      setPhase('code')
    }, 800)
    return () => clearTimeout(timer)
  }, [sending])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (errors[phase]) {
      setChecked(true)
      input.current?.focus()
      return
    }
    setChecked(false)
    if (phase === 'phone') setSending(true)
    else if (phase === 'code') setPhase('name')
    else {
      update({ name: name.trim(), phone: digits })
      nav('/home', { replace: true })
    }
  }

  return (
    <Screen title={titles[phase]} back="/">
      <form onSubmit={submit} noValidate className="mt-4 space-y-5">
        {phase === 'phone' && (
          <>
            <p className="text-fg-muted">We text you a 4-digit code. No password to remember.</p>
            <Field
              label="Phone number"
              prefix="+233"
              hint="Starting with 0 is fine."
              error={error}
              inputRef={input}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="024 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => phone && setChecked(true)}
            />
            <Button busy={sending}>{sending ? 'Sending the code' : 'Text me a code'}</Button>
          </>
        )}

        {phase === 'code' && (
          <>
            <p className="text-fg-muted">
              Sent to +233 {digits}.{' '}
              <button
                type="button"
                className="cursor-pointer font-semibold text-brand-fg underline"
                onClick={() => {
                  setChecked(false)
                  setPhase('phone')
                }}
              >
                Change number
              </button>
            </p>
            <Field
              label="4-digit code"
              error={error}
              inputRef={input}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              className="text-center text-3xl font-extrabold tracking-[0.5em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <Note tone="warn" icon="info">
              Prototype: any 4 digits work.
            </Note>
            <Button>Continue</Button>
          </>
        )}

        {phase === 'name' && (
          <>
            <p className="text-fg-muted">Your first name goes on your boarding pass.</p>
            <Field
              label="First name"
              error={error}
              inputRef={input}
              autoComplete="given-name"
              autoCapitalize="words"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button>Finish</Button>
          </>
        )}
      </form>
    </Screen>
  )
}
