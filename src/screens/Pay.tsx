import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { addDays, getRoute, getStop, ghs, nextMonday, niceDate, priceFor } from '../data'
import { useStore } from '../store'
import { Icon, Row, Screen, btnAccent, btnPrimary, btnQuiet, choice, field } from '../ui'

const methods = ['MTN MoMo', 'Telecel Cash', 'AT Money']

type Phase = 'form' | 'waiting' | 'done'

export default function Pay() {
  const { state, update } = useStore()
  const { draft } = state
  const route = getRoute(draft.routeId)
  const [phase, setPhase] = useState<Phase>('form')
  const [method, setMethod] = useState(methods[0])
  const [number, setNumber] = useState(state.phone ? `0${state.phone}` : '')

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
    return (
      <div className="flex min-h-dvh flex-col bg-forest px-6 pt-10 pb-6 text-white">
        <span className="grid size-16 place-items-center rounded-full bg-sun text-ink">
          <Icon name="check" size={34} />
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight">Your seat is reserved.</h1>
        <p className="mt-3 text-lg text-white/85">
          {ghs(state.pass.total)} paid with {state.pass.paidWith}. Your first ride is {niceDate(state.pass.startsOn)}.
        </p>
        <div className="mt-6 rounded-3xl bg-white/10 p-4">
          {[
            ['Boarding code', state.pass.code],
            ['Reserved seats', state.pass.rides],
            ['Valid until', niceDate(state.pass.endsOn)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-1.5">
              <span className="text-white/75">{label}</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-white/75">Your code is saved on this phone. It opens without data.</p>
        <div className="mt-auto space-y-3 pt-8">
          <Link to="/pass" replace className={btnAccent}>
            Show my boarding code
          </Link>
          <Link to="/home" replace className={btnOnDark}>
            Go to home
          </Link>
        </div>
      </div>
    )
  }

  if (!ready || !price) return <Navigate to="/routes" replace />

  if (phase === 'waiting') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center" role="status">
        <span className="size-14 animate-spin rounded-full border-4 border-line border-t-forest" aria-hidden="true" />
        <h1 className="mt-6 text-2xl font-extrabold">Check your phone</h1>
        <p className="mt-2 text-lg">
          Approve the {method} prompt for <strong>{ghs(price.total)}</strong> with your PIN.
        </p>
        <p className="mt-4 text-sm text-muted">
          This can take up to a minute. Stay on this page. You will not be charged twice.
        </p>
        <button className={`${btnQuiet} mt-8`} onClick={() => setPhase('form')}>
          Cancel
        </button>
      </div>
    )
  }

  const digits = number.replace(/\D/g, '').replace(/^0/, '')
  const numberOk = digits.length === 9

  function submit(e: FormEvent) {
    e.preventDefault()
    if (numberOk) setPhase('waiting')
  }

  return (
    <Screen title="Pay" step={4}>
      <form onSubmit={submit}>
        <section className="mt-2 rounded-3xl border border-line bg-card p-4">
          <h2 className="text-lg font-extrabold">
            {route.from} to {route.to}
          </h2>
          <p className="text-sm text-muted">
            {getStop(route, draft.homeId)!.name} ⇄ {getStop(route, draft.workId)!.name}
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
                <input
                  type="radio"
                  name="method"
                  className="size-5 accent-forest"
                  checked={method === m}
                  onChange={() => setMethod(m)}
                />
                <span className="font-semibold">{m}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-6 block">
          <span className="mb-2 block font-bold">{method} number</span>
          <input
            className={field}
            type="tel"
            inputMode="numeric"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="024 000 0000"
          />
          <span className="mt-2 block text-sm text-muted">We send a prompt to this number. You approve with your PIN.</span>
        </label>

        <button className={`${btnPrimary} mt-6`} disabled={!numberOk}>
          Pay {ghs(price.total)}
        </button>
        <p className="mt-3 text-center text-sm text-muted">Prototype: no money moves.</p>
      </form>
    </Screen>
  )
}

const btnOnDark =
  'inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/30 px-5 text-base font-bold text-white'
