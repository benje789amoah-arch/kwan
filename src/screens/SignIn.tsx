import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Screen, btnPrimary, field } from '../ui'

type Phase = 'phone' | 'code' | 'name'

export default function SignIn() {
  const { state, update } = useStore()
  const nav = useNavigate()
  const [phase, setPhase] = useState<Phase>('phone')
  const [phone, setPhone] = useState(state.phone)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  const digits = phone.replace(/\D/g, '').replace(/^0/, '')
  const phoneOk = digits.length === 9
  const codeOk = /^\d{4}$/.test(code)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (phase === 'phone' && phoneOk) setPhase('code')
    else if (phase === 'code' && codeOk) setPhase('name')
    else if (phase === 'name' && name.trim()) {
      update({ name: name.trim(), phone: digits })
      nav('/home', { replace: true })
    }
  }

  const titles: Record<Phase, string> = {
    phone: 'What is your number?',
    code: 'Enter the code',
    name: 'What should we call you?',
  }

  return (
    <Screen title={titles[phase]}>
      <form onSubmit={submit} className="mt-4 space-y-5">
        {phase === 'phone' && (
          <>
            <p className="text-muted">We text you a 4-digit code. No password to remember.</p>
            <label className="block">
              <span className="mb-2 block font-semibold">Phone number</span>
              <span className="flex gap-2">
                <span className="grid min-h-14 place-items-center rounded-2xl border border-line bg-card px-4 text-lg font-semibold">
                  +233
                </span>
                <input
                  className={field}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="24 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </span>
              <span className="mt-2 block text-sm text-muted">Starting with 0 is fine.</span>
            </label>
            <button className={btnPrimary} disabled={!phoneOk}>
              Text me a code
            </button>
          </>
        )}

        {phase === 'code' && (
          <>
            <p className="text-muted">
              Sent to +233 {digits}.{' '}
              <button type="button" className="font-semibold text-forest underline" onClick={() => setPhase('phone')}>
                Change number
              </button>
            </p>
            <label className="block">
              <span className="mb-2 block font-semibold">4-digit code</span>
              <input
                className={`${field} text-center text-3xl font-extrabold tracking-[0.5em]`}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </label>
            <p className="rounded-xl bg-sun-soft px-4 py-3 text-sm">Prototype: any 4 digits work.</p>
            <button className={btnPrimary} disabled={!codeOk}>
              Continue
            </button>
          </>
        )}

        {phase === 'name' && (
          <>
            <p className="text-muted">Your first name goes on your boarding pass.</p>
            <label className="block">
              <span className="mb-2 block font-semibold">First name</span>
              <input
                className={field}
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </label>
            <button className={btnPrimary} disabled={!name.trim()}>
              Finish
            </button>
          </>
        )}
      </form>
    </Screen>
  )
}
