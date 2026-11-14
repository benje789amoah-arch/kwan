import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { addDays, getRoute, getStop, ghs, nextMonday, niceDate, priceFor } from '../data'
import { useStore } from '../store'
import { Button, Field, Icon, PageTitle, Row, Screen, btnAccent, btnOnBrand, card, choice, radio } from '../ui'

const methods = ['MTN MoMo', 'Telecel Cash', 'AT Money']

type Phase = 'form' | 'waiting' | 'done'

export default function Pay() {
  const { state, update } = useStore()
  const { draft } = state
  const route = getRoute(draft.routeId)
  const input = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [method, setMethod] = useState(methods[0])
  const [number, setNumber] = useState(state.phone ? `0${state.phone}` : '')
  const [checked, setChecked] = useState(false)

  const ready = route && draft.homeId && draft.workId
  const price = ready ? priceFor(route, draft.trip, draft.plan) : null

  useEffect(() => {
    if (phase !== 'waiting' || !route || !price) return
    // Stands in for the rider approving the mobile money prompt on their phone.
    const timer = setTimeout(() => {
      const start = nextMonday()
      update({
        scenario: 'before',
        outcome: null,
        pass: {
          routeId: route.id,
          homeId: draft.homeId!,
          workId: draft.workId!,
          trip: draft.trip,
          plan: draft.plan,
          rides: price.rides,
          ridesLeft: price.rides,
          savesLeft: price.plan.saves,
          total: price.total,
          paidWith: method,
          code: `KW-${Math.floor(1000 + Math.random() * 9000)}`,
          startsOn: start.toISOString(),
          endsOn: addDays(start, price.plan.lastDayOffset).toISOString(),
        },
      })
      setPhase('done')
    }, 2600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === 'done' && state.pass) {
    const { pass } = state
    return (
      <main className="flex min-h-dvh flex-col bg-brand px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] text-on-brand">
        <span className="grid size-16 animate-pop place-items-center rounded-full bg-accent text-on-accent">
          <Icon name="check" size="xl" />
        </span>
        <PageTitle className="mt-6 text-4xl leading-tight font-extrabold">Your seat is reserved.</PageTitle>
        <p className="mt-3 text-lg text-on-brand/85">
          {ghs(pass.total)} paid with {pass.paidWith}. Your first ride is {niceDate(pass.startsOn)}.
        </p>
        <dl className="mt-6 rounded-2xl bg-on-brand/10 p-4">
          {[
            ['Boarding code', pass.code],
            ['Reserved seats', pass.rides],
            ['Valid until', niceDate(pass.endsOn)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-1.5">
              <dt className="text-on-brand/75">{label}</dt>
              <dd className="font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 flex items-start gap-2 text-sm text-on-brand/85">
          <Icon name="offline" className="mt-0.5" /> Your code is saved on this phone. It opens without data.
        </p>
        <div className="mt-auto space-y-3 pt-8">
          <Link to="/pass" replace className={btnAccent}>
            Show my boarding code
          </Link>
          <Link to="/home" replace className={btnOnBrand}>
            Go to home
          </Link>
        </div>
      </main>
    )
  }

  if (!ready || !price) return <Navigate to="/routes" replace />

  if (phase === 'waiting') {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center" role="status">
        <Icon name="spinner" size="xl" className="animate-spin text-brand-fg" />
        <PageTitle className="mt-6 text-2xl font-extrabold">Check your phone</PageTitle>
        <p className="mt-2 text-lg">
          Approve the {method} prompt for <strong>{ghs(price.total)}</strong> with your PIN.
        </p>
        <p className="mt-4 text-sm text-fg-muted">
          This can take up to a minute. Stay on this page. You will not be charged twice.
        </p>
        <Button variant="quiet" className="mt-8" onClick={() => setPhase('form')}>
          Cancel
        </Button>
      </main>
    )
  }

  const digits = number.replace(/\D/g, '').replace(/^0/, '')
  const numberError = !digits
    ? `Enter your ${method} number.`
    : digits.length !== 9
      ? 'That does not look right. A Ghana number has 10 digits, like 024 000 0000.'
      : ''

  function submit(e: FormEvent) {
    e.preventDefault()
    if (numberError) {
      setChecked(true)
      input.current?.focus()
      return
    }
    setPhase('waiting')
  }

  return (
    <Screen title="Pay" step={3} back="/routes">
      <form onSubmit={submit} noValidate>
        <section className={`${card} mt-2 p-4`}>
          <h2 className="text-lg font-extrabold">
            {route.from} to {route.to}
          </h2>
          <p className="text-sm text-fg-muted">
            {getStop(route, draft.homeId)!.name} to {getStop(route, draft.workId)!.name}
          </p>
          <div className="mt-2 border-t border-line pt-2">
            <Row label="Plan" value={`${price.plan.name}, ${price.trip.name.toLowerCase()}`} />
            <Row label="Reserved seats" value={price.rides} />
            <Row label="You pay" value={ghs(price.total)} strong />
          </div>
        </section>

        <fieldset className="mt-6">
          <legend className="mb-2 font-bold">Pay with</legend>
          <div className="space-y-2">
            {methods.map((m) => (
              <label key={m} className={choice}>
                <input type="radio" name="method" className={radio} checked={method === m} onChange={() => setMethod(m)} />
                <span className="font-semibold">{m}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6">
          <Field
            label={`${method} number`}
            hint="We send a prompt to this number. You approve with your PIN."
            error={checked ? numberError : ''}
            inputRef={input}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="024 000 0000"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onBlur={() => setChecked(true)}
          />
        </div>

        <Button className="mt-6">Pay {ghs(price.total)}</Button>
        <p className="mt-3 text-center text-sm text-fg-muted">Prototype: no money moves.</p>
      </form>
    </Screen>
  )
}
